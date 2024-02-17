import logging
import zoneinfo

from django.contrib import messages
from django.contrib.auth import (
    authenticate,
    get_user_model,
    login,
    logout,
    password_validation,
)
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.utils.translation import gettext_lazy as _
from django.views import View
from django.views.decorators.cache import never_cache
from zap.apps.users.mixins import session_lev2_timestamp
from zap.apps.xsys.models import CookieOnServer
from zap.apps.xsys.tokens import password_reset_token, user_token_generator

logger = logging.getLogger(__name__)

UserModel = get_user_model()

from .forms import (  # ResetPasswordForm,
    CreateUserNewAccountForm,
    PasswordResetForm,
    SigninForm0,
    SigninFormLev2,
)


@method_decorator(
    never_cache, name="dispatch"
)  # Add decorator for all request methods (on dispatch function)
class Signin_0(View):
    warning_message = None

    def get(self, request):
        try:
            cookie_on_server = CookieOnServer.objects.get(
                cos_id=request.COOKIES["cos_id"]
            )
            initial_dict = {
                "email": (
                    cookie_on_server.last_login_email
                    if cookie_on_server.remember_email == True
                    else ""
                ),
                "remember_email": cookie_on_server.remember_email,
                "stay_signed_in": cookie_on_server.stay_signed_in,
            }
        except:
            initial_dict = {
                "email": "",
                "remember_email": True,
                "stay_signed_in": True,
            }
        self.form = SigninForm0(initial=initial_dict)
        return self.this_render(request)

    def post(self, request):
        self.form = SigninForm0(request.POST)
        logger.warning(f"warning: Signin_0: form_errors: {self.form.errors}")
        if self.form.is_valid():
            # process the data in form.cleaned_data as required
            email = self.form.cleaned_data["email"].lower()
            password = self.form.cleaned_data["password"]
            remember_email = self.form.cleaned_data["remember_email"]
            stay_signed_in = self.form.cleaned_data["stay_signed_in"]
            user = authenticate(request, email=email, password=password)
            if user is not None:
                if user.is_closed:
                    self.warning_message = _("This account was closed.")
                elif not user.is_active:
                    self.warning_message = _(
                        "This account is awaiting email verification."
                    )
                else:
                    login(request, user)
                    if stay_signed_in:
                        request.session.set_expiry(1000000)
                    else:
                        request.session.set_expiry(None)
                    request.session["lev2_ts"] = session_lev2_timestamp.make_ts()
                    # return to the forward (next) path of home path ("/") as default
                    response = HttpResponseRedirect(
                        request.POST.get("next", reverse("base:home"))
                    )
                    # Cookie on server
                    try:
                        cookie_on_server = CookieOnServer.objects.get(
                            cos_id=request.COOKIES["cos_id"]
                        )
                    except:
                        cookie_on_server = CookieOnServer.create_and_get_instance()
                    cookie_on_server.last_login_email = email
                    cookie_on_server.remember_email = remember_email
                    cookie_on_server.stay_signed_in = stay_signed_in
                    cookie_on_server.save()
                    response.set_cookie("cos_id", cookie_on_server.cos_id, 1000000)
                    # Change the timezone
                    time_zone = request.user.time_zone
                    if time_zone != "Auto":
                        timezone.activate(zoneinfo.ZoneInfo(time_zone))
                    response.set_cookie("time_zone", time_zone, 1000000)
                    return response
            else:
                self.warning_message = _("There was no match.")

        return self.this_render(request)

    def this_render(self, request):
        ctx = {
            "form": self.form,
            "warning_message": self.warning_message,
        }
        return render(request, "users/signin_0.html", ctx)


@method_decorator(
    never_cache, name="dispatch"
)  # Add decorator for all request methods (on dispatch function)
class Signin_Lev2(View):
    warning_message = None

    def get(self, request):
        try:
            self.form = SigninFormLev2(initial={"email": request.user.email})
        except Exception as e:
            logger.error(f"error: Signin_Lev2, get: {e}")
            return redirect("base:home")
        return self.this_render(request)

    def post(self, request):
        try:
            user = request.user
            email = user.email
            self.form = SigninFormLev2(initial={"email": request.user.email})
        except Exception as e:
            logger.error(f"error: Signin_Lev2, post: {e}")
            return redirect("base:home")
        password = request.POST.get("password")
        user_res = authenticate(request, email=email, password=password)
        if user == user_res:
            request.session["lev2_ts"] = session_lev2_timestamp.make_ts()
            # return to the forward (next) path of home path ("/") as default
            response = HttpResponseRedirect(
                request.POST.get("next", reverse("base:home"))
            )
            return response
        else:
            self.warning_message = _("Incorrect password")

        return self.this_render(request)

    def this_render(self, request):
        ctx = {
            "form": self.form,
            "warning_message": self.warning_message,
        }
        return render(request, "users/signin_lev2.html", ctx)


# @method_decorator(requires_csrf_token, name="dispatch")
@method_decorator(
    never_cache, name="dispatch"
)  # Add decorator for all request methods (on dispatch function)
class CreateAccount(View):
    def get(self, request, uidb64, token):
        if self.validate_token(request, uidb64, token):
            initial_dict = {"email": self.email}
            self.form = CreateUserNewAccountForm(initial=initial_dict)
        else:
            return redirect("base:home")
        return self.this_render(request)

    def post(self, request, uidb64, token):
        self.form = CreateUserNewAccountForm(request.POST)
        if self.validate_token(request, uidb64, token):
            if self.form.is_valid():
                email = request.POST.get("email")
                password = request.POST.get("password1")
                if email == self.email:
                    try:
                        password_validation.validate_password(password)
                        new_user = UserModel.objects.create_user(
                            email=email, password=password
                        )
                        new_user.save()
                        messages.add_message(
                            request, messages.INFO, _("Your account was created.")
                        )
                        return redirect("base:home")
                    except Exception as e:
                        logger.error(f"error: CreateAccount, post: {e}")
            return self.this_render(request)
        return redirect("base:home")

    def this_render(self, request):
        ctx = {
            "form": self.form,
        }
        return render(request, "users/create_user.html", ctx)

    def validate_token(self, request, uidb64, token):
        try:
            self.email = force_str(urlsafe_base64_decode(uidb64))
        except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
            self.email = None
        if self.email is not None:
            try:
                UserModel.objects.get(email=self.email)
                messages.add_message(
                    request, messages.INFO, _("This user already exists")
                )
                return False
            except:
                if user_token_generator.check_token(self.email, token):
                    return True
        messages.add_message(
            request, messages.INFO, _("This activation link is invalid.")
        )
        return False


@method_decorator(
    never_cache, name="dispatch"
)  # Add decorator for all request methods (on dispatch function)
class PasswordReset(View):
    def get(self, request, uidb64, token):
        if self.validate_token(request, uidb64, token):
            initial_dict = {"email": self.user.email}
            self.form = PasswordResetForm(initial=initial_dict)
        else:
            return redirect("base:home")
        return self.this_render(request)

    def post(self, request, uidb64, token):
        self.form = PasswordResetForm(request.POST)
        if self.validate_token(request, uidb64, token):
            email = request.POST.get("email")
            password = request.POST.get("password1")
            # check that form email is the same as token email
            if email == self.user.email and not password_validation.validate_password(
                password
            ):
                self.user.set_password(password)
                self.user.save()
                messages.add_message(
                    request, messages.INFO, _("Your password reset is completed.")
                )
                return redirect("base:home")
            else:
                return self.this_render(request)
        return redirect("base:home")

    def this_render(self, request):
        ctx = {
            "form": self.form,
        }
        return render(request, "users/password_reset.html", ctx)

    def validate_token(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            self.user = UserModel.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
            self.user = None
        if self.user is not None and password_reset_token.check_token(self.user, token):
            if self.user.is_active:
                return True
        messages.add_message(
            request, messages.INFO, _("This activation link is invalid.")
        )
        return False


@method_decorator(
    never_cache, name="dispatch"
)  # Add decorator for all request methods (on dispatch function)
class PasswordResetInfo(View):
    def get(self, request):
        return self.this_render(request)

    def this_render(self, request):
        ctx = {}
        return render(request, "users/signin_password_reset_info.html", ctx)


@login_required
def logoutUser(request):
    logout(request)
    return redirect("base:home")
