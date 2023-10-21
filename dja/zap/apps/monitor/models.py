import uuid

from django.db import models


def uploadPathFunction(instance, filename):
    randomN = str(uuid.uuid4())[:4]
    return "uploads/%s" % randomN + filename


class FileUpload(models.Model):
    file = models.FileField(upload_to=uploadPathFunction, null=True, blank=True)
    existingPath = models.CharField(unique=True, max_length=100)
    name = models.CharField(max_length=50)
    eof = models.BooleanField()
