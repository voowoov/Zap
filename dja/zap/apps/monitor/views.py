# chat/views.py
import logging
import os
from datetime import datetime

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.utils.decorators import method_decorator
from django.utils.translation import gettext_lazy as _
from django.views import View
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST

logger = logging.getLogger(__name__)

UserModel = get_user_model()

from zap.apps.users.mixins import LoginRequiredMixinLev2Superuser


class StaffMonitor(LoginRequiredMixinLev2Superuser, View):
    def get(self, request):
        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        try:
            ctx = {
                "my_object_list": ["apple", "banana", "cherry"],
            }
            return render(request, "monitor/monitor.html", ctx)
        except Exception as e:
            logger.error(f"error: StaffMonitor: {e}")
            return redirect("base:home")


class MonitorScript(View):
    def get(self, request):
        if request.user.is_superuser:
            response = HttpResponse()
            response["X-Accel-Redirect"] = "/media_private/js/priv_monitor_script.js"
            return response


@method_decorator(csrf_protect, name="dispatch")
@method_decorator(require_POST, name="dispatch")
class MyAjaxReceiveTestView(View):
    def post(self, request, *args, **kwargs):
        # Ensure the request is AJAX
        if not is_ajax(request):
            return JsonResponse({"error": "Invalid request"}, status=400)

        # Get the message from the POST data
        message = request.POST.get("message")

        # Do something with the message...
        logger.debug(f"AJAX Received message: {message}")

        # Send back a JSON response
        return JsonResponse(
            {
                "original_message": message,
                "response_message": "This is a response from Django",
            }
        )


def is_ajax(request):
    return request.headers.get("x-requested-with") == "XMLHttpRequest"
