import datetime

from dateutil import tz
from django.conf import settings
from django.core.cache import cache
from django.core.files.storage import FileSystemStorage
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from zap.apps.filespro.models import FilesproFolder
from zap.apps.users.models import User

chat_fs = FileSystemStorage(location=settings.PRIVATE_STORAGE_ROOT / "chat_files")


def upload_to_path(instance, filename):
    return f"{instance.id}.txt"


class ChatSession(models.Model):
    subject = models.CharField(max_length=255)

    users = models.ManyToManyField(User, blank=True, through="Usership")

    filespro_folder = models.ForeignKey(
        FilesproFolder, on_delete=models.PROTECT, null=True, blank=True
    )

    ####### Conversation #######
    ### 3 ASCII characters for the [day after 2023-01-01 0h UTC-0], [minute of the day], [milliseconds of minute]
    ### 1 ASCII characters for the participant number (0 to ...) staff is 0
    ### 1 ASCII characters for type: 0 for message, 1 for image, 2 for other files
    ### Message text or filename;
    ### "ããã20Hello,ããã00Hi,ãã21filename.png" csv of user id or anonymous id (stored in session) if "a" at beginning (remove the "a")

    chat_file = models.FileField(storage=chat_fs, upload_to=upload_to_path, blank=True)

    # def get_conversation(self):
    #     list = []
    #     array = self.conversation.split(",")
    #     for string in array:
    #         ### first 3 chars give timezone
    #         time = self.three_chars_to_date(string[:3])
    #         list.append([time, ord(string[3]), ord(string[4]), string[5:]])
    #     return list

    # def three_chars_to_date(self, three_chars):
    #     origin = datetime.datetime(1999, 1, 1, tzinfo=tz.gettz("UTC+0"))
    #     time = (
    #         origin
    #         + datetime.timedelta(days=ord(three_chars[0]))
    #         + datetime.timedelta(minutes=ord(three_chars[1]))
    #         + datetime.timedelta(milliseconds=ord(three_chars[2]))
    #     )
    #     return time


class Usership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    chat_session = models.ForeignKey(ChatSession, on_delete=models.CASCADE)
    is_host = models.BooleanField(_("is_host"), default=False)
