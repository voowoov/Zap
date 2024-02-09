import logging
import time

import zap.apps.search._wsi_functions as search
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from zap.apps.filespro._wsi_functions import WSIPrivFilesMixin
from zap.apps.search._wsi_functions import WSISearchMixin

logger = logging.getLogger(__name__)


class WsiConsumer(AsyncWebsocketConsumer, WSIPrivFilesMixin, WSISearchMixin):
    async def connect(self):
        self.channel_name_abr = None
        await self.wsi_filespro_init_file_upload_user()
        await self.accept()

    async def disconnect(self, close_code):
        pass

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
                    self.tab_id = text_data[1]
                    self.message = text_data[2:]
                    match text_data[0]:
                        case "s":
                            await self.frequency_limiting(10)
                            # await self.wsi_search_received_message()
                        case "f":
                            await self.frequency_limiting(20)
                            await self.wsi_filespro_received_message()
                        case _:
                            await self.close()
                    self.message = None
            elif bytes_data:
                ### Handle binary message
                if len(bytes_data) > 6 and hasattr(self, "file_portion_array"):
                    await self.wsi_filespro_received_bytes(bytes_data)
                else:
                    logger.error(
                        "error: wsi file upload unexpected binary message is too short or is missing initial attribute"
                    )
                    await self.close()
            else:
                await self.close()
        except Exception as e:
            await self.close()
            logger.error(f"error: wsi message receiving: {e}")

    async def frequency_limiting(self, thenthseconds):
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
            await self.close()
        num = (score << 8) | new_timer
        self.channel_name_abr = num

        print("score: ", score, " ", self.message)
