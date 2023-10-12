from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class Post(models.Model):
    title = models.CharField(max_length=100)
    des = models.TextField()
    pub_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("base:testsitemap", args=[self.id])


class Movie(models.Model):
    language = models.CharField(_("language"), max_length=255)
    title = models.CharField(_("title"), max_length=255)
    release_date = models.CharField(_("release_date"), max_length=255)
    vote = models.FloatField(_("vote"), default=0)
