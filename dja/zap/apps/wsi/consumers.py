import asyncio
import glob
import json
import logging
import math
import os
import random
import re
import string
import struct
import time
from datetime import datetime, timedelta
from pathlib import Path

import zap.apps.search.typesense as ts
from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.layers import get_channel_layer
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.cache import cache
from django.core.exceptions import ObjectDoesNotExist
from django.core.files import File
from django.utils import timezone
from django.utils.translation import get_language

from .models import FileUploadFile, FileUploadUser

path_directory = settings.WSI_TMP_FILE_DIRECTORY
### the same must be in the js.
chunk_size = 1990  ### websocket message size is limited, see ws protocol overide
max_nb_chunks = 100
max_file_size = 100000000

### other setting
expected_duration_rate = 0.00000005  ### s/byte

logger = logging.getLogger(__name__)


class WsiConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.channel_name_abr = None

        try:
            ### file upload user object is transmitted to wsi via 2 session variables
            content_type_id = self.scope["session"]["wsi_fuu_ct_id"]
            object_id = self.scope["session"]["wsi_fuu_obj_id"]
            self.file_upload_user = await self.get_my_object(content_type_id, object_id)
        except:
            pass

        await self.accept()

    @database_sync_to_async
    def get_my_object(self, content_type_id, object_id):
        try:
            content_type = ContentType.objects.get_for_id(content_type_id)
            model = content_type.model_class()
            return model.objects.get(pk=object_id)  ### replace with your actual query
        except ObjectDoesNotExist:
            return None

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        try:
            ##############################################################
            #  the first characters are indicating
            #    -  1st character is the nature of the message
            #      s  : search
            #      c  : chat lobby
            #      d  : chat staff
            #      f  : file upload  (0x66 in bynary hex)
            #    - 2nd character is the broswer tab id (one char) to be tracked and returned
            #    - [2:]  the rest is the message itself
            ##############################################################
            if text_data:
                data_length = len(text_data)
                if data_length >= 2:
                    tabId = text_data[1]
                    message = text_data[2:]
                    match text_data[0]:
                        case "s":
                            if len(message) > 50:
                                await self.close()
                            await self.frequency_limiting(10)
                            # await self.send(
                            #     "s" + tabId + ts.typesense_search_documents(message)
                            # )
                        case "f":
                            await self.frequency_limiting(20)
                            if self.file_upload_user:
                                await self.file_upload_demand(message)
                        case _:
                            pass
            elif bytes_data:
                ### Handle binary message
                if len(bytes_data) > 4 and hasattr(self, "file_portion_array"):
                    await self.receive_file_bytes(bytes_data)
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

        print("score: ", score)

    async def file_upload_demand(self, message):
        try:
            data = json.loads(message)
            if len(message) < 100:
                file_name = data["file_name"]
                file_size = data["file_size"]
                is_valid = True
                if not is_valid_filename(file_name):
                    is_valid = False
                    await self.send("ferror_invalid_file_name")
                if await sync_to_async(
                    FileUploadFile.objects.filter(
                        file_upload_user=self.file_upload_user, file_name=file_name
                    ).exists
                )():
                    is_valid = False
                    await self.send("ferror_file_already_exists")
                if file_size > self.file_upload_user.remaining_storage:
                    is_valid = False
                    await self.send("ferror_insufficient_remaining_space")
                if timezone.now() < self.file_upload_user.expected_end_at:
                    is_valid = False
                    await self.send("ferror_cooldown_duration_requred")
                if is_valid:
                    self.file_upload_user.expected_end_at = timezone.now() + timedelta(
                        seconds=file_size * expected_duration_rate
                    )
                    await sync_to_async(self.file_upload_user.save)()
                    self.file_name = file_name
                    self.file_tmp_name = "".join(
                        random.choices(string.ascii_letters + string.digits, k=1)
                    )  ### only one random letter name to limit the number of possible tmp_files
                    self.file_size = file_size
                    self.file_portion_step = 0
                    self.file_portion_array = divide_portions_array(
                        file_size, chunk_size * max_nb_chunks
                    )
                    self.file_nb_chunks = math.ceil(
                        self.file_portion_array[self.file_portion_step] / chunk_size
                    )
                    self.chunk_bool_array = [False] * self.file_nb_chunks
                    await self.send("fcontinue")
            else:
                await self.close()
        except Exception as e:
            await self.close()
            logger.error(f"error: wsi file upload demand: {e}")

    async def receive_file_bytes(self, bytes_data):
        try:
            ### The first 4 bytes are your integer, the current chunk_id
            chunk_id = struct.unpack("<I", bytes_data[:4])[0]
            if self.chunk_bool_array[chunk_id]:
                logger.error(
                    "error: wsi file upload alert unexpected chunk id repeated"
                )
                await self.close()
            else:
                self.chunk_bool_array[chunk_id] = True
                path = path_directory + self.file_tmp_name + str(chunk_id)
                fileData = bytes_data[4:]
                with open(path, "wb") as f:
                    f.write(fileData)
                ### Check if all the chunks of this partial file are received
                if all(self.chunk_bool_array):
                    path_partial = path_directory + self.file_tmp_name + "out"
                    ### make a partial file
                    with open(path_partial, "wb") as output_file:
                        for x in range(self.file_nb_chunks):
                            chunk_file_path = (
                                path_directory + self.file_tmp_name + str(x)
                            )
                            with open(chunk_file_path, "rb") as partial_file:
                                partial_file_data = partial_file.read()
                                output_file.write(partial_file_data)
                    ### add the partial file to the full file
                    path_full = (
                        path_directory
                        + self.file_tmp_name
                        + "full."
                        + self.file_name.split(".")[-1]
                    )
                    with open(path_full, "ab") as output_file:
                        with open(path_partial, "rb") as partial_file:
                            partial_file_data = partial_file.read()
                            output_file.write(partial_file_data)
                    if self.file_portion_step == len(self.file_portion_array) - 1:
                        if os.path.getsize(path_full) != self.file_size:
                            logger.error(
                                "error: wsi file upload unexpected alert inconsistent file size"
                            )
                        else:
                            ### create a new file_upload_file model object with the full file
                            with open(path_full, "rb") as output_file:
                                file_upload_file = await sync_to_async(
                                    FileUploadFile.objects.create
                                )(
                                    file_upload_user=self.file_upload_user,
                                    file=File(output_file),
                                    file_name=self.file_name,
                                    file_size=self.file_size,
                                )
                            ### tell file_upload_user that the upload is finished
                            self.file_upload_user.expected_end_at = timezone.now()
                            await sync_to_async(self.file_upload_user.save)()
                            ### delete the tmp files
                            for filename in glob.glob(
                                path_directory + self.file_tmp_name + "*"
                            ):
                                os.remove(filename)
                            logger.info("wsi file upload of {self.file_name} finished")
                            ### send received confirmation
                            await self.send("freceived")
                    else:
                        self.file_portion_step += 1
                        self.file_nb_chunks = math.ceil(
                            self.file_portion_array[self.file_portion_step] / chunk_size
                        )
                        self.chunk_bool_array = [False] * self.file_nb_chunks
                        await self.send("fcontinue")

        except Exception as e:
            await self.close()
            logger.error(f"error: wsi file upload receiving: {e}")


def is_valid_filename(filename):
    # Check if filename starts with alphanumeric or underscore, followed by alphanumeric, underscore, hyphen, and contains only one dot
    # Check if extension is alphanumeric
    if not re.match(r"^\w[\w\s-]*\.\w+$", filename):
        return False
    if len(filename) > 50:
        return False
    # Check if extension is present and not too long
    extension = Path(filename).suffix
    if (
        not extension or len(extension) - 1 < 3 or len(extension) - 1 > 5
    ):  # Subtract 1 for the leading dot
        return False
    return True


# with 10 and 3, will output: [3, 3, 3, 1]
def divide_portions_array(full_size, partial_size):
    quotient, remainder = divmod(full_size, partial_size)
    portions = [partial_size for _ in range(quotient)]
    if remainder != 0:
        portions.append(remainder)
    return portions
