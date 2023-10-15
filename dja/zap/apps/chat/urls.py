from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "chat"

urlpatterns = [
    path(_("lobby_chat/"), views.LobbyChat.as_view(), name="lobby_chat"),
    path(_("staff_chat/"), views.StaffChat.as_view(), name="staff_chat"),
]
