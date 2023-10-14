import asyncio
import logging
import time

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)

from channels.exceptions import StopConsumer
from channels.generic.websocket import AsyncWebsocketConsumer


class DebounceConsumer(AsyncWebsocketConsumer):
    # Class variables are global accross all instances
    # Class variable to store all connected consumers
    connected_consumers = set()
    # Class variable to store channel names of all connected consumers
    connected_channel_names = set()

    async def connect(self):
        # Add the consumer to the set of connected consumers
        self.connected_consumers.add(self)
        # Add the channel name to the set of connected channel names
        self.connected_channel_names.add(self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Remove the consumer from the set of connected consumers
        self.connected_consumers.remove(self)
        # Remove the channel name from the set of connected channel names
        self.connected_channel_names.remove(self.channel_name)

    async def receive(self, text_data):
        pass


# Close the first consumer from the set of connected consumers
def close_consumer_by_the_first_consumer():
    next(iter(DebounceConsumer.connected_consumers)).close()


# Close the first consumer from the set of connected consumers
def close_consumer_by_name(channel_name):
    # Get a reference to the channel layer
    channel_layer = get_channel_layer()
    # Send a 'websocket.disconnect' message to the consumer
    async_to_sync(channel_layer.send)(channel_name, {"type": "websocket.disconnect"})
