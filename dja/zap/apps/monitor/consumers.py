import glob
import logging
import os
import threading
from datetime import datetime

import zap.apps.chat.objects as chat
import zap.apps.search._typesense as ts
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.layers import get_channel_layer
from django.core.cache import cache
from django.utils.translation import get_language

logger = logging.getLogger(__name__)


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
                # logger.debug(f"MonitorConsumer, get_language(): {get_language()}")
                # logger.debug(self.scope["path"])
                if text_data:
                    # command_name and command_arg are split by the first space occuring
                    words = text_data.split()
                    match words[0]:
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
                        case "task":
                            if len(words) > 1:
                                self.send(self.run_celery_task(words[1], words[2:]))
                        case _:
                            self.send("unknown command")
                elif bytes_data:
                    pass
            else:
                raise ValueError(f"error non-superuser in monitor")
        except Exception as e:
            logger.error(f"error: monitor websocket message receiving: {e}")
            self.close()

    def run_celery_task(self, task_name, args):
        from zap.celery import app  # replace with your actual module

        logger.debug(f"run_celery_task: {task_name, args}")
        result = app.send_task(task_name, args=args, kwargs={})
        thread = threading.Thread(
            target=self.after_celery_task_finishes, args=(task_name, result)
        )
        thread.start()
        return f"sent to celery"

    def after_celery_task_finishes(self, task_name, result):
        self.send(f"{task_name} r: {result.get()}")
