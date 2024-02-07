from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "priv_files"

urlpatterns = [
    path("download/", views.DownloadFile.as_view(), name="download_file"),
    path("image_viewer/<slug:slug_image>", views.image_viewer, name="image_viewer"),
    path(
        "image_private/<slug:slug_image>",
        views.image_private,
        name="image_private",
    ),
    path(
        "pdf_viewer/<slug:slug_pdf>",
        views.pdf_viewer,
        name="pdf_viewer",
    ),
]
