# ### synchronious
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.layers import get_channel_layer
from django.utils.translation import get_language


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        # self.scope is like request
        self.chat_session_id = self.scope["url_route"]["kwargs"]["chat_session_id"]
        self.room_group_name = "chat_%s" % self.chat_session_id

        # Join room group
        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
        print("connected")

        self.accept()

        # Send to staff
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "monitor_group",
            {
                "type": "send_message_to_frontend",
                "message": "add_chat_session",
                "arg1": self.chat_session_id,
            },
        )

    def disconnect(self, close_code):
        # Leave room group
        print("disconnected")
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)
        # Send to staff
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "monitor_group",
            {
                "type": "send_message_to_frontend",
                "message": "remove_chat_session",
                "arg1": self.chat_session_id,
            },
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "chat_message", "message": message}
        )
        print("received")

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        self.send(text_data=json.dumps({"message": message}))
        print("chat_messaged")


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
