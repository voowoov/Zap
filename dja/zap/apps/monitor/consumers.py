from datetime import datetime

import zap.apps.chat.objects as chat
import zap.apps.search.typesense as ts
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.cache import cache
from django.utils.translation import get_language
import os
import glob


class MonitorConsumer(WebsocketConsumer):
    def connect(self):
        if self.scope["user"].is_superuser:
            self.room_group_name = "monitor293ejoqi"
            self.accept()
            self.send("connected")
        else:
            self.close()

    def disconnect(self, close_code):
        pass

    #### Receive message from WebSocket
    def receive(self, text_data=None, bytes_data=None):
        try:
            if self.scope["user"].is_superuser:
                # print(get_language())
                # print(self.scope["path"])
                if text_data:
                    # command_name and command_arg are split by the first space occuring
                    result = text_data.split(maxsplit=1)
                    command_name = result[0]
                    command_arg = result[1] if len(result) > 1 else ""
                    match command_name:
                        case "movies_fixture_to_db":
                            self.send(ts.movies_fixture_to_db())
                        case "delete_all_movies_from_db":
                            self.send(ts.delete_all_movies_from_db())
                        case "typesense_delete_a_collection":
                            self.send(ts.typesense_delete_a_collection())
                        case "typesense_create_a_collection":
                            self.send(ts.typesense_create_a_collection())
                        case "typesense_import_documents":
                            self.send(ts.typesense_import_documents())
                        case "typesense_test_count_documents":
                            self.send(ts.typesense_test_count_documents())
                        case "typesense_add_single_document":
                            self.send(ts.typesense_add_single_document())
                        case "close_connection_in_django":
                            self.close()
                        case "delete_upload_tmp_files":
                            self.send(delete_upload_tmp_files())
                        case _:
                            self.send("unknown command")
                elif bytes_data:
                    # Handle binary message
                    print(f"Received binary data: {bytes_data}")
            else:
                self.close()

        except Exception as e:
            print(e)


def delete_upload_tmp_files():
    files = glob.glob(settings.WSI_TMP_FILE_DIRECTORY + "*")
    for file in files:
        if os.path.isfile(file):
            os.remove(file)
