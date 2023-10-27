# chat/views.py
from django.core.cache import cache
from django.http import FileResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect, render
from django.utils.crypto import get_random_string
from django.views import View
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from zap.apps.chat.objects import ListStaffChat
from zap.apps.users.models import User

from .forms import ChatSessionInitForm
from .models import ChatSession

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
        except:
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
        except:
            return redirect("base:home")


class ChatVideo(View):
    def get(self, request):
        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        user = request.user
        try:
            ctx = {
            }
            return render(request, "chat/chat_video.html", ctx)
        except:
            return redirect("base:home")




# def room_chat(request, chat_session_id):
#     context = {
#         "room_name": chat_session_id,
#     }
#     return render(request, "chat/room.html", context)
