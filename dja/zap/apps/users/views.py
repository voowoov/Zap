import logging
import zoneinfo

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib import messages
from django.contrib.auth import (
    authenticate,
    get_user_model,
    login,
    logout,
    password_validation,
)
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.sessions.models import Session
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.utils.translation import gettext_lazy as _
from django.views import View
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters
from django.views.generic.edit import FormView
from zap.apps.users.mixins import session_lev2_timestamp
from zap.apps.xsys.models import CookieOnServer
from zap.apps.xsys.tokens import password_reset_token, user_token_generator

logger = logging.getLogger(__name__)

UserModel = get_user_model()

from django.contrib.auth.views import LoginView, LogoutView

from .forms import (  # Import your custom form; ResetPasswordForm,
    CustomLoginForm,
    CustomUserCreationForm,
    PasswordResetForm,
    SigninForm0,
    SigninFormLev2,
)


class CustomLoginView(LoginView):
    template_name = "users/login.html"
    form_class = CustomLoginForm

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        try:
            cookie_on_server = CookieOnServer.objects.get(
                cos_id=self.request.COOKIES["cos_id"]
            )
            form.fields["username"].initial = (
                cookie_on_server.last_login_email
                if cookie_on_server.remember_email == True
                else ""
            )
            form.fields["remember_email"].initial = cookie_on_server.remember_email
            form.fields["stay_signed_in"].initial = cookie_on_server.stay_signed_in
        except:
            form.fields["username"].initial = ""
            form.fields["remember_email"].initial = True
            form.fields["stay_signed_in"].initial = True
        return form

    def form_valid(self, form):
        ###
        response = super().form_valid(form)
        ###
        stay_signed_in = form.cleaned_data.get("stay_signed_in")
        if stay_signed_in:
            self.request.session.set_expiry(1000000)
        else:
            self.request.session.set_expiry(None)
        ### Lev 2 validation expiry
        session_lev2_timestamp.update_ts(self.request)
        ### Cookie on server
        try:
            cookie_on_server = CookieOnServer.objects.get(
                cos_id=self.request.COOKIES["cos_id"]
            )
        except:
            cookie_on_server = CookieOnServer.create_and_get_instance()
        cookie_on_server.last_login_email = form.cleaned_data.get("username")
        cookie_on_server.remember_email = form.cleaned_data.get("remember_email")
        cookie_on_server.stay_signed_in = form.cleaned_data.get("stay_signed_in")
        cookie_on_server.save()
        response.set_cookie("cos_id", cookie_on_server.cos_id, 1000000)
        # Change the timezone
        # time_zone = request.user.time_zone
        # if time_zone != "Auto":
        #     timezone.activate(zoneinfo.ZoneInfo(time_zone))
        # response.set_cookie("time_zone", time_zone, 1000000)

        ########## close wsi channel ##################
        close_wsi_channel(self.request)

        return response


class CustomLoginLev2View(LoginView):
    template_name = "users/login_lev2.html"

    @method_decorator(sensitive_post_parameters())
    @method_decorator(csrf_protect)
    @method_decorator(never_cache)
    def dispatch(self, request, *args, **kwargs):
        if self.redirect_authenticated_user and self.request.user.is_authenticated:
            redirect_to = self.get_success_url()
            if redirect_to == self.request.path:
                raise ValueError(
                    "Redirection loop for authenticated user detected. Check that "
                    "your LOGIN_REDIRECT_URL doesn't point to a login page."
                )
            return HttpResponseRedirect(redirect_to)
        ### added this
        if not self.request.user.is_authenticated:
            return redirect(reverse("base:home"))
        return super().dispatch(request, *args, **kwargs)

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        if self.request.user.is_authenticated:
            form.fields["username"].initial = self.request.user.username
        return form

    def form_valid(self, form):
        session_lev2_timestamp.update_ts(self.request)
        return HttpResponseRedirect(self.get_success_url())


class CustomLogoutView(LogoutView):
    template_name = "users/logged_out.html"

    def post(self, request, *args, **kwargs):
        ########## close wsi channel ##################
        close_wsi_channel(request)
        return super().post(request, *args, **kwargs)


def close_wsi_channel(request):
    channel_name = request.session.get("channel_name", "")
    if channel_name:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.send)(channel_name, {"type": "close.channel"})


class UserCreation(FormView):
    template_name = "users/user_creation.html"
    form_class = CustomUserCreationForm
    success_url = reverse_lazy("users:signin_0")

    # def get_initial(self):
    #     initial = super(UserCreation, self).get_initial()
    #     # initial.update(
    #     #     {
    #     #         "user_name": self.request.user.get_full_name(),
    #     #         "complaint": "I am unhappy with this order!",
    #     #     }
    #     # )
    #     return initial

    def form_valid(self, form):
        user = form.save()
        return super().form_valid(form)

    def form_invalid(self, form):
        print(form["username"])
        # Re-render the form with submitted data and errors
        return self.render_to_response(self.get_context_data(form=form))


# @method_decorator(requires_csrf_token, name="dispatch")
@method_decorator(
    never_cache, name="dispatch"
)  # Add decorator for all request methods (on dispatch function)
class CreateUserAccount(View):
    def get(self, request, uidb64, token):
        if self.validate_token(request, uidb64, token):
            initial_dict = {"email": self.email}
            # self.form = CreateUserNewAccountForm(initial=initial_dict)
        else:
            return redirect("base:home")
        return self.this_render(request)

    def post(self, request, uidb64, token):
        # self.form = CreateUserNewAccountForm(request.POST)
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
                        logger.error(f"error: CreateUserAccount, post: {e}")
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
