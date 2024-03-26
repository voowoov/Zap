from django.db import models
from django.utils.translation import gettext_lazy as _
from zap.apps.users.models import User


class WsiConnection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    channel_name = models.CharField(max_length=255, blank=True, unique=True)
