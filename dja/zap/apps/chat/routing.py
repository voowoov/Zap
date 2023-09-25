from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"../ws_chat/(?P<chat_session_id>\w+)/$", consumers.ChatConsumer.as_asgi()),
]  # two dots to replace the language code (. is any character in regex)
