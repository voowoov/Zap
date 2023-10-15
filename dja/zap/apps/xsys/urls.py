from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "xsys"

urlpatterns = [
    path(
        "set/<slug:name>/<slug:value>",
        views.set_webpage_preference,
        name="set_webpage_preference",
    ),
]
