# chat/views.py
import logging

from django.shortcuts import redirect, render
from django.views import View
from zap.apps.chat.objects import ListStaffChat
from zap.apps.xsys._functions import pow_challenge, pow_verify

logger = logging.getLogger(__name__)

list_staff_chat = ListStaffChat()


class ChatLobby(View):
    def get(self, request):
        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        user = request.user
        try:
            ctx = {
                "room_name": "roomNameAasdf",
            }
            return render(request, "chat/chat_lobby.html", ctx)
        except Exception as e:
            logger.error(f"error: ChatLobby: {e}")
            return redirect("base:home")


class ChatStaff(View):
    def get(self, request):
        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        user = request.user
        try:
            ctx = {
                "room_name": "roomNameAasdf",
            }
            return render(request, "chat/chat_staff.html", ctx)
        except Exception as e:
            logger.error(f"error: ChatStaff: {e}")
            return redirect("base:home")


class ChatVideo(View):
    def get(self, request):
        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        user = request.user
        try:
            ctx = {}
            return render(request, "chat/chat_video.html", ctx)
        except Exception as e:
            logger.error(f"error: ChatVideo: {e}")
            return redirect("base:home")


# def room_chat(request, chat_session_id):
#     context = {
#         "room_name": chat_session_id,
#     }
#     return render(request, "chat/room.html", context)
