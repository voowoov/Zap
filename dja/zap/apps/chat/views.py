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


class LobbyChat(View):
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
            return render(request, "chat/lobby_chat.html", ctx)
        except:
            return redirect("base:home")


class StaffChat(View):
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
            return render(request, "chat/staff_chat.html", ctx)
        except:
            return redirect("base:home")


@ensure_csrf_cookie
def init_chat(request):
    if request.method == "POST":
        try:
            is_authenticated = request.user.is_authenticated

            return JsonResponse(
                {
                    "chat_staff_list": cache.get("chat_staff_list", []),
                    "is_authenticated": is_authenticated,
                },
                safe=False,
            )
        except Exception as e:
            print(e)


def save_chat(request):
    if request.method == "POST":
        try:
            form = ChatSessionInitForm(request.POST)
            if form.is_valid():
                chat_host_id = form.cleaned_data["chat_host_id"]
                anonymous_chat_client_name = form.cleaned_data[
                    "anonymous_chat_client_name"
                ]
                anonymous_chat_client_desc = form.cleaned_data[
                    "anonymous_chat_client_desc"
                ]
                chat_subject = form.cleaned_data["chat_subject"]
                client_user = request.user
                if request.user.is_authenticated:
                    try:
                        chat_session = ChatSession.objects.get(
                            chat_host_id=chat_host_id, client_user=client_user
                        )
                        chat_session.chat_subject = chat_subject
                        chat_session.save()
                    except:
                        chat_session = ChatSession.objects.create(
                            chat_host_id=chat_host_id,
                            client_user=client_user,
                            chat_subject=chat_subject,
                        )
                else:
                    anonymous_id = request.session.get("anonymous_id", "")
                    if anonymous_id:
                        pass
                    else:
                        anonymous_id = get_random_string(8)
                        request.session["anonymous_id"] = anonymous_id
                    try:
                        chat_session = ChatSession.objects.get(
                            chat_host_id=chat_host_id, anonymous_id=anonymous_id
                        )
                        chat_session.anonymous_chat_client_name = (
                            anonymous_chat_client_name
                        )
                        chat_session.anonymous_chat_client_desc = (
                            anonymous_chat_client_desc
                        )
                        chat_session.chat_subject = chat_subject
                        chat_session.save()
                    except:
                        chat_session = ChatSession.objects.create(
                            chat_host_id=chat_host_id,
                            anonymous_id=anonymous_id,
                            anonymous_chat_client_name=anonymous_chat_client_name,
                            anonymous_chat_client_desc=anonymous_chat_client_desc,
                            chat_subject=chat_subject,
                        )
                return JsonResponse(
                    {
                        "result": "success",
                        "chat_session_id": chat_session.id,
                    },
                    safe=False,
                )
        except Exception as e:
            print(e)
    return JsonResponse(
        {
            "result": "failed",
        },
        safe=False,
    )


# def room_chat(request, chat_session_id):
#     context = {
#         "room_name": chat_session_id,
#     }
#     return render(request, "chat/room.html", context)
