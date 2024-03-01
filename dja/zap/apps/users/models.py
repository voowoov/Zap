import datetime
import logging
import zoneinfo

from django.contrib import auth
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import PermissionsMixin
from django.db import models, transaction
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.translation import gettext_lazy as _
from zap.apps.accounts.models import ClientAccount, Param, PhoneNumbers
from zap.apps.filespro.models import FilesproFolder

logger = logging.getLogger(__name__)

listtemp = sorted(zoneinfo.available_timezones())
timezone_canada = [("Auto", "Auto")]  # init
for i in range(0, len(listtemp)):
    if listtemp[i][:3] in ["Can", "US/"]:
        timezone_canada.append((listtemp[i], _(listtemp[i])))
timezone_not_canada = []
for i in range(0, len(listtemp)):
    if listtemp[i][:3] not in ["Can", "US/"]:
        timezone_not_canada.append((listtemp[i], listtemp[i]))
TIMEZONE_CHOICES = timezone_canada + timezone_not_canada


def uploadPathFunctionAvatar(instance, filename):
    return "avatars/%s" % get_random_string(8) + ".png"


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(
        self, email, password, client_account, create_client_account, **extra_fields
    ):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.password = make_password(password)
        user.filespro_folder = FilesproFolder.create(10000000)
        if create_client_account:
            with transaction.atomic():
                param = Param.objects.first()
                new_acc_num = param.last_client_account_number + 1
                param.last_client_account_number = new_acc_num
                param.save()
                s = ClientAccount(account_number=new_acc_num)
                s.save()
                user.client_account = s
                user.save(using=self._db)
        else:
            user.client_account = client_account
            user.save(using=self._db)
        return user

    def create_user(
        self, email=None, password=None, client_account=None, **extra_fields
    ):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        if client_account:
            create_client_account = False
        else:
            create_client_account = True
        return self._create_user(
            email, password, client_account, create_client_account, **extra_fields
        )

    def create_superuser(
        self, email=None, password=None, client_account=None, **extra_fields
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(
            email, password, client_account, create_client_account=True, **extra_fields
        )

    def with_perm(
        self, perm, is_active=True, include_superusers=True, backend=None, obj=None
    ):
        if backend is None:
            backends = auth._get_backends(return_tuples=True)
            if len(backends) == 1:
                backend, _ = backends[0]
            else:
                raise ValueError(
                    "You have multiple authentication backends configured and "
                    "therefore must provide the `backend` argument."
                )
        elif not isinstance(backend, str):
            raise TypeError(
                "backend must be a dotted import path string (got %r)." % backend
            )
        else:
            backend = auth.load_backend(backend)
        if hasattr(backend, "with_perm"):
            return backend.with_perm(
                perm,
                is_active=is_active,
                include_superusers=include_superusers,
                obj=obj,
            )
        return self.none()


class User(AbstractBaseUser, PermissionsMixin):

    client_account = models.ForeignKey(
        ClientAccount, on_delete=models.PROTECT, blank=True
    )

    first_name = models.CharField(max_length=20, blank=True)
    last_name = models.CharField(max_length=20, blank=True)
    role_en = models.CharField(_("role"), max_length=150, blank=True)
    role_fr = models.CharField(_("role"), max_length=150, blank=True)
    avatar = models.ImageField(
        upload_to=uploadPathFunctionAvatar, null=True, blank=True
    )
    phone_numbers = models.ManyToManyField(PhoneNumbers, blank=True)
    is_closed = models.BooleanField(_("closed"), default=False)

    filespro_folder = models.ForeignKey(
        FilesproFolder, on_delete=models.PROTECT, blank=True
    )

    email = models.EmailField(
        verbose_name=_("email address"),
        max_length=35,
        unique=True,
    )
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can log into this admin site."),
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Designates whether this user should be treated as active and verified."
        ),
    )
    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)

    objects = UserManager()

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)
