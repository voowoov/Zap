from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid
from zap.apps.chat.models import ChatSession
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


def uploadPathFunction(instance, filename):
    randomN = str(uuid.uuid4())
    return "uploads/%s" % randomN + filename


class FileUpload(models.Model):
    content_type = models.ForeignKey(
        ContentType, null=True, blank=True, on_delete=models.CASCADE
    )
    object_id = models.PositiveIntegerField()
    owner_object = GenericForeignKey("content_type", "object_id")

    file = models.FileField(upload_to=uploadPathFunction, null=True, blank=True)
    file_name = models.CharField(unique=True, max_length=50)
    tmp_name = models.CharField(unique=True, max_length=4)
