from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.http import HttpResponseBadRequest, HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse, translate_url
from django.utils.translation import gettext_lazy as _
from django.views import View
from zap.apps.search.typesense import (
    typesense_add_single_document,
    typesense_create_a_collection,
    typesense_delete_a_collection,
    typesense_import_documents,
    typesense_test_count_and_retrieve_documents,
)
from zap.apps.users.tasks import send_email_account_creation_link_task

UserModel = get_user_model()

from django.contrib import messages
from zap.apps.users.mixins import Lev2LoginRequiredMixin, StaffLoginRequiredMixin
from zap.apps.users.tasks import (
    make_link_create_user,
    make_link_password_reset,
    send_email_account_creation_link_task,
    send_email_password_reset_task,
)

from .forms import EmailAddressForm


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


class Cmd(StaffLoginRequiredMixin, View):
    message = ""
    initial_dict = {
        "email": "b@b.com",
    }

    def get(self, request):
        self.form_1 = EmailAddressForm(initial=self.initial_dict)
        self.form_2 = EmailAddressForm(initial=self.initial_dict)
        return self.this_render(request)

    def post(self, request):
        if "submit_form_1" in request.POST:
            email = request.POST.get("email").lower()
            send_email_account_creation_link_task(email)
            self.message = "email sent"
        if "submit_form_2" in request.POST:
            email = request.POST.get("email").lower()
            self.message = make_link_create_user(email)
        if "submit_form_3" in request.POST:
            self.message = call_command("loaddata", "movies.json")
        if "submit_form_4" in request.POST:
            self.message = typesense_delete_a_collection()
        if "submit_form_5a" in request.POST:
            self.message = typesense_create_a_collection()
        if "submit_form_5" in request.POST:
            self.message = typesense_import_documents()
        if "submit_form_6" in request.POST:
            self.message = typesense_test_count_and_retrieve_documents()
        if "submit_form_7" in request.POST:
            self.message = typesense_add_single_document()

        messages.add_message(request, messages.INFO, self.message)

        self.form_1 = EmailAddressForm(initial=self.initial_dict)
        self.form_2 = EmailAddressForm(initial=self.initial_dict)
        return self.this_render(request)

    def this_render(self, request):
        ctx = {
            "form_1": self.form_1,
            "form_2": self.form_2,
        }
        return render(request, "xcmd/xcmd.html", ctx)
