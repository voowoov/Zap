import logging
import random
import time

from celery import shared_task
from django.core.management import call_command
from maintenance_mode.core import get_maintenance_mode, set_maintenance_mode

logger = logging.getLogger(__name__)


### remove expired sessions from the database (python manage.py clearsessions)
@shared_task(name="clearsessions_task")
def clearsessions_task():
    call_command("clearsessions")
    return None


### remove unused image media files that are not referenced in the content
@shared_task(name="clear_article_images_task")
def clear_article_images_task():
    # à faire !!!
    return None


### Put the website in maintenance mode for the backup duration (see celery.py)
@shared_task(name="maintenance_mode_backups")
def maintenance_mode_backups(duration_seconds):
    set_maintenance_mode(True)
    time.sleep(duration_seconds)
    if get_maintenance_mode():
        set_maintenance_mode(False)
    return None


### Dummy task for testing
@shared_task(name="multiply_two_numbers")
def mul(x, y):
    total = x * (y * random.randint(3, 100))
    return total


### Dummy task for testing
@shared_task(name="sum_list_numbers")
def xsum(numbers):
    return sum(numbers)


### remove expired sessions from the database (python manage.py clearsessions)
@shared_task(name="clearsessions_task")
def clearsessions_task():
    call_command("clearsessions")
    return None
