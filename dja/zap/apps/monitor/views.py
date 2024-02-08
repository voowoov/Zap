# chat/views.py
import os
import re

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.http import (
    FileResponse,
    HttpResponse,
    HttpResponseBadRequest,
    HttpResponseRedirect,
    JsonResponse,
)
from django.shortcuts import redirect, render
from django.utils.translation import gettext_lazy as _
from django.views import View

UserModel = get_user_model()

from zap.apps.filespro.models import FileUploadFile, FileUploadUser
from zap.apps.users.mixins import SuperuserLoginRequiredMixin


class StaffMonitor(SuperuserLoginRequiredMixin, View):
    def get(self, request):
        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        try:
            user = request.user
            file_upload_user = FileUploadUser.get_or_create_file_upload_user(
                owner_object=user,
                max_storage_size=10000000,
            )
            # file upload user object is transmitted to wsi via 2 session variables
            content_type = ContentType.objects.get_for_model(file_upload_user)
            request.session["wsi_fuu_ct_id"] = content_type.id
            request.session["wsi_fuu_obj_id"] = file_upload_user.id
            ctx = {}
            return render(request, "monitor/monitor.html", ctx)
        except Exception as e:
            print(e)
            return redirect("base:home")
