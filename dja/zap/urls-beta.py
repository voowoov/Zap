from django.conf import settings
from django.conf.urls.i18n import i18n_patterns
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps import views
from django.urls import include, path
from django.utils.translation import gettext_lazy as _
from django.views.generic.base import RedirectView, TemplateView
from zap.apps.base.sitemaps import PostSitemap, RootSitemap

sitemaps = {
    "posts": PostSitemap,
    "root": RootSitemap,
}

# from zap.apps.search.views import SearchProductInventory
urlpatterns = [
    path("tz_detect/", include("tz_detect.urls")),
    path("robots.txt", TemplateView.as_view(template_name="base/robots.txt", content_type="text/plain")),
    # path('__debug__/', include('debug_toolbar.urls')),
    path("sitemap.xml", views.index, {"sitemaps": sitemaps}, name="django.contrib.sitemaps.views.index"),
    path("sitemap-<section>.xml", views.sitemap, {"sitemaps": sitemaps}, name="django.contrib.sitemaps.views.sitemap"),
]
urlpatterns += i18n_patterns(
    path(_("chat/"), include("zap.apps.chat.urls")),
    path("", include("zap.apps.monitor.urls")),
    # path("api/search/<str:query>/", SearchProductInventory.as_view()),
    path("", include("zap.apps.accounts.urls")),
    path("", include("zap.apps.base.urls")),
    path("", include("zap.apps.users.urls")),
    # path("", include("zap.apps.legal.urls")),
    path("", include("zap.apps.search.urls")),
    path("", include("zap.apps.priv_files.urls")),
    path("", include("zap.apps.xcmd.urls")),
    path("admin/", admin.site.urls),
    # path("account/", include("django.contrib.auth.urls")),
)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
