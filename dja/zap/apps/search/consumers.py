import asyncio
import time

from channels.generic.websocket import WebsocketConsumer

from .typesense import typesense_search_documents


class DebounceConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        # if text_data == "":
        #     text_data = "-"
        self.send(typesense_search_documents(text_data))
