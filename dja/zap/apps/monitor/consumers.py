import zap.apps.chat.objects as chat
import zap.apps.search.typesense as ts
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer


class MonitorConsumer(WebsocketConsumer):
    def connect(self):
        if self.scope["user"].is_superuser:
            self.accept()
            self.send("connected")
        else:
            self.close()
        # Clients.objects.create(channel_name=self.channel_name)

    def disconnect(self, close_code):
        pass

    #### Receive message from WebSocket
    def receive(self, text_data):
        try:
            if text_data:
                # command_name and command_arg are split by the first space occuring
                result = text_data.split(maxsplit=1)
                command_name = result[0]
                command_arg = result[1] if len(result) > 1 else ""
                match command_name:
                    case "enable_staff_chat":
                        self.send(chat.enable_staff_chat(self.scope["user"].id))
                    case "disable_staff_chat":
                        self.send(chat.disable_staff_chat(self.scope["user"].id))
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
                    case _:
                        self.send("unknown command")
            else:
                self.send("unknown command")
        except Exception as e:
            print(e)
