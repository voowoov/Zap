from django.urls import path, re_path

from . import consumers

websocket_urlpatterns = [
    # re_path(r"../ws/monitor/(?P<room_name>\w+)/$", consumers.MonitorConsumer.as_asgi()),
    re_path(r"monitor/", consumers.MonitorConsumer.as_asgi()),
]
