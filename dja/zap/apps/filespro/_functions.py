import logging
import os

from django.conf import settings
from django.core import signing
from django.urls import reverse
from django.utils.translation import activate, get_language
from zap.apps.filespro.models import FilesproFile, FilesproFolder

logger = logging.getLogger(__name__)

custom_salt = os.getenv("DJANGO_SIGNED_URL_SALT")


# To encode a signed URL
def get_link_for_file_viewer_and_download(file_url):
    base_name = os.path.basename(file_url)
    signer = signing.TimestampSigner(salt=custom_salt)
    signed_url = signer.sign(base_name)
    download_url = reverse("filespro:download_file", kwargs={"signed_url": signed_url})
    match get_viewer_type(base_name):
        case None:
            urls = {"viewer_url": "", "download_url": download_url}
        case "image":
            urls = {
                "viewer_url": reverse(
                    "filespro:image_viewer", kwargs={"signed_url": signed_url}
                ),
                "download_url": download_url,
            }
        case "pdf":
            urls = {
                "viewer_url": reverse(
                    "filespro:file_viewer", kwargs={"signed_url": signed_url}
                ),
                "download_url": download_url,
            }
    return urls


# To decode a signed URL
def get_file_value_from_signed_url(signed_url):
    signer = signing.TimestampSigner(salt=custom_salt)
    try:
        base_name = signer.unsign(signed_url, max_age=3600)
        file_url = (
            settings.PRIVATE_STORAGE_BASE_URL
            + settings.PRIVATE_STORAGE_SUBFOLDER
            + base_name
        )
        return {
            "base_name": base_name,
            "file_url": file_url,
            "content_type": get_nginx_content_type(base_name),
        }
    except signing.SignatureExpired:
        logger.info(
            f"info: get_file_url_from_filespro_file_signed_url: Signature has expired!"
        )
    except signing.BadSignature:
        logger.info(f"info: get_file_url_from_filespro_file_signed_url: Bad signature!")
    return None


def get_viewer_type(file_name):
    extension = file_name.split(".")[-1]
    match (extension):
        case "pdf":
            return "pdf"
        case "png" | "jpg" | "jpeg":
            return "image"
        case _:
            return None


def get_nginx_content_type(file_name):
    extension = file_name.split(".")[-1]
    match (extension):
        case "pdf":
            return "application/pdf"
        case "png":
            return "image/png"
        case "jpg" | "jpeg":
            return "image/jpg"
        case _:
            return None
