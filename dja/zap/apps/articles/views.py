import time

from django.core.paginator import EmptyPage, Paginator
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404, render
from django.views import View

from .models import Article, Author


class AuthorPage(View):
    def get(self, request, author_slug):
        author = get_object_or_404(Author, author_slug=author_slug)
        return render(request, "articles/author.html", {"author": author})


class ListOfArticles(View):

    def get(self, request):
        articles = Article.objects.all()
        p = Paginator(articles, 20, 2)
        page_num = int(request.GET.get("page", 1))
        if page_num > p.num_pages:
            return HttpResponseBadRequest()
        try:
            page = p.page(page_num)
        except EmptyPage:
            page = p.page(1)
        if self.request.htmx:
            return render(
                request, "articles/articles_page_htmx.html", {"articles": page}
            )
        return render(request, "articles/articles.html", {"articles": page})


class ArticlePage(View):
    def get(self, request, article_slug):
        article = get_object_or_404(Article, article_slug=article_slug)
        return render(request, "articles/article.html", {"article": article})
