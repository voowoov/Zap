from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "chat"

urlpatterns = [
    path("init/", views.init_chat, name="init_chat"),
    path("save/", views.save_chat, name="save_chat"),
    path("<int:chat_session_id>/", views.room_chat, name="start_chat"),
]
