import sys

from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.views import View


class Search(View):
    def get(self, request):
        return render(request, "search/search.html", {})
