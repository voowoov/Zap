from django.urls import path
from django.utils.translation import gettext_lazy as _
from django.views.generic import TemplateView

from . import views

app_name = "base"

urlpatterns = [
    path("test/", views.test, name="test"),
    path("", views.home, name="home"),
    path(
        "base/<slug:id>/",
        TemplateView.as_view(template_name="base/testsitemap.html"),
        name="testsitemap",
    ),
    path(_("cookie_opt/"), views.cookie_opt, name="cookie_opt"),
]
