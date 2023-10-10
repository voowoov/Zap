from django.db import models
from django.utils.translation import gettext_lazy as _


# Create your models here.
class Movie(models.Model):
    language = models.CharField(_("language"), max_length=255)
    title = models.CharField(_("title"), max_length=255)
    release_date = models.CharField(_("release_date"), max_length=255)
    vote = models.FloatField(_("vote"), default=0)
