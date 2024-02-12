# Create your models here.
from django.db import models
from django.utils.crypto import get_random_string
from django.utils.translation import gettext_lazy as _


class CookieOnServer(models.Model):
    cos_id = models.CharField(max_length=32)
    last_login_email = models.CharField(max_length=255, blank=True, null=True)
    remember_email = models.BooleanField(default=True)
    stay_signed_in = models.BooleanField(default=True)

    @classmethod
    def create_and_get_instance(cls):
        random_string = get_random_string(32)
        instance = cls(cos_id=random_string)
        instance.save()
        return instance
