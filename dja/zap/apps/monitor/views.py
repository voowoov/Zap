# chat/views.py
import os
import re

from django.contrib.auth import get_user_model
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

from .models import FileUpload

UserModel = get_user_model()

from zap.apps.users.mixins import SuperuserLoginRequiredMixin


class StaffMonitor(SuperuserLoginRequiredMixin, View):
    def get(self, request):
        return self.this_render(request)

    def post(self, request):
        if request.method == "POST":
            file = request.FILES["file"].read()
            fileName = request.POST["filename"]
            existingPath = request.POST["existingPath"]
            end = request.POST["end"]
            nextSlice = request.POST["nextSlice"]
            print(fileName)
            print(existingPath)
            print(end)
            if (
                file == ""
                or fileName == ""
                or existingPath == ""
                or end == ""
                or nextSlice == ""
            ):
                res = JsonResponse({"data": "Invalid Request"})
                return res
            else:
                if existingPath == "null":
                    path = "media/" + fileName
                    print("gwf")
                    with open(path, "wb+") as destination:
                        destination.write(file)
                    print("gwf")
                    FileFolder = FileUpload()
                    print("jyt")
                    FileFolder.existingPath = fileName
                    FileFolder.eof = end
                    FileFolder.name = fileName
                    FileFolder.save()
                    if int(end):
                        res = JsonResponse(
                            {"data": "Uploaded Successfully", "existingPath": fileName}
                        )
                    else:
                        res = JsonResponse({"existingPath": fileName})
                    return res

                else:
                    path = "media/" + existingPath
                    model_id = FileUpload.objects.get(existingPath=existingPath)
                    if model_id.name == fileName:
                        if not model_id.eof:
                            with open(path, "ab+") as destination:
                                destination.write(file)
                            if int(end):
                                model_id.eof = int(end)
                                model_id.save()
                                res = JsonResponse(
                                    {
                                        "data": "Uploaded Successfully",
                                        "existingPath": model_id.existingPath,
                                    }
                                )
                            else:
                                res = JsonResponse(
                                    {"existingPath": model_id.existingPath}
                                )
                            return res
                        else:
                            res = JsonResponse({"data": "EOF found. Invalid request"})
                            return res
                    else:
                        res = JsonResponse(
                            {"data": "No such file exists in the existingPath"}
                        )
                        return res
        return self.this_render(request)

    def this_render(self, request):
        try:
            ctx = {}
            return render(request, "monitor/monitor.html", ctx)
        except:
            return redirect("base:home")


def upload(request):
    context = {}
    return render(request, "base/home.html", context)
