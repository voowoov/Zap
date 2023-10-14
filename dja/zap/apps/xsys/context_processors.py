from django.core.cache import cache
from django.urls import resolve


def cookie_pref(request):
    if request.session.get("cookie_pref", ""):
        return {"show_cookie_banner": False}
    else:  # missing cookie_pref
        if resolve(request.path_info).app_name == "legal":
            return {"show_cookie_banner": False}
        else:
            return {"show_cookie_banner": True}


def chat_staff(request):
    return {"chat_staff_ON": len(cache.get("chat_staff_list", [])) > 0}
