import hashlib
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
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.sessions.models import Session
from django.core.cache import cache
from django.db import transaction
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.decorators import method_decorator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.utils.translation import gettext_lazy as _
from django.views import View
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.http import require_POST
from django.views.generic.edit import FormView
from zap.apps.chat.models import ChatSession
from zap.apps.users.mixins import session_lev2_timestamp
from zap.apps.xsys.models import CookieOnServer
from zap.apps.xsys.tokens import password_reset_token, user_token_generator

from .forms import (  # Import your custom form; ResetPasswordForm,
    CustomLoginForm,
    CustomUserCreationForm,
)

logger = logging.getLogger(__name__)

UserModel = get_user_model()


# [[session_name, session_host, [list_of_users]], ]
cache.set(
    "default_chat_sessions",
    [
        {
            "subject": "Chat with Zap staff",
            "users": ["a@a.com", "e@e.com", "v"],
        },
        {"subject": "Chat with Zap staff", "users": ["a@a.com", "e@e.com"]},
    ],
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
        if len(self.request.user.level_valid) > 2:
            response.set_cookie("pow_str", self.request.user.level_valid, 1000000)
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

        with transaction.atomic():
            user = form.save()
            #### add the chat sessions to the user
            default_chat_sessions = cache.get("default_chat_sessions")
            for item in default_chat_sessions:
                related_usernames = item.pop("users")
                related_users = UserModel.objects.filter(username__in=related_usernames)
                obj = ChatSession(**item)
                obj.save()  # Save the object to get an id
                obj.users.set(related_users)  # Set the ManyToMany field
                obj.users.add(user)
        messages.add_message(
            self.request, messages.INFO, _("Your account was created.")
        )
        return super().form_valid(form)

    def form_invalid(self, form):
        print(form["username"])
        # Re-render the form with submitted data and errors
        return self.render_to_response(self.get_context_data(form=form))


class PasswordResetInfo(View):
    def get(self, request):
        return self.this_render(request)

    def this_render(self, request):
        ctx = {}
        return render(request, "users/password_reset_info.html", ctx)


### proof of work solution, ajax from js
@method_decorator(csrf_protect, name="dispatch")
@method_decorator(require_POST, name="dispatch")
class AjaxPowView(View):
    def post(self, request, *args, **kwargs):
        if not request.headers.get("x-requested-with") == "XMLHttpRequest":
            return JsonResponse({"error": "Invalid request"}, status=400)
        solution = request.POST.get("message")
        challenge = request.user.level_valid
        if pow_verify(challenge, solution, 6):
            user = request.user
            user.level_valid = "0"
            user.save()
            close_wsi_channel(request)
            return JsonResponse({"response": "true"})
        return JsonResponse({"response": "false"})


def pow_verify(challenge, solution, difficulty):
    hash = hashlib.sha256((challenge + str(solution)).encode()).hexdigest()
    if hash[:difficulty] == "0" * difficulty:  # Adjust difficulty as needed
        return True
    return False
