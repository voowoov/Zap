from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # call_command("dumpdata", "inventory.Product", "--output demo/fixtures/products.json")
        call_command(
            "dumpdata",
            "articles.Article",
            indent=4,
            stdout=open("zap/apps/xsys/fixtures/article.json", "w"),
        )
