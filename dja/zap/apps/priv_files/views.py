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
            del response["Expires"]

        except Exception as e:
            print(e)
            pass
        return response


def see_image_html(request):
    # if request.method == "POST":
    #     if some_var == 'the_correct_value':
    protected_uri = reverse(
        "priv_files:redirect_to_file", kwargs={"slug_image": "someslug"}
    )
    return render(
        request,
        "priv_files/show_priv_image.html",
        {"some_var ": True, "protected_uri": protected_uri},
    )


def redirect_to_file(request, slug_image):
    # ... some logic to get the secret URL from the slug ...
    response = HttpResponse()
    response["X-Accel-Redirect"] = "/media_private/Felis.png"
    return response
