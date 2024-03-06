import datetime
import logging
import os

from django.conf import settings
from django.db import models, transaction
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)


def uploadPathFunction(instance, filename):
    return os.path.join("HG5GPD8/%s/" % get_random_string(8), filename)


def uploadPathFunctionAvatar(instance, filename):
    return "avatars/%s" % get_random_string(8) + ".png"


STATUS_CHOICES = [
    ("bo", "Booked"),
    ("ca", "Cancelled"),
    ("pr", "In Progress"),
    ("pe", "Pending"),
    ("de", "Delivered"),
    ("pd", "Partially Delivered"),
    ("re", "Refunded"),
    ("pr", "Partially Refunded"),
    ("pi", "Paid"),
    ("pp", "Partially Paid"),
    ("de", "Declined"),
    ("ap", "Awaiting Payment"),
    ("au", "Awaiting Pickup"),
    ("as", "Awaiting Shipment"),
    ("co", "Completed"),
    ("af", "Awaiting Fulfillment"),
    ("mv", "Manual Verification Required"),
    ("di", "Disputed"),
    ("ap", "Approved"),
    ("pa", "Pending approval"),
    ("in", "Incomplete"),
]
ACCOUNTTYPE_CHOICES = [
    ("O", _("Organisation")),
    ("I", _("Individual")),
]

COUNTRY_CHOICES = [
    ("CA", "Canada"),
    ("US", "USA"),
]


class ClientAccount(models.Model):

    account_number = models.CharField(max_length=9, unique=True)
    account_type = models.CharField(
        max_length=1, default="I", choices=ACCOUNTTYPE_CHOICES
    )
    company_name = models.CharField(max_length=35, blank=True)
    company_avatar = models.ImageField(upload_to="avatar", null=True, blank=True)
    is_locked = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    closed_date = models.DateTimeField(blank=True, null=True)
    log = models.TextField(blank=True)

    deposited = models.DecimalField(decimal_places=2, max_digits=10, default=0)
    amount_due = models.DecimalField(decimal_places=2, max_digits=10, default=0)
    invoices = models.ManyToManyField("Invoice", blank=True)
    deposits = models.ManyToManyField("Deposit", blank=True)
    projects = models.ManyToManyField("Project", blank=True)

    def __str__(self):
        return self.account_number

    def add_log(self, text):
        logger.debug(f"Account log: {self.log}")
        self.log += (
            datetime.datetime.now().strftime("%y-%m-%d %H:%M") + " " + text + "\n"
        )
        self.save()

    @classmethod
    def create_client_account(cls):
        # with transaction.atomic():
        param = Param.objects.first()
        new_acc_num = param.last_client_account_number + 1
        param.last_client_account_number = new_acc_num
        param.save()
        s = cls(account_number=str(new_acc_num))
        s.save()
        return s


class Project(models.Model):
    date = models.DateField(default=timezone.now)
    number = models.CharField(max_length=8)
    details = models.CharField(max_length=255)
    status = models.CharField(max_length=2, choices=STATUS_CHOICES, default="pe")

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.number


class Invoice(models.Model):
    date = models.DateField(auto_now_add=True)
    number = models.CharField(max_length=8)
    details = models.CharField(max_length=255)
    invoice_pdf = models.FileField(upload_to=uploadPathFunction)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, null=True, blank=True
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="green")
    amount = models.DecimalField(decimal_places=2, max_digits=10)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.number


class Deposit(models.Model):
    date = models.DateField(auto_now_add=True)
    number = models.CharField(max_length=8)
    details = models.CharField(max_length=255)
    receipt_pdf = models.FileField(upload_to=uploadPathFunction)
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, null=True, blank=True
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="green")
    amount = models.DecimalField(decimal_places=2, max_digits=10)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.number


class Param(models.Model):
    last_client_account_number = models.IntegerField(default=300000100)


class Mailmessage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    sender = models.CharField(max_length=12, default="zap")
    subject = models.CharField(max_length=128, blank=True)
    body = models.TextField(blank=True)
    date = models.DateTimeField(default=timezone.now)
    read = models.BooleanField(default=False)
    language = models.CharField(max_length=2, default="en")

    class Meta:
        ordering = ["-date"]


class AddressCp(models.Model):
    name = models.CharField(max_length=40, verbose_name=_("Full Name"))  #
    #   Place additional delivery information such as title, floor, etc. above the civic address.
    add_info = models.CharField(max_length=40, blank=True)
    unit_number = models.CharField(max_length=6, blank=True)  # unit/app. number.
    address_1 = models.CharField(
        max_length=40
    )  #  street address   max chars with unit_number is 40
    city = models.CharField(max_length=30)
    province = models.CharField(max_length=5)
    postal_code = models.CharField(max_length=10)
    country = models.CharField(max_length=2, default="CA", choices=COUNTRY_CHOICES)
    validated = models.BooleanField(default=False)
    verified_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        address = self.name + "\n"
        if self.country == "CA":
            if self.add_info:
                address += self.add_info + "\n"
            if self.unit_number:
                address += self.unit_number + "-"
            address += self.address_1 + "\n"
            address += self.city + " " + self.province + "  " + self.postal_code + "\n"
        else:
            address += self.address_1 + "\n"
            address += self.city + " " + self.province + "  " + self.postal_code + "\n"
            address += self.get_country_display()

        return address.upper()


class AddressCpUser(AddressCp):
    client_account = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )


class AddressCpProject(AddressCp):
    client_account = models.ForeignKey(ClientAccount, on_delete=models.CASCADE)


class AddressUPS(models.Model):
    client_account = models.ForeignKey(ClientAccount, on_delete=models.CASCADE)
    name = models.CharField(max_length=35)  #
    #  Recipient's street address
    address_1 = models.CharField(max_length=35, blank=True)
    #  UPS  Additional address information (room, floor, apartment).
    address_2 = models.CharField(max_length=35, blank=True)
    #  Additional address information (department)
    address_3 = models.CharField(max_length=35, blank=True)
    city = models.CharField(max_length=30)
    province = models.CharField(max_length=5)
    postal_code = models.CharField(max_length=9)
    country = models.CharField(max_length=2, default="CA", choices=COUNTRY_CHOICES)
    residential = models.BooleanField(default=False)
    validated = models.BooleanField(default=False)
    verified = models.BooleanField(default=False)
    verified_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        address = self.name + "\n" + self.address_1 + "\n"
        if self.address_2:
            address += self.address_2 + "\n"
        if self.address_3:
            address += self.address_3 + "\n"
        address += self.city + " " + self.province + "  " + self.postal_code + "\n"
        address += self.get_country_display()

        return address.upper()


class PhoneNumbers(models.Model):

    description = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=255, unique=True)
    is_verified = models.BooleanField(default=False)
