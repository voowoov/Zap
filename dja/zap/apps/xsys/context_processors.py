from django.core.cache import cache
from django.urls import resolve
import re


def cookie_pref(request):
    cookie_pref = request.COOKIES.get("cookie_pref", "")
    if cookie_pref and re.match(r"^[01]{3}$", cookie_pref) is not None:
        return {"show_cookie_banner": False}
    else:  # missing cookie_pref
        if resolve(request.path_info).app_name == "legal":
            return {"show_cookie_banner": False}
        else:
            return {"show_cookie_banner": True}


def chat_staff(request):
    return {"chat_staff_ON": len(cache.get("chat_staff_list", [])) > 0}
