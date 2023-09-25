from django import forms
from django.forms import Form, ModelForm
from django.utils.translation import gettext_lazy as _
from zap.apps.chat.models import ChatSession


class ChatSessionInitForm(ModelForm):
    # chat_host_id = forms.IntegerField()

    class Meta:
        model = ChatSession
        fields = [
            "chat_host_id",
            "anonymous_chat_client_name",
            "anonymous_chat_client_desc",
            "chat_subject",
        ]
