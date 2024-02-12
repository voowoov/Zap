from django.shortcuts import render
from django.views import View


class Search(View):
    def get(self, request):
        return render(request, "search/search.html", {})
