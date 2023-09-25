import uuid
from io import BytesIO

from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from PIL import Image
from tinymce.models import HTMLField
from zap.apps.users.models import User


def uploadPathFunction(instance, filename):
    randomN = str(uuid.uuid4())[:8]
    return "article/images/%s" % randomN + filename

class Author(models.Model):
    author_slug = models.CharField(max_length=255, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name_fr = models.CharField(max_length=255, blank=True)
    name_en = models.CharField(max_length=255, blank=True)
    description_fr = HTMLField(blank=True)
    description_en = HTMLField(blank=True)

    def __str__(self):
        return self.name_fr

class Article(models.Model):
    article_slug = models.CharField(max_length=255, unique=True)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, blank=True)
    title_fr = models.CharField(max_length=255, blank=True)
    title_en = models.CharField(max_length=255, blank=True)
    subtitle_fr = models.CharField(max_length=255, blank=True)
    subtitle_en = models.CharField(max_length=255, blank=True)
    content_fr = HTMLField(blank=True)
    content_en = HTMLField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    image_main = models.ImageField(upload_to=uploadPathFunction, null=True, blank=True)
    image_tumbnail = models.ImageField(upload_to=uploadPathFunction, max_length=500, null=True, blank=True)

    def __str__(self):
        return self.article_slug

    class Meta:
        ordering = ["-updated_at"]

    def save(self, *args, **kwargs):
        # compute a tumbnail image when article object is saved
        super().save(*args, **kwargs)
        if self.image_main:
            my_form = ImageCreationForm({}, {'image_main': self.image_main})
            if my_form.is_valid():
                self.image_tumbnail.save('thumbnail.jpg', my_form.save(), save=False)
                super().save(*args, **kwargs)
            else:
                print(my_form.errors)

class ImageContent(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    image = models.ImageField(upload_to=uploadPathFunction)
    def __str__(self):
        return self.image.url


from django import forms

class ImageCreationForm(forms.Form):
    # creates a image_tumbnail from image_main of 16/9 ratio centered and then rescaled to 426,240
    image_main = forms.ImageField()

    def save(self):
        image_main = self.cleaned_data['image_main']
        img = Image.open(image_main)
        width, height = img.size
        ratio=width/height
        if ratio > 16/9 :
            newwidth=int(height*16/9)
            gap=int((width-newwidth)/2)
            area = (gap, 0, gap+newwidth, height)
            img = img.crop(area)
        else:
            newheight=int(width*9/16)
            gap=int((height-newheight)/2)
            area = (0, gap, width, gap+newheight)
            img = img.crop(area)
        new_size = (426, 240)
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        thumbnail_io = BytesIO()
        img.save(thumbnail_io, format='JPEG')
        thumbnail_file = InMemoryUploadedFile(thumbnail_io, None, 'thumbnail.jpg', 'image/jpeg', thumbnail_io.tell(), None)
        return thumbnail_file
