from django.urls import path, re_path

from .consumers import WsiConsumer

websocket_urlpatterns = [
    # re_path(r"../ws/monitor/(?P<room_name>\w+)/$", consumers.MonitorConsumer.as_asgi()),
    re_path(r"wsi/", WsiConsumer.as_asgi()),
]  # two dots to replace the language code (. is any character in regex)
