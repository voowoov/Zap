from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "articles"

urlpatterns = [
    path(_("articles/"), views.ListOfArticles.as_view(), name="articles"),
    path(_("article/<slug:article_slug>/"), views.ArticlePage.as_view(), name="article"),
    path(_("author/<slug:author_slug>/"), views.AuthorPage.as_view(), name="author"),
]
