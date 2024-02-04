import uuid

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.utils.translation import gettext_lazy as _
from zap.apps.chat.models import ChatSession


def uploadPathFunction(instance, filename):
    randomN = str(uuid.uuid4())[:8]
    return "uploads/%s" % randomN


class FileUpload(models.Model):
    owner_content_type = models.ForeignKey(
        ContentType, null=True, blank=True, on_delete=models.CASCADE
    )
    owner_object_id = models.PositiveIntegerField()
    owner_object = GenericForeignKey("owner_content_type", "owner_object_id")

    file = models.FileField(upload_to=uploadPathFunction, null=True, blank=True)
    file_name = models.CharField(max_length=50)

    def delete(self, *args, **kwargs):  # makes delete the media file too
        storage = self.file.storage
        name = self.file.name
        print(name)
        if storage.exists(name):
            print("deleting")
            storage.delete(name)
        else:
            print("file dont exist")
        super().delete(*args, **kwargs)
