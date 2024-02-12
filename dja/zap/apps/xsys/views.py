from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponseBadRequest, HttpResponseRedirect
from django.shortcuts import redirect
from django.urls import translate_url
from django.utils.translation import gettext_lazy as _

UserModel = get_user_model()


def set_webpage_preference(request, name, value):
    http_referer = request.META.get("HTTP_REFERER")
    if http_referer:
        match name:
            case "lang":
                if value in dict(settings.LANGUAGES):
                    return redirect(translate_url(http_referer, value))
            case "theme":
                if value in ["light", "dark", "Auto"]:
                    response = HttpResponseRedirect(http_referer)
                    response.set_cookie("theme", value, 1000000)
                    return response
            case _:
                pass
    return HttpResponseBadRequest()
