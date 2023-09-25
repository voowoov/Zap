# ### synchronious
import json
from random import randint
from time import sleep

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from django.core.cache import cache
from django.utils.translation import get_language
from zap.apps.chat.objects import ListStaffChat


class MonitorConsumer(WebsocketConsumer):
    def connect(self):
        #### self.scope is like request
        # self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        # self.room_group_name = "chat_%s" % self.room_name
        self.room_group_name = "monitor_group"
        if self.scope["user"].is_authenticated:

            #### Join room group
            async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
            print("connected")

            self.accept()
            self.send(json.dumps({"message": "connected"}))
        else:
            self.close()
        # Clients.objects.create(channel_name=self.channel_name)

    def disconnect(self, close_code):
        #### Leave room group
        print("disconnected")
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)

    #### Receive message from WebSocket
    def receive(self, text_data):
        list_staff_chat = ListStaffChat()

        command = json.loads(text_data)["command"]
        match command:
            case "enable_staff_chat":
                list_staff_chat.add_staff(self.scope["user"].id)
                self.send(json.dumps({"message": "enabled staff chat"}))
            case "disable_staff_chat":
                list_staff_chat.del_staff(self.scope["user"].id)
                self.send(json.dumps({"message": "disabled staff chat"}))
            case _:
                self.send(json.dumps({"message": command + " : unknown command"}))
                pass
        print("received")

    def send_message_to_frontend(self, event):
        message = event["message"]
        arg1 = event["arg1"]
        self.send(text_data=json.dumps({"message": message, "arg1": arg1}))


# class ChatConsumer(AsyncWebsocketConsumer):
# async def connect(self):
#     self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
#     self.room_group_name = "chat_%s" % self.room_name

#     # Join room group
#     await self.channel_layer.group_add(self.room_group_name, self.channel_name)

#     await self.accept()

# async def disconnect(self, close_code):
#     # Leave room group
#     await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

# # Receive message from WebSocket
# async def receive(self, text_data):
#     text_data_json = json.loads(text_data)
#     message = text_data_json["message"]

#     # Send message to room group
#     await self.channel_layer.group_send(
#         self.room_group_name, {"type": "chat_message", "message": message}
#     )

# # Receive message from room group
# async def chat_message(self, event):
#     message = event["message"]

#     # Send message to WebSocket
#     await self.send(text_data=json.dumps({"message": message}))
