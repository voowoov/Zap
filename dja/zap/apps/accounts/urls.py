from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "accounts"

urlpatterns = [
    path(_("account_summary/"), views.AccountSummary.as_view(), name="account_summary"),
    path(
        _("account_messages/"), views.AccountMessages.as_view(), name="account_messages"
    ),
    path(
        _("account_message/<int:pk>"),
        views.AccountMessage.as_view(),
        name="account_message",
    ),
    path(
        _("account_pref_perso"),
        views.AccountPrefPerso.as_view(),
        name="account_pref_perso",
    ),
    path(
        _("account_pref_socio"),
        views.AccountPrefSocio.as_view(),
        name="account_pref_socio",
    ),
    path(
        _("account_pref_signin"),
        views.AccountPrefSignin.as_view(),
        name="account_pref_signin",
    ),
    path(_("download/<int:pk>"), views.DownloadFile.as_view(), name="download"),
    path(_("project/"), views.ProjectView.as_view(), name="project"),
    path(_("e"), views.EditAddressCpProject.as_view(), name="edit_addresscp"),
]
