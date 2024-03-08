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

    ### overiden fields

    REQUIRED_FIELDS = []
