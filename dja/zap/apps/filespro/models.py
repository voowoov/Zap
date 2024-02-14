import logging
from datetime import datetime

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.storage import FileSystemStorage
from django.db import models, transaction
from django.utils.crypto import get_random_string
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)

private_storage = FileSystemStorage(
    location=settings.PRIVATE_STORAGE_ROOT, base_url="/media_private"
)

FREQ_LIM_REFRESH_TIME = 120  # seconds
FREQ_LIM_BYTES_PER_DEMAND = 10000  # cost of demand


def uploadPathFunction(instance, filename):
    directory = filename.split("/")[-2]  # the last directory in the path
    return (
        "uploads/"
        + directory
        + "/"
        + get_random_string(8)
        + "."
        + filename.split(".")[-1]
    )


class FilesproFolder(models.Model):
    max_storage_size = models.PositiveIntegerField(default=0)
    remaining_storage = models.PositiveIntegerField(default=0)
    freq_limit_storage = models.PositiveIntegerField(default=0)  # acts negatively
    last_timestamp = models.PositiveIntegerField(default=0)

    def update_freq_lim_get_remaining_store(self, failed_upload_size=None):
        ### update freq_limit_score when an upload is canceled or failed
        logger.debug(f"Filespro_folder: freq_limit_storage = {self.freq_limit_storage}")
        current_timestamp = int(datetime.now().timestamp())
        difference_sec = current_timestamp - self.last_timestamp
        bytes_refresh = int(
            self.max_storage_size * difference_sec / FREQ_LIM_REFRESH_TIME
        )
        fls = max(self.freq_limit_storage - bytes_refresh, 0)
        if failed_upload_size:
            fls += failed_upload_size + FREQ_LIM_BYTES_PER_DEMAND
        else:
            ### calculate the remaning_storage
            filespro_files = FilesproFile.objects.filter(filespro_folder=self)
            total = sum(
                file_upload_file.file_size for file_upload_file in filespro_files
            )
            self.remaining_storage = self.max_storage_size - total
        self.freq_limit_storage = min(max(fls, 0), self.remaining_storage)
        self.last_timestamp = current_timestamp
        self.save()
        logger.debug(f"Filespro_folder: difference_sec = {difference_sec}")
        logger.debug(f"Filespro_folder: failed_upload_size = {failed_upload_size}")
        logger.debug(f"Filespro_folder: freq_limit_storage = {self.freq_limit_storage}")
        return [self.remaining_storage, self.freq_limit_storage]

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
    file_name = models.CharField(max_length=50)
    file_size = models.PositiveIntegerField()

    def delete(self, *args, **kwargs):  # makes delete the media file too
        with transaction.atomic():
            storage = self.file.storage
            name = self.file.name
            obj_id = self.pk
            super().delete(*args, **kwargs)
            self.filespro_folder.update_freq_lim_get_remaining_store()
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
            self.filespro_folder.update_freq_lim_get_remaining_store()
