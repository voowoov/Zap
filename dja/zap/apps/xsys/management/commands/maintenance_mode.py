import subprocess  # to run .bat files

from django.core.management import call_command
from django.core.management.base import BaseCommand
from zap.apps.xsys.tasks import maintenance_mode_backups


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        maintenance_mode_backups(10)
