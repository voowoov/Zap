import logging
import os
from datetime import datetime

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.storage import FileSystemStorage
from django.db import models, transaction
from django.utils.crypto import get_random_string
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)

private_storage = FileSystemStorage(
    location=settings.PRIVATE_STORAGE_ROOT, base_url=settings.PRIVATE_STORAGE_BASE_URL
)


def uploadPathFunction(instance, filename):
    file_name, extension = os.path.splitext(os.path.basename(instance.file_name))
    extension = extension.lstrip(".")
    return (
        settings.PRIVATE_STORAGE_SUBFOLDER
        + get_random_string(10)
        + "-"
        + file_name[:12]
        + "."
        + extension
    )


FREQ_LIM_REFRESH_TIME = 240  # seconds
FREQ_LIM_BYTES_PER_DEMAND = 10000  # cost of demand


class FilesproFolder(models.Model):
    max_storage_size = models.PositiveIntegerField(default=0)
    used_storage_size = models.PositiveIntegerField(default=0)
    freq_limit_storage = models.PositiveIntegerField(default=0)  # acts negatively
    last_timestamp = models.PositiveIntegerField(default=0)

    @classmethod
    def update_used_storage(cls, id):
        ### calculate the remaning_storage
        used_storage_size = sum(
            FilesproFile.objects.filter(filespro_folder_id=id).values_list(
                "file_size", flat=True
            )
        )
        FilesproFolder.objects.filter(pk=id).update(used_storage_size=used_storage_size)
        return used_storage_size

    @classmethod
    def update_freq_limit_storage(cls, id, upload_size=None):
        folder = FilesproFolder.objects.get(pk=id)
        ### update freq_limit_score when an upload is canceled or failed
        logger.debug(
            f"Filespro_folder: freq_limit_storage = {folder.freq_limit_storage}"
        )
        current_timestamp = int(datetime.now().timestamp())
        difference_sec = current_timestamp - folder.last_timestamp
        bytes_refresh = int(
            folder.max_storage_size * difference_sec / FREQ_LIM_REFRESH_TIME
        )
        folder.freq_limit_storage = max(folder.freq_limit_storage - bytes_refresh, 0)
        if upload_size:
            folder.freq_limit_storage += upload_size + FREQ_LIM_BYTES_PER_DEMAND
        folder.last_timestamp = current_timestamp
        folder.save()
        logger.debug(f"Filespro_folder: difference_sec = {difference_sec}")
        logger.debug(f"Filespro_folder: upload_size = {upload_size}")
        logger.debug(
            f"Filespro_folder: freq_limit_storage = {folder.freq_limit_storage}"
        )
        return folder

    @classmethod
    def update_freq_limit_and_get_storage(cls, id):
        folder = cls.update_freq_limit_storage(id)
        remaining_storage = folder.max_storage_size - folder.used_storage_size
        return [remaining_storage, folder.freq_limit_storage]

    @classmethod
    def create(cls, max_storage_size=None):
        if max_storage_size:
            object = cls.objects.create(max_storage_size=max_storage_size)
        else:
            object = cls.objects.create()
        return object


class FilesproFile(models.Model):
    filespro_folder = models.ForeignKey(FilesproFolder, on_delete=models.CASCADE)
    file = models.FileField(upload_to=uploadPathFunction, storage=private_storage)
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()

    def delete(self, *args, **kwargs):  # makes delete the media file too
        with transaction.atomic():
            storage = self.file.storage
            name = self.file.name
            obj_id = self.pk
            super().delete(*args, **kwargs)
            self.filespro_folder.update_used_storage(self.filespro_folder.pk)
        # Check if the object was deleted successfully
        try:
            self.__class__.objects.get(pk=obj_id)
        except ObjectDoesNotExist:
            # If the object does not exist, delete the file
            if storage.exists(name):
                storage.delete(name)

    def save(self, *args, **kwargs):
        with transaction.atomic():
            # super() is first to have the right fields during create for update_remaining_storage
            super().save(*args, **kwargs)
            self.filespro_folder.update_used_storage(self.filespro_folder.pk)
