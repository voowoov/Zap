# Create your models here.
import datetime
import os
import random
import string

from dateutil import tz
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from zap.apps.users.models import User


class CookieOnServer(models.Model):
    cos_id = models.CharField(max_length=32)
    last_login_email = models.CharField(max_length=255, blank=True, null=True)
    remember_email = models.BooleanField(default=True)
    stay_signed_in = models.BooleanField(default=True)

    @classmethod
    def create_and_get_instance(cls):
        random_string = "".join(
            random.choices(string.ascii_letters + string.digits, k=32)
        )
        instance = cls(cos_id=random_string)
        instance.save()
        return instance
