import asyncio
import logging
import time

logger = logging.getLogger(__name__)

from channels.exceptions import StopConsumer
from channels.generic.websocket import WebsocketConsumer

from .typesense import typesense_search_documents


class DebounceConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        # Close the WebSocket connection
        self.close()
        # Stop processing messages from this client
        raise StopConsumer()

    def receive(self, text_data):
        print(text_data)
        if len(text_data) >= 2:
            match text_data[1]:
                case "s":
                    self.send(
                        text_data[0]
                        + text_data[1]
                        + typesense_search_documents(text_data[2:])
                    )
                case _:
                    print("bad header")
                    logger.warning("websocket message first letter not recognized")
        else:
            logger.warning("websocket message received have insuficient length")
