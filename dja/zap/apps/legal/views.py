from django.shortcuts import render
from django.utils.translation import gettext_lazy as _


def terms_of_service(request):
    return render(request, "legal/terms_of_service.html", {})


def privacy_policy(request):
    return render(request, "legal/privacy_policy.html", {})


def cookie_policy(request):
    return render(request, "legal/cookie_policy.html", {})


def acceptable_use_policy(request):
    return render(request, "legal/acceptable_use_policy.html", {})


def return_and_refund_policy(request):
    return render(request, "legal/return_and_refund_policy.html", {})
