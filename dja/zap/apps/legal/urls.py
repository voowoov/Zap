from django.urls import path
from django.utils.translation import gettext_lazy as _

from . import views

app_name = "legal"

urlpatterns = [
    path(_("terms-of-service"), views.terms_of_service, name="terms_of_service"),
    path(_("privacy-policy"), views.privacy_policy, name="privacy_policy"),
    path(_("cookie-policy"), views.cookie_policy, name="cookie_policy"),
    path(_("acceptable-use-policy"), views.acceptable_use_policy, name="acceptable_use_policy"),
    path(_("return-and-refund-policy"), views.return_and_refund_policy, name="return_and_refund_policy"),
    path(_(""), views.terms_of_service, name="terms_of_service"),
]
