from celery import shared_task
from django.conf import settings
from django.core import mail
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from zap.apps.accounts.models import Account


@shared_task(name="send_mass_email_promo_task")
def send_mass_email_promo_task():
    # with transaction.atomic():

    all_accounts = list(Account.objects.all().values_list("user__email", "first_name"))

    subject = "Zap account - promo"
    from_email = "Zap <" + settings.EMAIL_HOST_USER + ">"
    # to = request.user.email
    messages = []
    for account in all_accounts:
        to = account[0]
        context = {
            "email": account[0],
            "first_name": account[1],
        }
        text_content = get_template("accounts/emails/promo_email_1.txt").render(context)
        html_content = get_template("accounts/emails/promo_email_1.html").render(context)
        message = EmailMultiAlternatives(subject, text_content, from_email, [to])
        message.attach_alternative(html_content, "text/html")
        messages.append(message)
    # multiple messages
    connection = mail.get_connection()
    connection.send_messages(messages)
    connection.close()

    return None
