from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "monitor"

urlpatterns = [
    path(_("staff_monitor/"), views.StaffMonitor.as_view(), name="staff_monitor"),
]
