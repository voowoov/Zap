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
from django.utils.crypto import get_random_string
from PIL import Image

from .models import FilesproFile, FilesproFolder

logger = logging.getLogger(__name__)

path_directory = settings.WSI_TMP_FILE_DIRECTORY
### the same must be in the js.
chunk_size = 1990  ### websocket message size is limited, see ws protocol overide
max_nb_chunks = 100
max_file_size = 10000000

### other setting
expected_duration_rate = 0.000005  ### s/byte


class WSIPrivFilesMixin:

    async def wsi_filespro_received_message(self):
        await self.init_filespro_folder()
        match self.message[0]:
            case "u":  # update list of files in filespro_folder
                await self.send_folder_list()
            case "s":  # start the upload
                if not self.filespro_transfer_underway:
                    await self.file_upload_demand(self.message[1:])
                else:
                    raise ValueError("File upload demand during underway transfer.")
            case "c":  # cancel the upload
                await self.cancel_file_upload(self.message[1:])

    async def init_filespro_folder(self):
        if not self.filespro_enabled:
            try:
                self.filespro_folder = await sync_to_async(FilesproFolder.objects.get)(
                    pk=self.scope["user"].filespro_folder_id
                )
                self.filespro_enabled = True
            except Exception as e:
                logger.error(f"error: init_filespro_folder: {e}")
                await self.close()

    async def send_folder_list(self):
        try:
            data = await sync_to_async(list)(
                FilesproFile.objects.filter(
                    filespro_folder=self.filespro_folder
                ).values("file_name", "file")
            )
            data_json = json.dumps(data)
            await self.send("f" + self.tab_id + "u" + str(data_json))
        except Exception as e:
            logger.error(f"error: send_folder_list: {e}")
            await self.close()

    async def cancel_file_upload(self, message):
        try:
            if self.filespro_transfer_underway:
                self.filespro_transfer_underway = False
                await self.update_file_tranfer_canceled()
                await self.delete_tmp_files()
        except Exception as e:
            logger.error(f"error: cancel_file_upload: {e}")
            await self.close()

    async def delete_tmp_files(self):
        try:
            for filename in glob.glob(self.path_tmp_name + "*"):
                os.remove(filename)
        except Exception as e:
            logger.error(f"error: delete_tmp_files: {e}")
            await self.close()

    async def update_file_tranfer_canceled(self):
        try:
            nb_bytes_at_cancel = (
                sum(self.file_portion_array[: self.file_portion_step]) + self.chunk_id
            ) * chunk_size
            await sync_to_async(
                self.filespro_folder.update_freq_lim_get_remaining_store
            )(nb_bytes_at_cancel)
        except Exception as e:
            logger.error(f"error: file_tranfer_canceled: {e}")
            await self.close()

    async def file_upload_demand(self, message):
        try:
            if len(message) < 200:
                data = json.loads(message)
                self.upload_type = data["upload_type"]
                file_name = data["file_name"]
                file_size = data["file_size"]
                is_valid = True
                remaining_store = await sync_to_async(
                    self.filespro_folder.update_freq_lim_get_remaining_store
                )()
                if file_size > remaining_store[0]:
                    is_valid = False
                    await self.send(
                        "f" + self.tab_id + "e" + "insufficient remaining space"
                    )
                    return False
                else:
                    if file_size > remaining_store[0] - remaining_store[1]:
                        is_valid = False
                        await self.send(
                            "f" + self.tab_id + "e" + "wait a cooldown period"
                        )
                        return False
                match self.upload_type:
                    case "manual":
                        if await sync_to_async(
                            FilesproFile.objects.filter(
                                filespro_folder=self.filespro_folder,
                                file_name=file_name,
                            ).exists
                        )():
                            is_valid = False
                            await self.send(
                                "f" + self.tab_id + "e" + "file already exists"
                            )
                    case "avatar":
                        if not self.scope["user"].is_authenticated:
                            raise ValueError("User not authenticated.")
                        if file_size > 170000:
                            raise ValueError("Image size exceeds limit.")
                    case _:
                        raise ValueError("Inadequate upload_type: " + self.upload_type)
                if not self.is_valid_filename(file_name):
                    is_valid = False
                    await self.send("f" + self.tab_id + "e" + "invalid file name")
                if is_valid and self.tab_id:
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
            logger.error(f"error: wsi file upload demand: {e}")
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
                                self.filespro_transfer_underway = False
                                match self.upload_type:
                                    case "manual":
                                        await self.save_file_to_file_upload_file()
                                        await self.send_folder_list()
                                    case "avatar":
                                        if self.scope["user"].is_authenticated:
                                            await self.save_file_to_user_avatar()
                                    case _:
                                        raise ValueError(f"unexpected upload_type")
                                await self.delete_tmp_files()
                                logger.info(
                                    f"wsi file upload of {self.file_name} finished"
                                )
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
            logger.error(f"error: wsi file upload receiving: {e}")
            await self.close()

    async def save_file_to_file_upload_file(self):
        try:
            with open(self.path_full, "rb") as output_file:
                file_upload_file = await sync_to_async(FilesproFile.objects.create)(
                    filespro_folder=self.filespro_folder,
                    file=File(output_file),
                    file_name=self.file_name,
                    file_size=self.file_size,
                )
            ### send received confirmation
            await self.send("f" + self.tab_id + "r")
        except Exception as e:
            logger.error(f"error: save_file_to_file_upload_file: {e}")
            await self.close()

    async def save_file_to_user_avatar(self):
        try:
            with open(self.path_full, "rb") as output_file:
                if output_file.name.endswith(".png"):
                    Image.MAX_IMAGE_PIXELS = 56000
                    im = Image.open(output_file)
                    if im.format == "PNG":
                        im.verify()  # will throw an exception if not verifed
                        width, height = im.size
                        if width == height == 235:
                            self.scope["user"].avatar.delete(save=False)
                            self.scope["user"].avatar = File(output_file)
                            await sync_to_async(self.scope["user"].save)()
                            ### send received confirmation
                            await self.send("f" + self.tab_id + "r")
                            return True
            raise ValueError("Image is not adequate.")
        except Exception as e:
            logger.error(f"error: save_file_to_user_avatar: {e}")
            await self.close()
        return False

    def is_valid_filename(self, filename):
        # Check if filename starts with alphanumeric or underscore, followed by alphanumeric, underscore, hyphen, and contains only one dot
        # Check if extension is alphanumeric
        if not re.match(r"^\w[\w\s-]*\S\.\w+$", filename):
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

    # Nb of chunks per step, with file_size 2156, max_nb_chunks 100 and chunk_size 10, will output: [100, 100, 16]
    def divide_portion_array(self):
        partial_size = chunk_size * max_nb_chunks
        quotient, remainder = divmod(self.file_size, partial_size)
        portion_array = [max_nb_chunks for _ in range(quotient)]
        if remainder != 0:
            portion_array.append(math.ceil(remainder / chunk_size))
        return portion_array
