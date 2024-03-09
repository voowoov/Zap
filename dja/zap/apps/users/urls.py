from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path
from django.utils.translation import gettext_lazy as _
from django.views.generic import TemplateView

from . import views

app_name = "users"

urlpatterns = [
    path(_("signin/"), views.CustomLoginView.as_view(), name="signin_0"),
    path(_("signin_2/"), views.CustomLoginLev2View.as_view(), name="signin_lev2"),
    path(_("signout/"), views.CustomLogoutView.as_view(), name="signout"),
    path(
        _("user_creation/"),
        views.UserCreation.as_view(),
        name="user_creation",
    ),
    path(
        _("password_reset_info"),
        views.PasswordResetInfo.as_view(),
        name="password_reset_info",
    ),
    path(
        _("password_reset/<slug:uidb64>/<slug:token>"),
        views.PasswordReset.as_view(),
        name="password_reset",
    ),
]
