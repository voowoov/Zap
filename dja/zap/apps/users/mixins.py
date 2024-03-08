from datetime import datetime, timezone
from urllib.parse import urlparse

from django.conf import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.contrib.auth.mixins import AccessMixin
from django.contrib.auth.views import redirect_to_login
from django.core.exceptions import ImproperlyConfigured, PermissionDenied
from django.http import HttpResponse
from django.shortcuts import redirect, resolve_url
from django.urls import reverse
from django.utils import timezone as tz

######### Lev2 - password required again after a maximum timeout; different login screen #########


class AccessMixinLev2(AccessMixin):
    def get_LOGIN_URL_NAME_LEV2(self):
        login_url = settings.LOGIN_URL_NAME_LEV2
        if not login_url:
            raise ImproperlyConfigured(
                f"{self.__class__.__name__} is missing the login_url attribute. Define "
                f"{self.__class__.__name__}.login_url, settings.LOGIN_URL, or override "
                f"{self.__class__.__name__}.get_login_url()."
            )
        return str(login_url)

    def handle_no_permission_lev2(self):
        if self.raise_exception:
            raise PermissionDenied(self.get_permission_denied_message())

        path = self.request.build_absolute_uri()
        resolved_login_url = resolve_url(self.get_LOGIN_URL_NAME_LEV2())
        # If the login url is the same scheme and net location then use the
        # path as the "next" url.
        login_scheme, login_netloc = urlparse(resolved_login_url)[:2]
        current_scheme, current_netloc = urlparse(path)[:2]
        if (not login_scheme or login_scheme == current_scheme) and (
            not login_netloc or login_netloc == current_netloc
        ):
            path = self.request.get_full_path()
        return redirect_to_login(
            path,
            resolved_login_url,
            self.get_redirect_field_name(),
        )


class LoginRequiredMixinLev2User(AccessMixinLev2):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        if session_lev2_timestamp.expired_ts(request):
            return self.handle_no_permission_lev2()
        return super().dispatch(request, *args, **kwargs)


class LoginRequiredMixinLev2Staff(AccessMixinLev2):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated and not request.user.is_staff:
            return self.handle_no_permission()
        if session_lev2_timestamp.expired_ts(request):
            return self.handle_no_permission_lev2()
        return super().dispatch(request, *args, **kwargs)


class LoginRequiredMixinLev2Superuser(AccessMixinLev2):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated and not request.user.is_superuser:
            return self.handle_no_permission()
        if session_lev2_timestamp.expired_ts(request):
            return self.handle_no_permission_lev2()
        return super().dispatch(request, *args, **kwargs)


class SessionLev2Timestamp:
    def update_ts(self, request):
        request.session["lev2_ts"] = self._num_seconds()

    def expired_ts(self, request, expiration_sec=settings.LEV2_SESSION_TIMEOUT):
        timestamp = request.session["lev2_ts"]
        print(timestamp)
        if timestamp and (self._num_seconds() - int(timestamp)) > expiration_sec:
            return True
        return False

    def _num_seconds(self):
        return int((datetime.now() - datetime(2001, 1, 1)).total_seconds())


session_lev2_timestamp = SessionLev2Timestamp()


#########    Staff login required    #########
