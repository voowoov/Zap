from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "monitor"

urlpatterns = [
    path(_("monitor625453245/"), views.StaffMonitor.as_view(), name="monitor"),
    path("upload/", views.StaffMonitor.as_view(), name="upload_file"),
]
