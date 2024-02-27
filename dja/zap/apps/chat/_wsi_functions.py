import glob
import json
import logging
import math
import os
import re
import struct
from pathlib import Path
from django.core.cache import cache

from asgiref.sync import sync_to_async
from django.conf import settings
from django.core.files import File
from django.db import transaction
from django.utils.crypto import get_random_string
from django.utils.translation import activate, get_language
from PIL import Image
from zap.apps.filespro._functions import get_link_for_file_viewer_and_download

from .models import ChatGuestUser, ChatSession

logger = logging.getLogger(__name__)


class WsiChatMixin:

    async def wsi_chat_received_message(self, message):
        await self.init_chat()
        match message[0]:
            case "u":  # update list of files in filespro_folder
                await self.send_sessions_list(message)
        #     case "s":  # start the upload
        #         if not self.filespro_transfer_underway:
        #             await self.file_upload_demand(message[1:])
        #         else:
        #             raise ValueError("File upload demand during underway transfer.")
        #     case "c":  # cancel the upload
        #         await self.cancel_file_upload(message[1:])

    async def init_chat(self):
        pass
        # if not self.filespro_folder_id:
        #     try:
        #         self.filespro_folder_id = self.scope["user"].filespro_folder_id
        #     except Exception as e:
        #         logger.error(f"error: init_filespro_folder: {e}")
        #         await self.close()

    async def send_sessions_list(self, language_code):
        if language_code == "en" or language_code == "fr":
            activate(language_code)
        try:
            cache.get("chat_staff_list", [])
            # cache.set("chat_staff_list", chat_staff_list)

            if self.scope["user"].get("chat_guest_id", None):
                if self.scope["session"].get("chat_guest_id", None):
                    pass
                else:
                    pass
            else:
                pass
            # data = await sync_to_async(list)(
            #     FilesproFile.objects.filter(
            #         filespro_folder_id=self.filespro_folder_id
            #     ).values("file_name", "file")
            # )
            # for d in data:
            #     file_url = d.get("file")
            #     urls = get_link_for_file_viewer_and_download(file_url)
            #     d["view"] = urls["viewer_url"]  # Add into the dictionary
            #     d["dnld"] = urls["download_url"]  # Add into the dictionary
            #     del d["file"]
            # data_json = json.dumps(data)
            # await self.send("f" + self.tab_id + "u" + str(data_json))
        except Exception as e:
            logger.error(f"error: send_sessions_list: {e}")
            await self.close()
