from django.db import models
from django.utils.translation import gettext_lazy as _
from zap.apps.users.models import User


class WsiConnections(models.Model):
    users = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True)
    session = models.IntegerField()
    channel_name = models.CharField(max_length=255, blank=True)
