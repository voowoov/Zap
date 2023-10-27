from django.core.cache import cache
from django.templatetags.static import static
from zap.apps.users.models import User


class ListStaffChat:
    def add_staff(self, user_id):
        staff_data = []
        try:
            user = User.objects.get(id=user_id)
            avatar = (
                user.avatar.url if user.avatar else static("/images/icons/avatar.svg")
            )
            social_name = user.social_name if user.social_name else ""
            social_desc = user.social_desc if user.social_desc else ""
            staff_data = [user_id, avatar, social_name, social_desc]
            chat_staff_list = cache.get("chat_staff_list", [])
            i = self.index_user(user_id)
            if i is not None:
                chat_staff_list[i] = staff_data
            else:
                chat_staff_list.append(staff_data)
            cache.set("chat_staff_list", chat_staff_list)
        except Exception as e:
            print(e)

    def del_staff(self, user_id):
        chat_staff_list = cache.get("chat_staff_list", [])
        i = self.index_user(user_id)
        if i is not None:
            chat_staff_list.pop(i)
        cache.set("chat_staff_list", chat_staff_list)

    def index_user(self, user_id):
        chat_staff_list = cache.get("chat_staff_list", [])
        i = None
        for iter, value in enumerate(chat_staff_list):
            if value[0] == user_id:
                i = iter
                break
        return i

    def get_chat_staff_list(self):
        return cache.get("chat_staff_list", [])

    def get_single_staff(self, index):
        return cache.get("chat_staff_list", [])[index]


def enable_staff_chat(userid):
    list_staff_chat = ListStaffChat()
    list_staff_chat.add_staff(userid)
    return "enabled staff chat"


def disable_staff_chat(userid):
    list_staff_chat = ListStaffChat()
    list_staff_chat.del_staff(userid)
    return "disabled staff chat"



