from django.conf import settings
from django_hosts import host, patterns

host_patterns = patterns(
    "",
    # host(r"(|www)", settings.ROOT_URLCONF, name="root"),
    host(r"", settings.ROOT_URLCONF, name="root"),
    host(r"beta", "zap.urls-beta", name="beta"),
)
