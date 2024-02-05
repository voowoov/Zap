import datetime
import os
import random
import string
import zoneinfo

from django import forms
from django.contrib import auth
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import PermissionsMixin
from django.db import models, transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from zap.apps.accounts.models import Account, Param

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
# TIMEZONE_CHOICES = [(listtemp[i], _(listtemp[i])) for i in range(0, len(listtemp))]
NAME_PREFIX_CHOICES = [
    ("A", ""),
    ("B", _("Mr.")),
    ("C", _("Ms.")),
    ("E", "Dr."),
    ("F", "Prof."),
]


def uploadPathFunctionAvatar(instance, filename):
    randomN = "".join(random.choices(string.ascii_letters + string.digits, k=8))
    return "avatars/%s" % randomN + ".png"
    # return os.path.join("public/%s/" % randomN, filename)


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, account, create_account, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.password = make_password(password)
        if create_account:
            with transaction.atomic():
                param = Param.objects.first()
                new_acc_num = param.last_account_number + 1
                param.last_account_number = new_acc_num
                param.save()
                s = Account(account_number=new_acc_num)
                s.save()
                user.account = s
                user.save(using=self._db)
        else:
            user.account = account
            user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, account=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        if account:
            create_account = False
        else:
            create_account = True
        return self._create_user(
            email, password, account, create_account, **extra_fields
        )

    def create_superuser(self, email=None, password=None, account=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(
            email, password, account, create_account=True, **extra_fields
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
    #########  Added fields    #####################
    account = models.ForeignKey(Account, on_delete=models.PROTECT, blank=True)
    is_responsible = models.BooleanField(
        _("responsible of the account"),
        default=False,
        help_text=_("Designates whether the user have write permission to the account"),
    )
    prefix_title = models.CharField(
        max_length=1, default="A", choices=NAME_PREFIX_CHOICES
    )
    first_name = models.CharField(max_length=20, blank=True)
    middle_name = models.CharField(max_length=20, blank=True)
    last_name = models.CharField(max_length=20, blank=True)
    suffix_title = models.CharField(max_length=15, blank=True)
    phone = models.CharField(max_length=10, blank=True)
    phone_ext = models.CharField(max_length=4, blank=True)
    verified_phone_date = models.DateTimeField(blank=True, null=True)
    avatar = models.ImageField(
        upload_to=uploadPathFunctionAvatar, null=True, blank=True
    )
    social_name = models.CharField(max_length=255, blank=True)
    social_desc = models.CharField(max_length=255, blank=True)
    log = models.TextField(blank=True)

    ######### Original fields  #####################
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
    is_closed = models.BooleanField(
        _("account closed"),
        default=False,
        help_text=_("Designates whether the user account is closed."),
    )
    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)
    date_closed = models.DateTimeField(_("date closed"), blank=True, null=True)
    time_zone = models.CharField(
        max_length=32, default="Auto", choices=TIMEZONE_CHOICES
    )

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

    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        """
        full_name = self.email
        return full_name.strip()

    def get_short_name(self):
        """Return the short name for the user."""
        return self.email

    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send an email to this user."""
        # send_mail(subject, message, from_email, [self.email], **kwargs)

    def add_log(self, text):
        print(self.log)
        self.log += (
            datetime.datetime.now().strftime("%y-%m-%d %H:%M") + " " + text + "\n"
        )
        self.save()
