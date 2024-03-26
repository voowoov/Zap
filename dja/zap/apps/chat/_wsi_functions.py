import glob
import json
import logging
import math
import os
import re
import struct
from pathlib import Path

from asgiref.sync import sync_to_async
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files import File
from django.db import transaction
from django.templatetags.static import static
from django.utils.crypto import get_random_string
from django.utils.translation import activate, get_language
from PIL import Image
from zap.apps.chat.models import ChatSession
from zap.apps.filespro._functions import get_link_for_file_viewer_and_download
from zap.apps.wsi._functions import get_wsi_connection_track_count

UserModel = get_user_model()
default_avatar = "/images/icons/avatar.svg"

from .models import ChatSession

logger = logging.getLogger(__name__)


class WsiChatMixin:

    async def wsi_chat_received_message(self, message):
        await self.init_chat()
        match message[2]:
            case "u":  # update list of available sessions
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

    async def send_sessions_list(self, message):
        tab_id = message[1]
        language_code = message[3:]
        # if language_code == "en" or language_code == "fr":
        #     activate(language_code)
        try:
            sessions = await sync_to_async(
                ChatSession.objects.prefetch_related("users").filter
            )(users=self.scope["user"])
            sessions = await sync_to_async(list)(sessions)
            data = []
            for obj in sessions:
                users = await sync_to_async(list)(obj.users.all())
                users.remove(self.scope["user"])
                users.insert(0, self.scope["user"])  ### put first in the list
                subject = obj.subject

                # Construct a list of dictionaries for the users with custom variable names
                users_data = []
                for user in users:
                    user_data = get_user_info_dict(user, language_code)
                    users_data.append(user_data)

                # Construct a dictionary for the session with custom variable names
                session_data = {
                    "subject": subject,
                    "users": users_data,
                }
                data.append(session_data)
            data_json = json.dumps(data)
            await self.send("c" + tab_id + "u" + str(data_json))
        except Exception as e:
            logger.error(f"error: send_sessions_list: {e}")
            await self.close()


def get_user_info_dict(user, language_code):
    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role_fr if language_code == "fr" else user.role_en,
        "avatar": user.avatar.url if user.avatar else static(default_avatar),
        "online": "true" if get_wsi_connection_track_count(user) > 0 else "false",
        # Add more fields as needed
    }
