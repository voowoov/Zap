from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "monitor"

urlpatterns = [
    path(_("monitor625453245/"), views.StaffMonitor.as_view(), name="monitor"),
    path(
        "MyAjaxReceiveTestView/",
        views.MyAjaxReceiveTestView.as_view(),
        name="MyAjaxReceiveTestView",
    ),
    path(
        "MonitorScript/",
        views.MonitorScript.as_view(),
        name="MonitorScript",
    ),
]
