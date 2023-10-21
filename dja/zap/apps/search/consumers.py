import asyncio

from channels.generic.websocket import WebsocketConsumer

from .typesense import typesense_search_documents


class SearchConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        # Debounce the message using Django Channels' built-in debounce method
        if text_data == "":
            text_data = "-"

        self.send(typesense_search_documents(text_data))
