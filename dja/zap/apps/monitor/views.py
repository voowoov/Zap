# chat/views.py
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.cache import cache
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils import timezone, translation
from django.views import View
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from zap.apps.chat.objects import ListStaffChat
from zap.apps.users.mixins import Lev2LoginRequiredMixin, StaffLoginRequiredMixin


class StaffMonitor(StaffLoginRequiredMixin, View):
    list_staff_chat = ListStaffChat()

    def get(self, request):
        self.list_staff_chat.add_staff(request.user.id)
        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        user = request.user
        try:
            ctx = {
                "room_name": "roomNameAasdf",
                "staff_chat_index": self.list_staff_chat.index_user(request.user.id),
            }
            return render(request, "monitor/staff_monitor.html", ctx)
        except:
            return redirect("base:home")

    # from channels.layers import get_channel_layer
