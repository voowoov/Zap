# chat/views.py
from django.contrib.auth import get_user_model
from django.shortcuts import redirect, render
from django.utils.translation import gettext_lazy as _
from django.views import View

UserModel = get_user_model()

from zap.apps.users.mixins import SuperuserLoginRequiredMixin


class StaffMonitor(SuperuserLoginRequiredMixin, View):
    def get(self, request):
        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        try:
            ctx = {}
            return render(request, "monitor/monitor.html", ctx)
        except:
            return redirect("base:home")
