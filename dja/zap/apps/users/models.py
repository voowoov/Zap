import datetime
import logging
import zoneinfo

from django.contrib import auth
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractUser, PermissionsMixin
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

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.password = make_password(password)
        user.filespro_folder = FilesproFolder.create(10000000)
        user.save()
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)

        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self._create_user(email, password, **extra_fields)

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


class User(AbstractUser):
    ### PermissionsMixin adds:
    ###  groups: A many-to-many relationship with user groups.
    ###  user_permissions: A many-to-many relationship with individual permissions.
    client_account = models.ForeignKey(
        ClientAccount, on_delete=models.PROTECT, null=True, blank=True
    )
    level = models.PositiveSmallIntegerField(default=0)
    role_en = models.CharField(_("role"), max_length=150, blank=True)
    role_fr = models.CharField(_("role"), max_length=150, blank=True)
    avatar = models.ImageField(
        upload_to=uploadPathFunctionAvatar, null=True, blank=True
    )
    phones = models.ManyToManyField(PhoneNumbers, blank=True)
    is_closed = models.BooleanField(_("closed"), default=False)

    #  filespro_folder to be removed from user model here temporarily
    filespro_folder = models.ForeignKey(
        FilesproFolder, on_delete=models.PROTECT, null=True, blank=True
    )

    objects = UserManager()

    REQUIRED_FIELDS = []
