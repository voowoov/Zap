import datetime
import json
import logging

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import FileResponse, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils import timezone, translation
from django.utils.decorators import method_decorator
from django.utils.encoding import force_str
from django.utils.html import escape
from django.utils.http import urlsafe_base64_decode
from django.utils.translation import get_language
from django.utils.translation import gettext_lazy as _
from django.utils.translation import to_locale
from django.views import View
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from zap.apps.users.models import User


def test(request):
    # translation.activate("en")
    # print(_("Are you sure?"))

    ## browser language setting
    # print(request.META.get("HTTP_ACCEPT_LANGUAGE", ["en"])[:2])

    # get active locale (ex fr -> fr  or  fr-ca -> fr_CA)
    # print(to_locale(get_language()))

    # print(timezone.localtime(timezone.now()))
    # print(_(timezone.get_current_timezone_name()))

    # timezone.activate("Canada/Central")
    # print(_(timezone.get_current_timezone_name()))

    # import zoneinfo
    # print(zoneinfo.available_timezones())

    # print(timezone.localtime(timezone.now()))
    # if request.user.is_authenticated:

    # print(request.user.addresscp_set.first())
    #     print(request.user.addressups_set.first())

    # logger = logging.getLogger(__name__)
    # logger.warning("Platform is running at riskyy.")

    # # Parameters ?..&..
    # user = request.GET.get("user", "Anonymous")
    # n = request.GET.get("n", "Anonymous")
    # print(user, n)
    # resp = HttpResponseRedirect("test")

    ### use task without celery
    # from zap.apps.accounts.tasks import send_mass_email_promo_task
    # send_mass_email_promo_task()
    ### use .delay() for passing by celery
    # send_mass_email_promo_task().delay()

    # from zap.apps.users.tasks import (
    #     make_link_create_user,
    #     make_link_password_reset,
    #     send_email_account_creation_link_task,
    #     send_email_password_reset_task,
    # )
    # send_email_password_reset_task(User.objects.get(email="b@b.com"))
    # send_email_account_creation_link_task("etienne.robert@hotmail.com")

    # print(make_link_create_user("b@b.com"))
    # print(make_link_password_reset(User.objects.get(email="a@a.com")))

    # from django.contrib.auth.hashers import check_password, make_password
    # hashed_pwd = make_password("plain_text")
    # print("Hashed password is:", hashed_pwd)
    # print(check_password("plain_text",hashed_pwd))

    # from django.urls import translate_url
    # print(
    #     translate_url(
    #         "http://127.0.0.1:8000/fr/ouvrir_un_compte/YkBiLmNvbQ/b7l73p-94532f9e58bd59b8380fe14a2e021d00", "en"
    #     )
    # )

    # print(timezone.get_current_timezone())
    # print(timezone.localtime(timezone.now()))     # Aware in local timezone
    # print(timezone.now())                         # Aware in UTC timezone
    # print(datetime.datetime.now())                # Naive in local timezone

    # resp = HttpResponseRedirect(request.POST.get("next", reverse("home")))
    # resp.set_cookie("sessionid", "", 0)
    # return resp

    # from django.contrib import messages

    # messages.add_message(
    #     request,
    #     messages.INFO,
    #     "Mjfa;lsd fjaksldj fklasj dfklasjf lkasjd flka.",
    # )

    # ### send websocket message to group
    # from asgiref.sync import async_to_sync
    # from channels.layers import get_channel_layer

    # message = "this is a custom message"
    # channel_layer = get_channel_layer()
    # async_to_sync(channel_layer.group_send)("monitor_group", {"type": "send_message_to_frontend", "message": message})
    # ch_group_list = channel_layer.group_channels("group_name_asdf")
    # print(ch_group_list)

    ############# Move files in file system and in django filefield #########
    # import os
    # from zap.apps.chat.models import ChatFileSend
    # from zap.settings import BASE_DIR
    # file_send = ChatFileSend.objects.get(id=1)
    # print(file_send.file.path)
    # initial_path = file_send.file.path
    # file_name_media = "Chat/Moved/asdf.png"
    # # new_path_full = settings.MEDIA_ROOT / file_name_media
    # ### move on the file system
    # # os.rename(initial_path, new_path_full)
    # os.rename(initial_path, settings.BASE_DIR / "media/private/asdf.png")
    # ### change the file path in model
    # # file_send.file = file_name_media
    # # file_send.save()
    # # print(file_send.file.path)

    # string = ""
    # for i in range(0, 1000):
    #     a = chr(i)
    #     # string += str(ord(a)) + ":" + a + ","
    #     string += str(ord(a)) + ":" + str(ord(chr(ord(a)))) + ":" + a + ","
    # print(string)
    ## print(ord("𰵄"))

    # current_time = timezone.now()  ### from UTC-0
    # manual_time = datetime.datetime(2023, 1, 28, 19, 45, 59, 342380, tzinfo=tz.gettz("UTC+0"))
    # print(timezone.localtime(manual_time))
    # print(datetime.datetime(2023, 1, 1, tzinfo=tz.gettz("UTC+0")))
    # ### construct
    # time = datetime.datetime(2023, 1, 18, 14, 25, 12, 124000, tzinfo=tz.gettz("UTC+0"))
    # origin = datetime.datetime(1999, 1, 1, tzinfo=tz.gettz("UTC+0"))
    # delta = time - origin
    # date_chars = (
    #     chr(delta.days) + chr(int(delta.seconds / 60)) + chr(time.second * 1000 + int(time.microsecond / 1000))
    # )
    # ### deconstruct
    # print(time)
    # time = (
    #     origin
    #     + datetime.timedelta(days=ord(date_chars[0]))
    #     + datetime.timedelta(minutes=ord(date_chars[1]))
    #     + datetime.timedelta(milliseconds=ord(date_chars[2]))
    # )
    # print(time)
    # from zap.apps.chat.models import ChatSession
    # chat_session = ChatSession.objects.get(id=1)
    # # print(chat_session.get_participants())
    # print(chat_session.get_conversation())
    # from django.core.cache import cache
    # if not cache.get("my_key"):
    #     print("setting my_key")
    #     cache.set("my_key", "hello, world!", 5)
    # else:
    #     print(cache.get("my_key"))
    # list = [[4, 5, 6], [4, 5, 7], [4, 5, 8]]
    # for iter, value in enumerate(list):
    #     print(iter)
    #     print(value)
    # from zap.apps.chat.objects import ListStaffChat
    # list_staff_chat = ListStaffChat()
    # list_staff_chat.add_staff(request.user.id)
    # print(list_staff_chat.get_chat_staff_list())
    # list_staff_chat.del_staff(request.user.id)
    # print(list_staff_chat.get_chat_staff_list())
    #
    # import datetime
    # from datetime import timedelta

    # import pytz
    # def is_dst(dt):
    #     if dt.year < 2007:
    #         raise ValueError()
    #     dst_start = datetime.datetime(dt.year, 3, 8, 2, 0)
    #     dst_start += datetime.timedelta(6 - dst_start.weekday())
    #     dst_end = datetime.datetime(dt.year, 11, 1, 2, 0)
    #     dst_end += datetime.timedelta(6 - dst_end.weekday())
    #     return dst_start <= dt < dst_end

    # def standard_tz():
    #     offset =  pytz.timezone(timezone.get_current_timezone_name()).utcoffset(datetime.datetime.utcnow()).total_seconds() / 3600.0
    #     dst = is_dst(datetime.datetime.now())
    #     match offset:
    #         case -3:
    #             return("ADT" if dst else "")
    #         case -4:
    #             return("EDT" if dst else "AST")
    #         case -5:
    #             return("EDT" if dst else "EST")
    #         case -6:
    #             return("EDT" if dst else "EST")
    #         case -7:
    #             return("EDT" if dst else "EST")
    #         case _:
    #             print('No match found')
    # print(standard_tz())

    context = {
        "my_list": [[4, 5, 6], [4, 5, 6], [4, 5, 6]],
    }
    return render(request, "base/tests.html", context)


def home(request):
    context = {}
    return render(request, "base/home.html", context)


def cookie_opt(request):
    cookie_pref = request.session.get("cookie_pref", "")
    if cookie_pref:
        context = {
            "choice_settings": [
                bool(int(cookie_pref[0])),
                bool(int(cookie_pref[1])),
                bool(int(cookie_pref[2])),
            ]
        }
    else:
        context = {"choice_settings": [False, False, False]}
    return render(request, "base/cookies/cookie_opt.html", context)
