from celery import shared_task
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.core import mail
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.utils.translation import gettext_lazy as _
from zap.apps.xsys.tokens import password_reset_token, user_token_generator


@shared_task(name="send_email_account_creation_link_task")
def send_email_account_creation_link_task(email):
    subject = "Zap account - create an account"
    from_email = "Zap <" + settings.EMAIL_HOST_USER + ">"
    to = email
    context = {
        "activation_link": make_link_create_user(email),
    }
    text_content = get_template("users/emails/user_creation_link.txt").render(context)
    html_content = get_template("users/emails/user_creation_link.html").render(context)
    message = EmailMultiAlternatives(subject, text_content, from_email, [to])
    message.attach_alternative(html_content, "text/html")
    message.send()

    return None


@shared_task(name="send_email_password_reset_task")
def send_email_password_reset_task(user):
    # with transaction.atomic():

    subject = "Zap account - create an account"
    from_email = "Zap <" + settings.EMAIL_HOST_USER + ">"
    to = user.email
    context = {
        "activation_link": make_link_password_reset(user),
    }
    text_content = get_template("users/emails/password_reset_link.txt").render(context)
    html_content = get_template("users/emails/password_reset_link.html").render(context)
    message = EmailMultiAlternatives(subject, text_content, from_email, [to])
    message.attach_alternative(html_content, "text/html")
    message.send()

    return None


def make_link_create_user(email):
    uid = urlsafe_base64_encode(force_bytes(email))
    token = user_token_generator.make_token(email)
    return domain + reverse("create_user", args=[uid, token])


def make_link_password_reset(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = password_reset_token.make_token(user)
    return domain + reverse("password_reset", args=[uid, token])
