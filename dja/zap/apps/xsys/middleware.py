import time
import zoneinfo
from importlib import import_module

from django.utils import timezone


class TimezoneMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        time_zone = request.COOKIES.get("time_zone", "")
        if time_zone:
            if time_zone != "Auto":
                if timezone.get_current_timezone() != time_zone:
                    try:
                        timezone.activate(zoneinfo.ZoneInfo(time_zone))
                    except:
                        pass

        return self.get_response(request)


class CookieSettingsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        #  transfer of cookie_pref info from browser cookie to session variable
        cookie_pref_session = request.session.get("cookie_pref", "")
        cookie_pref_cookie = request.COOKIES.get("cookie_pref", "")
        if cookie_pref_session != cookie_pref_cookie:
            if len(cookie_pref_cookie) == 3:
                # check whether a string is binary string or not
                valid = True
                for char in cookie_pref_cookie:
                    if not (char == "0" or char == "1"):
                        valid = False
                        break
                if valid:
                    request.session["cookie_pref"] = cookie_pref_cookie
                else:
                    request.session["cookie_pref"] = ""
            else:
                request.session["cookie_pref"] = ""
        return self.get_response(request)
