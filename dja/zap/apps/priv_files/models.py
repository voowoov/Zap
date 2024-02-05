import datetime
import math
import mimetypes
import os
import random
import string

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models, transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from zap.apps.accounts.models import Param, Project

private_storage = FileSystemStorage(
    location=settings.PRIVATE_STORAGE_ROOT, base_url="/media_private"
)


def uploadPathFunction(instance, filename):
    randomN = "".join(random.choices(string.ascii_letters + string.digits, k=8))
    return "uploads/%s" % randomN + "." + filename.split(".")[-1]


class PrivFile(models.Model):
    project = models.ForeignKey(Project, on_delete=models.PROTECT)
    file = models.FileField(upload_to=uploadPathFunction, storage=private_storage)
    original_filename = models.CharField(max_length=255, blank=True)
    file_size_MB = models.FloatField(blank=True)
    uploaded_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if self.file:
            if not self.original_filename:
                self.original_filename = self.file.name
                self.file_size_MB = math.ceil(self.file.size / (1048576) * 10) / 10
        super().save(*args, **kwargs)
