import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "zap.settings")

app = Celery("zap")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


###################### Add when Django is NOT running on Docker ##########################
# BASE_REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
# app.conf.broker_url = BASE_REDIS_URL
###################### Add when Django is NOT running on Docker ##########################


##################################### CELERY BEAT start #####################################
### Celery beat calls tasks periodically, settings bellow.
### Celery beat, this setup only works when everything is on Docker, including django
### Comment this when working with django outside of Docker


app.conf.beat_schedule = {
    # "maintenance_mode_for_backups_crontab": {
    #     "task": "maintenance_mode_backups",
    #     "schedule": crontab(hour="*", minute="*", day_of_week="*"),
    #     "args": (10,),
    # },
    # "clearsessions_everyday_crontab": {
    #     "task": "clearsessions_task",
    #     "schedule": crontab(hour="9", minute="0", day_of_week="*"),
    # },
    # "add-every-minute-contrab": {
    #     "task": "multiply_two_numbers",
    #     "schedule": crontab(hour="*", minute="*", day_of_week="*"),
    #     "args": (16, 16),
    # },
    # "add-every-30-seconds": {
    #     "task": "multiply_two_numbers",
    #     "schedule": 30.0,
    #     "args": (16, 16),
    # },
}
##################################### CELERY BEAT end #######################################
