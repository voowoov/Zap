import logging
import random
import time

from celery import shared_task
from django.core.management import call_command
from maintenance_mode.core import get_maintenance_mode, set_maintenance_mode

logger = logging.getLogger(__name__)


### remove expired sessions from the database
@shared_task(name="clear_sessions")
def clear_sessions():
    # à faire !!!
    return f"clear_sessions done"


### remove unused image media files that are not referenced in the content
@shared_task(name="clear_article_images")
def clear_article_images():
    # à faire !!!
    return f"clear_article_images done"


### Put the website in maintenance mode for the backup duration (see celery.py)
@shared_task(name="maintenance_mode_backups")
def maintenance_mode_backups(duration_seconds):
    set_maintenance_mode(True)
    time.sleep(duration_seconds)
    if get_maintenance_mode():
        set_maintenance_mode(False)
    return f"maintenance_mode_backups done"


### Dummy task for testing
@shared_task(name="asdf")
def asdf():
    return 1234


### Dummy task for testing
@shared_task(name="multiply_two_numbers")
def multiply_two_numbers(x, y):
    total = float(x) * float(y)
    return total
