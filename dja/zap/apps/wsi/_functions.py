import json
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.templatetags.static import static
from zap.apps.wsi.models import WsiConnection

UserModel = get_user_model()

logger = logging.getLogger(__name__)


def set_wsi_connection_track(user, channel_name):
    WsiConnection.objects.create(user=user, channel_name=channel_name)


def delete_wsi_connection_track(channel_name):
    try:
        WsiConnection.objects.get(channel_name=channel_name).delete()
    except Exception as e:
        logger.error(f"error: delete_wsi_connection_track: {e}")


def get_wsi_connection_track_count(user):
    return WsiConnection.objects.filter(user=user).count()
