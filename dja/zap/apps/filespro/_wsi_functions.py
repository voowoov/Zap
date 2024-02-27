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
from django.core.files import File
from django.db import transaction
from django.utils.crypto import get_random_string
from django.utils.translation import activate, get_language
from PIL import Image
from zap.apps.filespro._functions import get_link_for_file_viewer_and_download

from .models import FilesproFile, FilesproFolder

logger = logging.getLogger(__name__)


path_directory = settings.WSI_TMP_FILE_DIRECTORY
### the same must be in the js.
chunk_size = 1990  ### websocket message size is limited, see ws protocol overide
max_nb_chunks = 100
max_file_size = 10000000

### other setting
expected_duration_rate = 0.000005  ### s/byte


class WsiFilesproMixin:

    async def wsi_filespro_received_message(self, message):
        await self.init_filespro_folder()
        match message[2]:
            case "u":  # update list of files in filespro_folder
                await self.send_folder_list(message)
            case "s":  # start the upload
                if not self.filespro_transfer_underway:
                    await self.file_upload_demand(message)
                else:
                    raise ValueError("File upload demand during underway transfer.")
            case "c":  # cancel the upload
                await self.cancel_file_upload(message)

    async def init_filespro_folder(self):
        if not self.filespro_folder_id:
            try:
                self.filespro_folder_id = self.scope["user"].filespro_folder_id
            except Exception as e:
                logger.error(f"error: init_filespro_folder: {e}")
                await self.close()

    async def send_folder_list(self, message):
        # the message is pageLanguage
        language_code = message[3:]
        if language_code == "en" or language_code == "fr":
            activate(language_code)
        try:
            data = await sync_to_async(list)(
                FilesproFile.objects.filter(
                    filespro_folder_id=self.filespro_folder_id
                ).values("file_name", "file")
            )
            for d in data:
                file_url = d.get("file")
                urls = get_link_for_file_viewer_and_download(file_url)
                d["view"] = urls["viewer_url"]  # Add into the dictionary
                d["dnld"] = urls["download_url"]  # Add into the dictionary
                del d["file"]
            data_json = json.dumps(data)
            await self.send("f" + message[1] + "u" + str(data_json))
        except Exception as e:
            logger.error(f"error: send_folder_list: {e}")
            await self.close()

    async def cancel_file_upload(self, message):
        try:
            if self.filespro_transfer_underway:
                await self.update_file_tranfer_freq_limiting()
                await self.delete_tmp_files()
                await self.clear_filespro_varibles()
                self.filespro_transfer_underway = False

        except Exception as e:
            logger.error(f"error: cancel_file_upload: {e}")
            await self.close()

    async def update_file_tranfer_freq_limiting(self):
        try:
            nb_bytes_at_end_or_cancel = (
                sum(self.file_portion_array[: self.file_portion_step]) + self.chunk_id
            ) * chunk_size
            await sync_to_async(FilesproFolder.update_freq_limit_storage)(
                self.filespro_folder_id, nb_bytes_at_end_or_cancel
            )
        except Exception as e:
            logger.error(f"error: update_file_tranfer_freq_limiting: {e}")
            await self.close()

    async def delete_tmp_files(self):
        try:
            for filename in glob.glob(self.path_tmp_name + "*"):
                os.remove(filename)
        except Exception as e:
            logger.error(f"error: delete_tmp_files: {e}")
            await self.close()

    async def clear_filespro_varibles(self):
        try:
            del self.upload_type
            del self.tab_id
            del self.file_name
            del self.file_size
            del self.file_portion_step
            del self.file_portion_array
            del self.file_nb_chunks
            del self.chunk_bool_array
            del self.path_tmp_name
            del self.path_full
            del self.chunk_id
        except Exception as e:
            logger.error(f"error: clear_filespro_varibles: {e}")
            await self.close()

    async def file_upload_demand(self, message):
        try:
            if len(message) < 200:
                tab_id = message[1]
                data = json.loads(message[3:])
                self.upload_type = data["upload_type"]
                file_name = data["file_name"]
                file_size = data["file_size"]
                is_valid = True
                remaining_store = await sync_to_async(
                    FilesproFolder.update_freq_limit_and_get_storage
                )(self.filespro_folder_id)
                if file_size > remaining_store[0]:
                    is_valid = False
                    await self.send(
                        "f" + message[1] + "e" + "insufficient remaining space"
                    )
                    return False
                else:
                    if file_size > remaining_store[0] - remaining_store[1]:
                        is_valid = False
                        await self.send("f" + tab_id + "e" + "wait a cooldown period")
                        return False
                match self.upload_type:
                    case "manual":
                        if await sync_to_async(
                            FilesproFile.objects.filter(
                                filespro_folder_id=self.filespro_folder_id,
                                file_name=file_name,
                            ).exists
                        )():
                            is_valid = False
                            await self.send("f" + tab_id + "e" + "file already exists")
                    case "avatar":
                        if not self.scope["user"].is_authenticated:
                            raise ValueError("User not authenticated.")
                        if file_size > 150000:
                            raise ValueError("Image size exceeds limit.")
                    case _:
                        raise ValueError("Inadequate upload_type: " + self.upload_type)
                if not self.is_valid_filename(file_name):
                    is_valid = False
                    await self.send("f" + tab_id + "e" + "invalid file name")
                if is_valid:
                    self.tab_id = tab_id
                    self.filespro_transfer_underway = True
                    self.file_name = file_name
                    self.file_size = file_size
                    self.file_portion_step = 0
                    self.file_portion_array = self.divide_portion_array()
                    self.file_nb_chunks = self.file_portion_array[
                        self.file_portion_step
                    ]
                    self.chunk_bool_array = [False] * self.file_nb_chunks
                    random_name = "u" + get_random_string(1) + "u"
                    self.path_tmp_name = (
                        path_directory + random_name
                    )  ### only one random letter name to limit the number of possible tmp_files
                    self.path_full = (
                        self.path_tmp_name + "full." + self.file_name.split(".")[-1]
                    )
                    ### empty the full file
                    with open(self.path_full, "wb") as file:
                        pass
                    await self.send("f" + self.tab_id + "a")
            else:
                raise ValueError(f"Message too long: {message}")
        except Exception as e:
            logger.error(f"error: file_upload_demand: {e}")
            await self.close()

    async def filespro_receive_bytes_chunk(self, bytes_data):
        try:
            ### The first 4 bytes are your integer, the current self.chunk_id
            self.chunk_id = struct.unpack("<I", bytes_data[:4])[0]
            if self.chunk_bool_array[self.chunk_id]:
                raise ValueError(f"unexpected chunk id repeate")
            else:
                self.chunk_bool_array[self.chunk_id] = True
                if self.filespro_transfer_underway:
                    path = self.path_tmp_name + str(self.chunk_id)
                    with open(path, "wb") as f:
                        f.write(bytes_data[4:])
                    ### Check if all the chunks of this partial file are received
                    if all(self.chunk_bool_array):
                        ### make a partial file
                        path_partial = self.path_tmp_name + "out"
                        with open(path_partial, "wb") as output_file:
                            for x in range(self.file_nb_chunks):
                                chunk_file_path = self.path_tmp_name + str(x)
                                with open(chunk_file_path, "rb") as partial_file:
                                    partial_file_data = partial_file.read()
                                    output_file.write(partial_file_data)
                        ### add the partial file to the full file
                        with open(self.path_full, "ab") as output_file:
                            with open(path_partial, "rb") as partial_file:
                                partial_file_data = partial_file.read()
                                output_file.write(partial_file_data)
                        ### the full file is complete
                        if self.file_portion_step == len(self.file_portion_array) - 1:
                            if os.path.getsize(self.path_full) != self.file_size:
                                logger.error(
                                    "error: wsi file upload unexpected alert inconsistent file size"
                                )
                            else:
                                ### Transfer finished
                                match self.upload_type:
                                    case "manual":
                                        await self.save_file_to_filespro_file()
                                    case "avatar":
                                        if self.scope["user"].is_authenticated:
                                            await self.save_file_to_user_avatar()
                                    case _:
                                        raise ValueError(f"unexpected upload_type")
                                logger.info(
                                    f"wsi file upload of {self.file_name} finished"
                                )
                                await self.delete_tmp_files()
                                await self.clear_filespro_varibles()
                                self.filespro_transfer_underway = False
                        ### ask for next partial file's serie of chunks
                        else:
                            self.chunk_id = 0  # to calculate bytes transfered at cancel
                            self.file_portion_step += 1
                            self.file_nb_chunks = self.file_portion_array[
                                self.file_portion_step
                            ]
                            self.chunk_bool_array = [False] * self.file_nb_chunks
                            await self.send("f" + self.tab_id + "a")

        except Exception as e:
            logger.error(f"error: filespro_receive_bytes_chunk: {e}")
            await self.close()

    async def save_file_to_filespro_file(self):
        try:
            with open(self.path_full, "rb") as output_file:
                filespro_file = await sync_to_async(FilesproFile.objects.create)(
                    filespro_folder_id=self.filespro_folder_id,
                    file=File(output_file),
                    file_name=self.file_name,
                    file_size=self.file_size,
                )
            ### send received confirmation
            await self.send("f" + self.tab_id + "r")
        except Exception as e:
            logger.error(f"error: save_file_to_filespro_file: {e}")
            await self.close()

    async def save_file_to_user_avatar(self):
        try:
            with Image.open(self.path_full) as img:
                img.verify()  # will throw an exception if not verified
            with Image.open(self.path_full) as img:
                width, height = img.size
                if img.format == "PNG" and width == height == 205:
                    # If the image is 32-bit (RGBA), convert it to 24-bit (RGB)
                    if img.mode == "RGBA":
                        img = img.convert("RGB")
                    img.save(self.path_full, "PNG")
                    with open(self.path_full, "rb") as img_file:
                        self.scope["user"].avatar.delete(save=False)
                        self.scope["user"].avatar = File(img_file)
                        await sync_to_async(self.scope["user"].save)()
                        ### send received confirmation
                        await self.send(
                            "f" + self.tab_id + "r" + self.scope["user"].avatar.url
                        )
                        await self.update_file_tranfer_freq_limiting()
                        return True
            raise ValueError("Image is not adequate.")
        except Exception as e:
            logger.error(f"error: save_file_to_user_avatar: {e}")
            await self.close()
        return False

    def is_valid_filename(self, filename):
        # Check total length
        if len(filename) > 255:
            return False
        # Check extension length
        parts = filename.split(".")
        if len(parts) < 2 or len(parts[-1]) < 2 or len(parts[-1]) > 7:
            return False
        # Check invalid characters
        if re.search(r'[<>:"/\\|?*]', filename):
            return False
        # Check for trailing spaces or periods
        if filename[-1] in [" ", "."]:
            return False
        # Check for non-printable characters
        if any(ord(char) < 32 or 126 < ord(char) < 160 for char in filename):
            return False
        return True

    # Nb of chunks per step, with file_size 2156, max_nb_chunks 100 and chunk_size 10, will output: [100, 100, 16]
    def divide_portion_array(self):
        partial_size = chunk_size * max_nb_chunks
        quotient, remainder = divmod(self.file_size, partial_size)
        portion_array = [max_nb_chunks for _ in range(quotient)]
        if remainder != 0:
            portion_array.append(math.ceil(remainder / chunk_size))
        return portion_array
