import logging
import time

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
from zap.apps.chat._wsi_functions import WsiChatMixin
from zap.apps.filespro._wsi_functions import WsiFilesproMixin
from zap.apps.search._wsi_functions import WsiSearchMixin

logger = logging.getLogger(__name__)


class WsiConsumer(
    AsyncWebsocketConsumer, WsiFilesproMixin, WsiSearchMixin, WsiChatMixin
):
    async def connect(self):
        self.channel_name_abr = None
        self.filespro_folder_id = None
        self.filespro_transfer_underway = False

        ##### save the channel_name in session data for closing connection on login and logout
        self.scope["session"]["channel_name"] = self.channel_name
        print(self.scope["session"]["channel_name"])
        await self.save_session()  # requires a database write

        await self.accept()

    async def disconnect(self, close_code):
        if self.filespro_folder_id:
            await self.update_file_tranfer_freq_limiting()
            await self.delete_tmp_files()

    async def send(self, text_data):
        logger.debug(f"WSI Sending: {text_data}")
        await super().send(text_data)

    async def receive(self, text_data=None, bytes_data=None):
        try:
            if text_data:
                ##############################################################
                #  For text data, the first characters are indicating
                #    -  1st character is the nature of the message
                #      s  : search
                #      c  : chat lobby
                #      d  : chat staff
                #      f  : file upload  (0x66 in bynary hex)
                #    - 2nd character is the broswer tab id (one char) to be tracked and returned
                #    - [2:]  the rest is the message itself
                ##############################################################
                if len(text_data) >= 2:
                    match text_data[0]:
                        case "s":
                            await self.frequency_limiting(10)
                            if await self.verify_session():
                                # await self.wsi_search_received_message(text_data)
                                pass
                        case "f":
                            await self.frequency_limiting(20)
                            if await self.verify_and_authenticate():
                                await self.wsi_filespro_received_message(text_data)
                        case "c":
                            await self.frequency_limiting(20)
                            if await self.verify_and_authenticate():
                                await self.wsi_chat_received_message(text_data)
                        case _:
                            raise ValueError(
                                f"unexpected prefix letter: {text_data[0]}"
                            )
            elif bytes_data:
                ### Handle binary message
                if len(bytes_data) > 6 and hasattr(self, "file_portion_array"):
                    await self.filespro_receive_bytes_chunk(bytes_data)
                else:
                    raise ValueError(
                        f"unexpected binary message is too short or is missing initial attribute"
                    )
            else:
                await self.close()
        except Exception as e:
            logger.error(f"error: wsi message receiving: {e}")
            await self.close()

    @database_sync_to_async
    def save_session(self):
        self.scope["session"].save()

    async def frequency_limiting(self, thenthseconds):
        try:
            num = self.channel_name_abr or (250 << 16) | (250 << 8) | 0
            ### stored in 4 bytes in one integer (int is 4 bytes)
            ### Extract the bytes
            score = (num >> 8) & 0xFF  # 2nd byte out of 4
            timer = num & 0xFF  # last byte (lsb)
            ### the timer is each 25 seconds with one decimal (0-250) time.time() is epoch time in s
            new_timer = int(time.time() % 25 * 10)  # in 0.1s
            if new_timer < timer:
                diff = 250 - timer + new_timer
            else:
                diff = new_timer - timer
            ### score function (in 0.1s) the score is from 0-250
            score = min((score - thenthseconds + diff), 250)
            if score < 0:
                logger.warning(
                    f"warning: WSI received: frequency limiting score went to zero {e}"
                )
                await self.close()
            num = (score << 8) | new_timer
            self.channel_name_abr = num
            logger.debug(f"WSI Received: score: {score}")
        except Exception as e:
            logger.error(f"error: wsi message receiving: {e}")
            await self.close()

    async def verify_and_authenticate(self):
        if (
            self.scope["session"].get_expiry_date() > timezone.now()
            and self.scope["user"].is_authenticated
        ):
            return True
        logger.debug(f"warning: failed verify_and_authenticate")
        await self.close()
        return False

    async def verify_session(self):
        if self.scope["session"].get_expiry_date() > timezone.now():
            return True
        logger.debug(f"warning: failed verify_and_authenticate")
        await self.close()
        return False

    # Receive message channel_layer
    async def external_message(self, event):
        await self.send(event["message"])

    # Receive message channel_layer
    async def close_channel(self, event):
        await self.send("r")  # reconnect/refresh
        await self.close()
