import json

from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import EmptyPage, Paginator
from django.http import FileResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils import timezone, translation
from django.views import View
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

from .forms import AddressCpProjectForm, ProjectForm
from .models import Mailmessage

# Create your views here.


class DownloadFile(LoginRequiredMixin, View):
    def get(self, request, pk):
        try:
            path = request.user.account.invoices.get(pk=pk).invoice_pdr.path
            response = FileResponse(open(path, "rb"), as_attachment=True)
        except:
            pass
        # filename = 'name123.pdf'
        # response = FileResponse(
        # open(path, 'rb'), as_attachment=True, filename=filename)
        return response


class ProjectView(View):
    def get(self, request):
        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        ctx = {"form": ProjectForm()}
        return render(request, "accounts/register.html", ctx)


class AccountSummary(LoginRequiredMixin, View):
    def get(self, request):
        print(timezone.localtime(timezone.now()))

        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        user = request.user
        try:
            account = user.account
            invoices = account.invoices.all()
            ctx = {"user": user, "account": account, "invoices": invoices}
            return render(request, "accounts/account_summary.html", ctx)
        except:
            return redirect("base:home")


class AccountMessages(LoginRequiredMixin, View):
    def get(self, request):
        user = request.user
        mailmessages = user.mailmessage_set.all()
        p = Paginator(mailmessages, 4, 2)
        page_num = request.GET.get("page", 1)
        try:
            page = p.page(page_num)
        except EmptyPage:
            page = p.page(1)
        ctx = {"email": user.email, "page": page}
        return render(request, "accounts/account_messages.html", ctx)


class AccountMessage(LoginRequiredMixin, View):
    def get(self, request, pk):
        user = request.user
        mailmessage = user.mailmessage_set.get(pk=pk)
        mailmessage.read = True
        mailmessage.save()
        ctx = {"email": user.email, "mailmessage": mailmessage}
        return render(request, "accounts/account_message.html", ctx)


class AccountPrefPerso(LoginRequiredMixin, View):
    def get(self, request):
        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        user = request.user
        account = user.account
        invoices = account.invoices.all()
        ctx = {"email": user.email, "account": account, "invoices": invoices}
        return render(request, "accounts/account_pref_perso.html", ctx)


class AccountPrefSocio(LoginRequiredMixin, View):
    def get(self, request):
        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        user = request.user
        account = user.account
        invoices = account.invoices.all()
        ctx = {"email": user.email, "account": account, "invoices": invoices}
        return render(request, "accounts/account_pref_socio.html", ctx)


class AccountPrefSignin(LoginRequiredMixin, View):
    def get(self, request):
        return self.this_render(request)

    def post(self, request):
        return self.this_render(request)

    def this_render(self, request):
        user = request.user
        account = user.account
        invoices = account.invoices.all()
        ctx = {"email": user.email, "account": account, "invoices": invoices}
        return render(request, "accounts/account_pref_signin.html", ctx)


class EditAddressCpProject(View):

    form = AddressCpProjectForm()

    def get(self, request):
        address = request.user.account.addresscpproject_set.first()
        if address:
            self.form = AddressCpProjectForm(instance=address)
        return self.this_render(request)

    def post(self, request):
        self.form = AddressCpProjectForm(request.POST)
        if self.form.is_valid():
            # process the data in form.cleaned_data as required
            return HttpResponseRedirect(reverse("base:home"))
        return self.this_render(request)

    def this_render(self, request):
        ctx = {
            "form": self.form,
        }
        return render(request, "accounts/edit_address_cp.html", ctx)


from PIL import Image


@ensure_csrf_cookie
def modify_avatar(request):
    if request.user.is_authenticated:
        if request.method == "POST":
            try:
                image = request.FILES.get("file")
                if image.name.endswith(".png"):
                    Image.MAX_IMAGE_PIXELS = 56000
                    im = Image.open(image)
                    if im.format == "PNG":
                        im.verify()  # will throw an exception if not verifed
                        width, height = im.size
                        if width == height == 235:
                            request.user.avatar.delete(save=False)
                            request.user.avatar = image
                            request.user.save()
                            return JsonResponse({"msg": "image saved"})
            except Exception:
                pass
    return JsonResponse({"msg": "failed to upload image"}, safe=False)
