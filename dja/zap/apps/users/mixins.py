from datetime import datetime
from urllib.parse import urlparse

from django.conf import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.contrib.auth.mixins import AccessMixin
from django.contrib.auth.views import redirect_to_login
from django.core.exceptions import ImproperlyConfigured, PermissionDenied
from django.shortcuts import resolve_url

######### Lev2 - password required again after a maximum timeout; different login screen #########


class Lev2AccessMixin(AccessMixin):
    def get_login_url_lev2(self):
        login_url = settings.LOGIN_URL_LEV2
        if not login_url:
            raise ImproperlyConfigured(
                f"{self.__class__.__name__} is missing the login_url attribute. Define "
                f"{self.__class__.__name__}.login_url, settings.LOGIN_URL, or override "
                f"{self.__class__.__name__}.get_login_url()."
            )
        return str(login_url)

    def handle_no_permission_lev2(self):
        # if self.raise_exception or self.request.user.is_authenticated:
        #     raise PermissionDenied(self.get_permission_denied_message())

        path = self.request.build_absolute_uri()
        resolved_login_url = resolve_url(self.get_login_url_lev2())
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


class Lev2LoginRequiredMixin(Lev2AccessMixin):
    """Verify that the current user is authenticated."""

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        session_lev2_ts = int(request.session.get("lev2_ts", "0"))
        if not session_lev2_timestamp.check_ts(session_lev2_ts):
            return self.handle_no_permission_lev2()
        return super().dispatch(request, *args, **kwargs)


class SessionLev2Timestamp:
    def make_ts(self):
        return self._num_seconds(datetime.now())

    def check_ts(self, ts):
        if (self._num_seconds(datetime.now()) - ts) > settings.LEV2_SESSION_TIMEOUT:
            return False
        return True

    def _num_seconds(self, dt):
        return int((dt - datetime(2001, 1, 1)).total_seconds())


session_lev2_timestamp = SessionLev2Timestamp()


#########    Staff login required    #########


class StaffLoginRequiredMixin(AccessMixin):
    """Verify that the current user is authenticated."""

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.is_staff:
            return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()
