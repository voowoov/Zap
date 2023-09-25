import datetime
import subprocess  # to run .bat .sh files
from time import sleep

from dateutil import tz
from django.core.files.base import ContentFile
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.utils import timezone
from zap.apps.accounts.models import Account, AddressCpProject, AddressUPS, Param
from zap.apps.articles.forms import ArticleForm, AuthorForm, ImageContentForm
from zap.apps.articles.models import Article, Author, ImageContent
from zap.apps.chat.models import ChatSession
from zap.apps.users.models import User


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # delete all migration files and db.sqlite3
        # subprocess.call(
        #     [r"C:\Users\etien\OneDrive\Desktop\MyPython\Dja\Zap\dja\delmig.bat"]
        # )
        subprocess.call("cd /usr/src/app/", shell=True)
        subprocess.call('find . -path "*/migrations/0*.py" -delete', shell=True)
        subprocess.call('find . -path "*/__pycache__/*.pyc" -delete', shell=True)

        # initiate migrations
        # call_command("makemigrations")
        subprocess.call(["/usr/src/app/manage.py", "makemigrations"])
        call_command("migrate")

        call_command("compilemessages")

        # fill initial data in database
        if Param.objects.all().count() == 0:
            param = Param(last_account_number=500)
            param.save()

        superuser = User.objects.create_superuser(
            email="a@a.com",
            password="p",
            social_name="Etienne",
            social_desc="staff",
        )

        user = User.objects.create_user(
            email="e@e.com",
            password="p",
        )
        user.first_name = "john"
        user.last_name = "lennon"
        user.is_staff = True
        user.is_responsible = True
        user.social_name = "John Lennon"
        user.social_desc = "staff 2"
        user.save()

        addresscp = AddressCpProject.objects.create(
            account=user.account,
            name="John Lennon",
            unit_number="35",
            add_info="Les Beatles Inc.",
            address_1="8185 Richelieu Ave.",
            city="Saint-Hilaire",
            province="QC",
            postal_code="H9R 0K2",
            country="CA",
        )
        addressups = AddressUPS.objects.create(
            account=user.account,
            name="John Lennon",
            address_1="8185 Richelieu Ave.",
            address_2="apt 1",
            city="Saint-Hilaire",
            province="QC",
            postal_code="H9R 0K2",
            country="CA",
        )

        time = datetime.datetime(
            2023, 1, 18, 14, 25, 12, 124000, tzinfo=tz.gettz("UTC+0")
        )
        origin = datetime.datetime(1999, 1, 1, tzinfo=tz.gettz("UTC+0"))
        delta = time - origin
        date_chars = (
            chr(delta.days)
            + chr(int(delta.seconds / 60))
            + chr(time.second * 1000 + int(time.microsecond / 1000))
        )

        # my_chat_session = ChatSession.objects.create(
        #     participants="a32421,5432,a53245",
        #     conversation=date_chars + chr(1) + chr(0) + "Hello" + "," + date_chars + chr(0) + chr(1) + "Felis.png",
        # )

        ################### Add articles ##########################
        user_id = str(User.objects.get(email="a@a.com").id)
        data = {
            "author_slug": "etienne",
            "user": user_id,
            "name_fr": "etienne fr",
            "name_en": "etienne en",
        }
        form = AuthorForm(data)
        if form.is_valid():
            obj = form.save()
        author_id = str(Author.objects.get(author_slug="etienne").id)
        date_time_now = str(timezone.now())
        for i in range(100):
            data = {
                "article_slug": ("asdf" + str(i)),
                "author": author_id,
                "title_fr": "Un Titre",
                "title_en": "A Title",
                "subtitle_fr": "un soutitre",
                "subtitle_en": "a subtitle",
                "content_fr": "Contenu ...",
                "content_en": "Content ...",
                "created_at": date_time_now,
                "updated_at": date_time_now,
            }
            form = ArticleForm(data)
            if form.is_valid():
                obj = form.save()
                #### save image field from path #####
                # obj = form.save(commit=False)
                # a = r"C:\Users\etien\OneDrive\Desktop\Felis.png"
                # with open(a, 'rb') as f:
                #     img_data = f.read()
                # obj.image_main.save('image_name.png', ContentFile(img_data), save=True)
            else:
                print(form.errors)
