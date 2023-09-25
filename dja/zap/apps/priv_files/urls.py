from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "priv_files"

urlpatterns = [
    path("download/", views.DownloadFile.as_view(), name="download_file"),
    path("see_image_html/", views.see_image_html, name="see_image_html"),
    path("image_private/<slug:slug_image>", views.redirect_to_file, name="redirect_to_file"),
]
