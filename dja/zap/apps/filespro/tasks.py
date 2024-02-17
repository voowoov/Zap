import glob
import logging
import os

from celery import shared_task
from django.conf import settings
from django.core.management import call_command
from maintenance_mode.core import get_maintenance_mode, set_maintenance_mode

logger = logging.getLogger(__name__)


###  run that task periodically - tmp_files may accumulate in case of problems where tmp_files dont get deleted properly
def delete_upload_tmp_files():
    try:
        files = glob.glob(settings.WSI_TMP_FILE_DIRECTORY + "*")
        for file in files:
            if os.path.isfile(file):
                os.remove(file)
        return f"{len(files)} tmp_files deleted"
    except Exception as e:
        logger.error(f"delete_upload_tmp_files: {e}")
        return f"tmp_file deletion failed"