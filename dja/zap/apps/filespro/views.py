import os

from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import FileResponse, HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views import View


class DownloadFile(LoginRequiredMixin, View):
    def get(self, request):
        try:
            # path = request.user.account.invoices.get(pk=pk).invoice_pdr.path
            # path = "media/private/pack.png"
            # path = "media/public/pack.png"
            # print(open(path, "rb"))
            # response = FileResponse(open(path, "rb"), as_attachment=True)

            name = "Felisss.png"
            response = HttpResponse()
            response["Content-Disposition"] = 'attachment; filename="' + name + '"'
            response["X-Accel-Redirect"] = "/media_private/Felis.png"
            del response["Content-Type"]
            del response["Accept-Ranges"]
            del response["Set-Cookie"]
            del response["Cache-Control"]
            # response["Cache-Control"] = 'private, max-age=31536000'  # Cache for one year
            del response["Expires"]

        except Exception as e:
            print(e)
            pass
        return response


def image_viewer(request, slug_image):
    # if request.method == "POST":
    #     if some_var == 'the_correct_value':
    protected_uri = reverse(
        "filespro:image_private", kwargs={"slug_image": "slug_image"}
    )
    file_name = "image name"
    return render(
        request,
        "filespro/image_viewer.html",
        {"protected_uri": protected_uri, "file_name": file_name},
    )


def image_private(request, slug_image):
    # ... some logic to get the secret URL from the slug ...
    response = HttpResponse()
    response["Content-Type"] = "application/png"
    response["X-Accel-Redirect"] = "/media_private/Felis.png"
    return response


def pdf_viewer(request, slug_pdf):
    # ... some logic to get the secret URL from the slug ...
    response = HttpResponse()
    response["Content-Type"] = "application/pdf"
    response["X-Accel-Redirect"] = "/media_private/photogrametry.pdf"
    return response
