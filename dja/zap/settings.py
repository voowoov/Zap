import os
from pathlib import Path

from django.utils.translation import gettext_lazy as _
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
TOP_DIR = BASE_DIR.parent

PROD = bool(int(os.getenv("DJANGO_PROD")))  # custom variable

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "setmeinprod")

DEBUG = bool(int(os.getenv("DJANGO_DEBUG", 0)))

if PROD:
    ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS_PROD").split(",")
else:
    ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS_DEV").split(",")

if PROD:
    CSRF_TRUSTED_ORIGINS = os.getenv("DJANGO_CSRF_TRUSTED_ORIGINS").split(",")
    CSRF_COOKIE_DOMAIN = os.getenv("DJANGO_CSRF_COOKIE_DOMAIN")
    SESSION_COOKIE_DOMAIN = os.getenv("DJANGO_SESSION_COOKIE_DOMAIN")
    SESSION_COOKIE_SECURE = bool(int(os.getenv("DJANGO_SESSION_COOKIE_SECURE")))
    SESSION_COOKIE_SAMESITE = os.getenv("DJANGO_SESSION_COOKIE_SAMESITE")
    SECURE_PROXY_SSL_HEADER = (
        "HTTP_X_FORWARDED_PROTO",
        "https",
    )  # nginx sends this wether http or https request with X-Forwarded-Proto

if not PROD:
    ##### in dev, use localhost instead of 127.0.0.1 to run subdomains, ex. beta.localhost:8000
    INTERNAL_IPS = [
        "127.0.0.1",
    ]  # for additionnal debug info when asked from that IP address

##### Application definition ######
INSTALLED_APPS = [
    ############### External apps ###############
    "daphne",
    "channels",
    "maintenance_mode",
    "tz_detect",
    "schedule",
    "django_htmx",
    # "django_elasticsearch_dsl",
    # "rest_framework",
    # "mptt",
    # 'debug_toolbar',
    # "django_hosts",
    ############### My apps ###############
    "zap.apps.accounts",
    "zap.apps.articles",
    "zap.apps.base",
    "zap.apps.chat",
    # "zap.apps.inventory",
    "zap.apps.legal",
    "zap.apps.monitor",
    "zap.apps.priv_files",
    "zap.apps.search",
    "zap.apps.users",
    "zap.apps.wsi",
    "zap.apps.xsys",
    ############# Django apps ##############
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.sites",  # for sitemap.xml
    "django.contrib.sitemaps",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    ############# External apps Post ############
    "tinymce",
]
MIDDLEWARE = [
    # "django_hosts.middleware.HostsRequestMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    # "debug_toolbar.middleware.DebugToolbarMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "maintenance_mode.middleware.MaintenanceModeMiddleware",
    "tz_detect.middleware.TimezoneMiddleware",
    "zap.apps.xsys.middleware.TimezoneMiddleware",
    "zap.apps.xsys.middleware.CookieSettingsMiddleware",
    # "django_hosts.middleware.HostsResponseMiddleware",
    "django.contrib.sites.middleware.CurrentSiteMiddleware",  # adds request.site.domain
    "django_htmx.middleware.HtmxMiddleware",
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "zap.apps.xsys.context_processors.cookie_pref",
                "zap.apps.xsys.context_processors.chat_staff",
            ],
            "libraries": {
                "my_filters": "zap.apps.templatetags.my_filters",
            },
        },
    },
]

###### Config #######
ASGI_APPLICATION = "zap.asgi.application"
# WSGI_APPLICATION = "zap.wsgi.application"
ROOT_URLCONF = "zap.urls"
AUTH_USER_MODEL = "users.User"
LOGIN_URL = "users:signin_0"
LOGIN_REDIRECT_URL = "base:home"
SITE_ID = 1  # for sites and sitemaps

###### Custom Config #######
LOGIN_URL_LEV2 = "signin_lev2"
LEV2_SESSION_TIMEOUT = 5

###### For django-hosts #######
# ROOT_HOSTCONF = "zap.hosts"
# DEFAULT_HOST = "root"
# PARENT_HOST= os.getenv("DJANGO_PARENT_HOST")

###### Channels ########
### use this channel layer in development only (does not need redis)
# CHANNEL_LAYERS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}
### use this channel layer with redis in Docker, in production
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],
        },
    },
}


###### Static and Media files directories #######
### browser url where static files are served by nginx
STATIC_URL = "/static/"
### directory where collectstatic files are put
STATIC_ROOT = TOP_DIR / "static_collect"
### directories that collectstatic pulls from
STATICFILES_DIRS = [
    TOP_DIR / "cstatic",
]
### browser url where media files are served by nginx
MEDIA_URL = "/media/"
### directory of media files
MEDIA_ROOT = TOP_DIR / "media/"

###### Custom Config #######
PRIVATE_STORAGE_ROOT = TOP_DIR / "priv_files"
STATIC_ROOT_DEV = TOP_DIR / "cstatic"  # see urls.py

###### Database #######
### sqlite3
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
        "TEST": {
            "NAME": BASE_DIR / "db_test.sqlite3",
        },
    }
}
### Postgres database. Celery fonctionne avec Postgres seulement quand Django run sur Docker
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql_psycopg2",
#         "NAME": os.getenv("POSTGRESQL_NAME"),
#         "USER": os.getenv("POSTGRESQL_USER"),
#         "PASSWORD": os.getenv("POSTGRESQL_PASSWORD"),
#         "HOST": "pgdb",  # Use the Docker service name here
#         # "HOST": "localhost",  # use when django runs outside of docker
#         "PORT": "5432",
#     }
# }
### Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

###### Sessions #######
SESSION_EXPIRE_AT_BROWSER_CLOSE = (
    True  # and use request.session.set_expiry(1000000) when user choses stay signed it
)
SESSION_COOKIE_AGE = 1000000  #  seconds
SESSION_SAVE_EVERY_REQUEST = True  # To reset cookie age every request

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
        "TIMEOUT": 300,
    }
}

###### Password validation #######
# AUTH_PASSWORD_VALIDATORS = [
#     {
#         "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
#     },
#     {
#         "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
#     },
#     {
#         "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
#     },
#     {
#         "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
#     },
# ]

###### Language, timezone, translation, localise #######
### original language
LANGUAGE_CODE = "en"
### Internationalization (language translation)
USE_I18N = True
LOCALE_PATHS = [
    BASE_DIR / "locale/",
]
LANGUAGES = (
    ("en", _("English")),
    ("fr", _("French")),
)  ### languages of the website (see urls.py)
### Timezones
USE_TZ = True
TIME_ZONE = "UTC"
### tz_detect middleware. Configure the countries in which your app will be most commonly used
TZ_DETECT_COUNTRIES = (
    "CA",
    "US",
)
### Localization (Not useful, result in same formating of numbers, dates, currency)
USE_L10N = False  # format of numbers, dates and currency.

###### Dev email backends only. Comment to use real email. #######
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

###### External email acccount #######
EMAIL_HOST = os.getenv("DJANGO_EMAIL_HOST")
EMAIL_PORT = os.getenv("DJANGO_EMAIL_PORT")
EMAIL_HOST_USER = os.getenv("DJANGO_EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("DJANGO_EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False

###### Error messages sent by email to admins  #######
DJANGO_ADMINS = os.getenv("DJANGO_ADMINS")  # custom variable
ADMINS = [tuple(admin.split(":")) for admin in DJANGO_ADMINS.split(",") if admin]
SERVER_EMAIL = os.getenv("DJANGO_SERVER_EMAIL")

###### Django Logger settings #######
LOGGING = {
    "version": 1,  # the dictConfig format version
    "disable_existing_loggers": False,  # retain the default loggers
    "handlers": {
        "mail_admins": {
            "level": "ERROR",
            "class": "django.utils.log.AdminEmailHandler",
        },
    },
    "handlers": {
        "file": {
            "class": "logging.FileHandler",
            "filename": "general.log",
            "level": "DEBUG",
        },
    },
    "loggers": {
        "": {
            "handlers": ["mail_admins"],
            "handlers": ["file"],
        },
    },
}

###### Elasticsearch ########
# ELASTICSEARCH_DSL = {"default": {"hosts": "elasticsearch"}}  # Docker service name

###### Celery. Add only when Django website is running on Docker, see Celery.py ########
CELERY_BROKER_URL = "redis://redis:6379"
CELERY_RESULT_BACKEND = "redis://redis:6379"

###### django-maintenance-mode middleware ######
MAINTENANCE_MODE_TEMPLATE = "base/maintenance-503.html"
MAINTENANCE_MODE_STATE_FILE_PATH = "zap/apps/base/maintenance_mode_state.txt"

###### DEBUG toolbar ######
DEBUG_TOOLBAR_PANELS = [
    "debug_toolbar.panels.history.HistoryPanel",
    "debug_toolbar.panels.versions.VersionsPanel",
    "debug_toolbar.panels.timer.TimerPanel",
    "debug_toolbar.panels.settings.SettingsPanel",
    "debug_toolbar.panels.headers.HeadersPanel",
    "debug_toolbar.panels.request.RequestPanel",
    "debug_toolbar.panels.sql.SQLPanel",
    "debug_toolbar.panels.staticfiles.StaticFilesPanel",
    "debug_toolbar.panels.templates.TemplatesPanel",
    "debug_toolbar.panels.cache.CachePanel",
    "debug_toolbar.panels.signals.SignalsPanel",
    "debug_toolbar.panels.logging.LoggingPanel",
    "debug_toolbar.panels.redirects.RedirectsPanel",
    "debug_toolbar.panels.profiling.ProfilingPanel",
]

TINYMCE_DEFAULT_CONFIG = {
    "height": "500px",
    "width": "960px",
    "menubar": False,
    # "menubar": "file edit view insert format tools table help",
    "plugins": "advlist autolink lists link image charmap print preview anchor searchreplace visualblocks codesample code nonbreaking "
    "fullscreen  media table paste code help wordcount spellchecker",
    "toolbar": "undo redo | bold italic underline strikethrough subscript superscript | fontsizeselect formatselect | alignleft "
    "aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor "
    "backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons nonbreaking | "
    "fullscreen  preview save | insertfile image media pageembed template link anchor codesample | "
    "a11ycheck ltr rtl | showcomments addcomment code",
    "custom_undo_redo_levels": 30,
    "language": "fr_ca",  # To force a specific language instead of the Django current language.
    "nonbreaking_force_tab": True,  # pressing Tab writes an actual Tab instead of going to next tool
    "toolbar_mode": "Wrap",
    "cleanup_on_startup": True,
    "image_caption": True,
    # "image_advtab": True,
    # "file_browser_callback": "myFileBrowser",
}

###### http Post requests #######
# DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10000  # 10 kB
# FILE_UPLOAD_MAX_MEMORY_SIZE is a Django setting that specifies the maximum size, in bytes, for files that will be uploaded into memory. Files larger than FILE_UPLOAD_MAX_MEMORY_SIZE will be streamed to disk 12.
FILE_UPLOAD_MAX_MEMORY_SIZE = 1048576  # 1 MB

###### Custom Config websocket WSI #######
WSI_MESSAGE_MAX_SIZE = 2000
WSI_DEFAULT_MAX_FILE_SIZE = 1000000
WSI_TMP_FILE_DIRECTORY = str(TOP_DIR) + "/tmp_files/"
