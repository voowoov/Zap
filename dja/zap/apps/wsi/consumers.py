from datetime import datetime
import asyncio
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.cache import cache
from django.utils.translation import get_language
import zap.apps.search.typesense as ts
import time
import math
import json
import struct
import uuid
import os
import re
from pathlib import Path

path_directory = settings.WSI_TMP_FILE_DIRECTORY


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
                            await self.file_upload_demand(message)
                        case _:
                            pass
            elif bytes_data:
                # Handle binary message
                if len(bytes_data) > 4 and hasattr(self, "file_bool_array"):
                    await self.receive_file_bytes(bytes_data)
                else:
                    print("missing init attribute")
                    await self.close()
            else:
                await self.close()
        except Exception as e:
            await self.close()
            print(e)

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

    async def file_upload_demand(self, message):
        try:
            data = json.loads(message)
            if len(message) < 100:
                file_name = data["file_name"]
                file_size = data["file_size"]
                if is_valid_filename(file_name):
                    if file_size < settings.WSI_DEFAULT_MAX_FILE_SIZE:
                        chunk_size = settings.WSI_MESSAGE_MAX_SIZE - 10
                        self.file_name = file_name
                        self.file_tmp_name = str(uuid.uuid4())[:4]
                        self.file_size = file_size
                        self.file_nb_chunks = math.ceil(file_size / chunk_size)
                        self.file_bool_array = [False] * self.file_nb_chunks
                        with open(
                            path_directory + self.file_tmp_name + "full", "w"
                        ) as file:
                            pass
                        await self.send("fcontinue")
            else:
                await self.close()
        except:
            await self.close()

    async def receive_file_bytes(self, bytes_data):
        try:
            # The first 4 bytes are your integer, the current chunk_id
            chunk_id = struct.unpack("<I", bytes_data[:4])[0]
            if self.file_bool_array[chunk_id]:
                print("alert chunk id repeated")
                await self.close()
            else:
                self.file_bool_array[chunk_id] = True
                path = path_directory + self.file_tmp_name + str(chunk_id)
                fileData = bytes_data[4:]
                with open(path, "wb") as f:
                    f.write(fileData)
                # Check if all the values in the array are True, meaning the upload is finish and merge the tmp files into one
                if all(self.file_bool_array):
                    output_file_path = path_directory + self.file_tmp_name + "out"
                    with open(output_file_path, "wb") as output_file:
                        for x in range(self.file_nb_chunks):
                            partial_file_path = (
                                path_directory + self.file_tmp_name + str(x)
                            )
                            with open(partial_file_path, "rb") as partial_file:
                                partial_file_data = partial_file.read()
                                output_file.write(partial_file_data)
                    if os.path.getsize(output_file_path) != self.file_size:
                        print("alert inconsistent file size")
                    else:
                        print(f"upload of {self.file_tmp_name} finished")

        except PermissionError as e:
            await self.close()
            print(e)


def is_valid_filename(filename):
    # Check if filename starts with alphanumeric or underscore, followed by alphanumeric, underscore, hyphen, and contains only one dot
    # Check if extension is alphanumeric
    if not re.match(r"^\w[\w-]*\.\w+$", filename):
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
