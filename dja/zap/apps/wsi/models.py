import random
import string

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models, transaction
from django.utils.translation import gettext_lazy as _
from django.db.models import Sum


def uploadPathFunction(instance, filename):
    randomN = "".join(random.choices(string.ascii_letters + string.digits, k=8))
    return "uploads/%s" % randomN + "." + filename.split(".")[-1]


class FileUploadUser(models.Model):
    owner_content_type = models.ForeignKey(
        ContentType, null=True, blank=True, on_delete=models.CASCADE
    )
    owner_object_id = models.PositiveIntegerField()
    owner_object = GenericForeignKey("owner_content_type", "owner_object_id")

    max_storage_size = models.PositiveIntegerField(default=0)
    current_storage_size = models.PositiveIntegerField(default=0)


class FileUploadFile(models.Model):
    file_upload_user = models.ForeignKey(FileUploadUser, on_delete=models.CASCADE)
    file = models.FileField(upload_to=uploadPathFunction, null=True, blank=True)
    file_name = models.CharField(max_length=50)
    file_size = models.PositiveIntegerField()

    def delete(self, *args, **kwargs):  # makes delete the media file too
        with transaction.atomic():
            self.update_current_storage_size()
            storage = self.file.storage
            name = self.file.name
            if storage.exists(name):
                storage.delete(name)
            super().delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        with transaction.atomic():
            self.update_current_storage_size()
            super().save(*args, **kwargs)

    def update_current_storage_size(self):
        total = FileUploadFile.objects.filter(
            file_upload_user=self.file_upload_user
        ).aggregate(Sum("file_size"))["some_field__sum"]
        self.file_upload_user.current_storage_size = total if total is not None else 0
        self.file_upload_user.save()
