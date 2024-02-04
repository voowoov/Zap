import asyncio
import glob
import json
import logging
import math
import os
import re
import struct
import time
import uuid
from datetime import datetime
from pathlib import Path

import zap.apps.search.typesense as ts
from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.cache import cache
from django.core.files import File
from django.utils.translation import get_language

from .models import FileUpload

path_directory = settings.WSI_TMP_FILE_DIRECTORY
chunk_size = 1990  # the same must be in the js. Also see websocket message size that i limited protocol, i limited the message size
max_nb_chunks = 100  # the same must be in the js.

logger = logging.getLogger(__name__)


class WsiConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.channel_name_abr = None
        await self.accept()

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
                            await self.file_upload_demand(message, self.scope["user"])
                        case _:
                            pass
            elif bytes_data:
                # Handle binary message
                if len(bytes_data) > 4 and hasattr(self, "file_portion_array"):
                    await self.receive_file_bytes(bytes_data)
                else:
                    logger.error(
                        "wsi file upload unexpected binary message is too short or is missing initial attribute"
                    )
                    await self.close()
            else:
                await self.close()
        except Exception as e:
            await self.close()
            logger.error("wsi receive : " + e)

    async def frequency_limiting(self, thenthseconds):
        num = self.channel_name_abr or (250 << 16) | (250 << 8) | 0
        # stored in 4 bytes in one integer (int is 4 bytes)
        # Extract the bytes
        score = (num >> 8) & 0xFF  # 2nd byte out of 4
        timer = num & 0xFF  # last byte (lsb)
        # the timer is each 25 seconds with one decimal (0-250) time.time() is epoch time in s
        new_timer = int(time.time() % 25 * 10)  # in 0.1s
        if new_timer < timer:
            diff = 250 - timer + new_timer
        else:
            diff = new_timer - timer
        # score function (in 0.1s) the score is from 0-250
        score = min((score - thenthseconds + diff), 250)
        if score < 0:
            await self.close()
        num = (score << 8) | new_timer
        self.channel_name_abr = num

        print("score: ", score)

    async def file_upload_demand(self, message, owner_object):
        try:
            data = json.loads(message)
            if len(message) < 100:
                file_name = data["file_name"]
                file_size = data["file_size"]
                if is_valid_filename(file_name):
                    if file_size < settings.WSI_DEFAULT_MAX_FILE_SIZE:
                        self.owner_object = owner_object
                        self.file_name = file_name
                        self.file_tmp_name = str(uuid.uuid4())[:4]
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
            logger.error("wsi file upload demand : " + e)

    async def receive_file_bytes(self, bytes_data):
        try:
            # The first 4 bytes are your integer, the current chunk_id
            chunk_id = struct.unpack("<I", bytes_data[:4])[0]
            if self.chunk_bool_array[chunk_id]:
                logger.error("wsi file upload alert unexpected chunk id repeated")
                await self.close()
            else:
                self.chunk_bool_array[chunk_id] = True
                path = path_directory + self.file_tmp_name + str(chunk_id)
                fileData = bytes_data[4:]
                with open(path, "wb") as f:
                    f.write(fileData)
                # Check if all the chunks of this partial file are received
                if all(self.chunk_bool_array):
                    output_file_path = (
                        path_directory
                        + self.file_tmp_name
                        + "out"
                        + str(self.file_portion_step)
                    )
                    # make a partial file
                    with open(output_file_path, "wb") as output_file:
                        for x in range(self.file_nb_chunks):
                            partial_file_path = (
                                path_directory + self.file_tmp_name + str(x)
                            )
                            with open(partial_file_path, "rb") as partial_file:
                                partial_file_data = partial_file.read()
                                output_file.write(partial_file_data)
                    if self.file_portion_step == len(self.file_portion_array) - 1:
                        # make the final file
                        output_file_path = (
                            path_directory
                            + self.file_tmp_name
                            + "full."
                            + self.file_name.split(".")[-1]
                        )
                        with open(output_file_path, "wb") as output_file:
                            for x in range(len(self.file_portion_array)):
                                partial_file_path = (
                                    path_directory + self.file_tmp_name + "out" + str(x)
                                )
                                with open(partial_file_path, "rb") as partial_file:
                                    partial_file_data = partial_file.read()
                                    output_file.write(partial_file_data)
                        if os.path.getsize(output_file_path) != self.file_size:
                            logger.error(
                                "wsi file upload unexpected alert inconsistent file size"
                            )
                        else:
                            # send the final file a new FileUpload model object
                            with open(output_file_path, "rb") as output_file:
                                obj = await sync_to_async(FileUpload.objects.create)(
                                    owner_object=self.owner_object,
                                    file=File(output_file),
                                    file_name=self.file_name,
                                )
                            # delete the tmp files
                            for filename in glob.glob(
                                path_directory + self.file_tmp_name + "*"
                            ):
                                os.remove(filename)
                            logger.info("wsi file upload of {self.file_name} finished")
                            # send received confirmation
                            await self.send("freceived")
                    else:
                        self.file_portion_step += 1
                        self.file_nb_chunks = math.ceil(
                            self.file_portion_array[self.file_portion_step] / chunk_size
                        )
                        self.chunk_bool_array = [False] * self.file_nb_chunks
                        await self.send("fcontinue")

        except PermissionError as e:
            await self.close()
            logger.error("wsi file upload receiving : " + e)


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
