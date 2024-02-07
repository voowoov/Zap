import random
import string

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.storage import FileSystemStorage
from django.db import models, transaction
from django.db.models import Sum
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

private_storage = FileSystemStorage(
    location=settings.PRIVATE_STORAGE_ROOT, base_url="/media_private"
)


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
    remaining_storage = models.PositiveIntegerField(default=0)

    def update(self):
        ### calculate the remaning_storage
        file_upload_files = FileUploadFile.objects.filter(file_upload_user=self)
        total = sum(
            file_upload_file.file_size for file_upload_file in file_upload_files
        )
        self.remaining_storage = self.max_storage_size - total
        self.save()

    @classmethod
    def get_or_create_file_upload_user(cls, owner_object, max_storage_size=None):
        content_type = ContentType.objects.get_for_model(owner_object.__class__)
        try:
            result_model = cls.objects.get(
                owner_content_type=content_type, owner_object_id=owner_object.id
            )
        except cls.DoesNotExist:
            remaining_storage = 0 if max_storage_size is None else max_storage_size
            result_model = cls.objects.create(
                owner_content_type=content_type,
                owner_object_id=owner_object.pk,
                remaining_storage=remaining_storage,
            )
        if max_storage_size is not None:
            result_model.max_storage_size = max_storage_size
        result_model.update()
        return result_model


class FileUploadFile(models.Model):
    file_upload_user = models.ForeignKey(FileUploadUser, on_delete=models.CASCADE)
    file = models.FileField(upload_to=uploadPathFunction, storage=private_storage)
    file_name = models.CharField(max_length=50)
    file_size = models.PositiveIntegerField()

    def delete(self, *args, **kwargs):  # makes delete the media file too
        with transaction.atomic():
            storage = self.file.storage
            name = self.file.name
            obj_id = self.pk
            super().delete(*args, **kwargs)
            self.file_upload_user.update()
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
            self.file_upload_user.update()
