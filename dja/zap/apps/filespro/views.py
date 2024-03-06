import logging

from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import FileResponse, HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views import View
from zap.apps.filespro._functions import get_file_value_from_signed_url

logger = logging.getLogger(__name__)


class DownloadFile(LoginRequiredMixin, View):
    def get(self, request, signed_url):
        file_value = get_file_value_from_signed_url(signed_url)
        response = HttpResponse()
        response["Content-Disposition"] = (
            'attachment; filename="' + file_value["base_name"].split("-", 1)[-1] + '"'
        )
        response["X-Content-Type-Options"] = "nosniff"
        # response["Cache-Control"] = 'private, max-age=31536000'  # Cache for one year
        response["X-Accel-Redirect"] = file_value["file_url"]
        return response


def image_viewer(request, signed_url):
    protected_uri = reverse("filespro:file_viewer", kwargs={"signed_url": signed_url})
    file_name = signed_url[signed_url.find("-") + 1 : signed_url.find(":")]
    return render(
        request,
        "filespro/image_viewer.html",
        {"protected_uri": protected_uri, "file_name": file_name},
    )


def file_viewer(request, signed_url):
    file_value = get_file_value_from_signed_url(signed_url)
    if file_value["content_type"]:
        response = HttpResponse()
        response["Content-Type"] = file_value["content_type"]
        response["X-Accel-Redirect"] = file_value["file_url"]
        return response
    else:
        return HttpResponse("Invalid request", status=400)
