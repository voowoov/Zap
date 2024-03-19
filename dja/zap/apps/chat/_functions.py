import json
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.templatetags.static import static

UserModel = get_user_model()

logger = logging.getLogger(__name__)


def set_default_chat_sessions(username_list):
    queryset = UserModel.objects.filter(username__in=username_list)
    default_avatar = "/images/icons/avatar.svg"
    json_data = []
    for index, obj in enumerate(queryset):
        data_dict = {
            "index": index,
            "name": obj.first_name + obj.last_name,
            "role_en": obj.role_en,
            "role_fr": obj.role_fr,
            "avatar": obj.avatar.url if obj.avatar else static(default_avatar),
        }
        json_data.append(data_dict)
    cache.set("chat_default_sessions_json", json_data)
