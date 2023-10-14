from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "chat"

urlpatterns = [
    path("", views.ChatLobby.as_view(), name="chat"),
]
