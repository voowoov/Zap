from django.urls import path, re_path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "filespro"

urlpatterns = [
    path(
        _("download/<str:signed_url>"),
        views.DownloadFile.as_view(),
        name="download_file",
    ),
    path(
        _("image_viewer/<str:signed_url>"),
        views.image_viewer,
        name="image_viewer",
    ),
    path(
        _("file_viewer/<str:signed_url>"),
        views.file_viewer,
        name="file_viewer",
    ),
]
