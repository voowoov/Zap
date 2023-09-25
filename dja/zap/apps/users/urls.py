from django.urls import path
from django.utils.translation import gettext_lazy as _
from django.views.generic import TemplateView

from . import views

app_name = "users"

urlpatterns = [
    path(_("signin_0/"), views.Signin_0.as_view(), name="signin_0"),
    path(_("Signin_Lev2/"), views.Signin_Lev2.as_view(), name="signin_lev2"),
    path(_("logout/"), views.logoutUser, name="logout"),
    path(
        _("create_an_account_info"),
        TemplateView.as_view(template_name="users/create_account_info.html"),
        name="create_account_info",
    ),
    path(_("create_an_account/<slug:uidb64>/<slug:token>"), views.CreateAccount.as_view(), name="create_user"),
    path(_("password_reset/<slug:uidb64>/<slug:token>"), views.PasswordReset.as_view(), name="password_reset"),
    path(_("password_reset"), views.PasswordResetInfo.as_view(), name="password_reset_info"),
]
