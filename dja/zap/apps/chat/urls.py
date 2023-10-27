from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "chat"

urlpatterns = [
    path(_("chat_lobby/"), views.ChatLobby.as_view(), name="chat_lobby"),
    path(_("chat_staff/"), views.ChatStaff.as_view(), name="chat_staff"),
    path(_("chat_video/"), views.ChatVideo.as_view(), name="chat_video"),
]
