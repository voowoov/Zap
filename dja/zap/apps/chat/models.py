import datetime

from dateutil import tz
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from zap.apps.users.models import User


class ChatGuestUser(models.Model):
    sessionid = models.CharField(
        max_length=255, null=True, blank=True
    )  # ChatGuestUser_id is also in the session data of the client
    name = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(max_length=255, null=True, blank=True)


class ChatSession(models.Model):
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name="host_user")
    users = models.ManyToManyField(User, blank=True)
    guests = models.ManyToManyField(ChatGuestUser, blank=True)

    last_updated = models.DateTimeField(default=timezone.now)
    ####### Conversation #######
    ### 3 ASCII characters for the [day after 2023-01-01 0h UTC-0], [minute of the day], [milliseconds of minute]
    ### 1 ASCII characters for the participant number (0 to ...) staff is 0
    ### 1 ASCII characters for type: 0 for message, 1 for image, 2 for other files
    ### Message text or filename;
    ### "ããã20Hello,ããã00Hi,ãã21filename.png" csv of user id or anonymous id (stored in session) if "a" at beginning (remove the "a")
    conversation = models.TextField()

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
