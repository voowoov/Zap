from django.core.cache import cache


def cookie_pref(request):
    if request.session.get("cookie_pref", ""):  # missing cookie_pref
        return {"show_cookie_banner": False}
    else:
        return {"show_cookie_banner": True}


def chat_staff(request):
    return {"chat_staff_ON": len(cache.get("chat_staff_list", [])) > 0}
