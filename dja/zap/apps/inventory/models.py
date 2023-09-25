import os
import uuid
from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models, transaction
from django.templatetags.static import static
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from mptt.models import MPTTModel, TreeForeignKey
from zap.apps.users.models import User

SHIPPING_RESTRICTION_CHOICES = [
    (10, "Normal"),
    (20, "Precious"),
]
PACKAGE_FORM_CHOICES = [
    (10, "Box"),
    (20, "Bag"),
]
STOCK_LOCATION_CHOICES = [
    (10, "Main"),
    (20, "Second"),
]
WARRANTY_TYPE_CHOICES = [
    (10, "Standard"),
]
TAX_TYPE_CHOICES = [
    (10, "Undefined"),
    (20, "No taxe"),
    (30, "Quebec"),
    (40, "Ontario"),
]
SHIPMENT_TYPE_CHOICES = [
    (10, "Standard"),
    (20, "Priority"),
]
PAYMENT_TYPE_CHOICES = [
    (10, "Undefined"),
    (20, "VISA"),
]
STATUS_CHOICES = [
    (90, "Initiated"),
    (100, "Booked"),
    (110, "Cancelled"),
    (120, "In Progress"),
    (130, "Pending"),
    (140, "Delivered"),
    (150, "Partially Delivered"),
    (160, "Refunded"),
    (170, "Partially Refunded"),
    (180, "Paid"),
    (190, "Partially Paid"),
    (200, "Declined"),
    (210, "Awaiting Payment"),
    (220, "Awaiting Pickup"),
    (230, "Awaiting Shipment"),
    (240, "Completed"),
    (250, "Awaiting Fulfillment"),
    (260, "Manual Verification Required"),
    (270, "Disputed"),
    (280, "Approved"),
    (290, "Pending approval"),
    (300, "Incomplete"),
]


def uploadPathFunction(instance, filename):
    randomN = uuid.uuid4()
    return os.path.join("HG5GPD8/%s/" % randomN, filename)


class Category(MPTTModel):
    slug = models.SlugField(max_length=50, unique=True)
    name = models.CharField(
        max_length=50,
    )
    is_active = models.BooleanField(
        default=False,
    )
    parent = TreeForeignKey(
        "self",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    level = models.PositiveSmallIntegerField(default=0)
    navimage = models.ForeignKey(
        "NavImage",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    class MPTTMeta:
        order_insertion_by = ["name"]

    class Meta:
        ordering = ["name"]
        verbose_name_plural = _("categories")

    def __str__(self):
        return self.name


class ProductCategory(models.Model):
    product = models.ForeignKey(
        "Product",
        on_delete=models.CASCADE,
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name_plural = _("product_categories")
        unique_together = (("product", "category"),)


class Product(models.Model):
    web_id = models.CharField(
        max_length=50,
        unique=True,
    )
    slug = models.SlugField(
        max_length=50,
    )
    name = models.CharField(
        max_length=255,
    )
    navimage = models.ForeignKey(
        "NavImage",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    variants = models.TextField(blank=True)
    brand = models.ForeignKey(
        "Brand",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    model = models.CharField(
        max_length=50,
    )
    sku = models.CharField(
        max_length=50,
        unique=True,
    )
    upc = models.CharField(
        max_length=50,
        null=True,
        blank=True,
    )
    description = models.TextField(
        blank=True,
    )
    specifications = models.TextField(
        blank=True,
    )
    warranty = models.ForeignKey(
        "Warranty",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    shipping_restriction = models.PositiveSmallIntegerField(
        choices=SHIPPING_RESTRICTION_CHOICES,
        default="100",
    )
    package_weight = models.IntegerField(
        default=0,
    )
    package_dimension_h = models.IntegerField(
        default=0,
    )
    package_dimension_w = models.IntegerField(
        default=0,
    )
    package_dimension_d = models.IntegerField(
        default=0,
    )
    tax_type = models.PositiveSmallIntegerField(
        choices=TAX_TYPE_CHOICES,
        default="10",
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    watchers = models.PositiveSmallIntegerField(
        default=0,
    )
    status = models.PositiveSmallIntegerField(
        choices=STATUS_CHOICES,
        default="90",
    )
    review_num = models.PositiveSmallIntegerField(
        default=0,
    )
    review_score = models.PositiveSmallIntegerField(
        default=0,
    )
    is_active = models.BooleanField(
        default=False,
    )
    categories = models.ManyToManyField(
        Category,
        through="ProductCategory",
    )
    images = models.ManyToManyField(
        "Image",
        through="ProductImage",
    )
    videos = models.ManyToManyField(
        "Video",
        through="ProductVideo",
    )
    files = models.ManyToManyField(
        "File",
        through="ProductFile",
    )
    attributes = models.ManyToManyField(
        "Attribute",
        through="ProductAttribute",
    )
    orders = models.ManyToManyField(
        "Order",
        through="ProductOrder",
    )
    shipments = models.ManyToManyField(
        "Shipment",
        through="ProductOrder",
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class PriceHistory(models.Model):
    product = models.ForeignKey(
        "Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )

    def __str__(self):
        return self.price

    class Meta:
        ordering = ["-updated_at"]


class Variant(models.Model):
    product = models.ForeignKey(
        "Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )


class NavImage(models.Model):
    image_5kb_url = models.ImageField(
        upload_to="inventory_image",
        null=True,
        blank=True,
    )


class Image(models.Model):
    order = models.PositiveSmallIntegerField(
        default=100,
    )
    title = models.CharField(
        max_length=50,
        blank=True,
    )
    image_2kb_url = models.ImageField(
        upload_to="inventory_image",
        null=True,
        blank=True,
    )
    image_14kb_url = models.ImageField(
        upload_to="inventory_image",
        null=True,
        blank=True,
    )
    image_80kb_url = models.ImageField(
        upload_to="inventory_image",
        null=True,
        blank=True,
    )


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
    )
    image = models.ForeignKey(
        Image,
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ["image__order"]
        unique_together = (("product", "image"),)


class Video(models.Model):
    order = models.PositiveSmallIntegerField(
        default=100,
    )
    title = models.CharField(
        max_length=50,
        blank=True,
    )
    youtube = models.CharField(
        max_length=50,
    )


class ProductVideo(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
    )
    video = models.ForeignKey(
        Video,
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ["video__order"]
        unique_together = (("product", "video"),)


class File(models.Model):
    order = models.PositiveSmallIntegerField(
        default=100,
    )
    title = models.CharField(
        max_length=50,
        blank=True,
    )
    file = models.FileField(upload_to=uploadPathFunction)


class ProductFile(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
    )
    file = models.ForeignKey(
        File,
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ["file__order"]
        unique_together = (("product", "file"),)


class Brand(models.Model):
    name = models.CharField(
        max_length=50,
        unique=True,
    )
    navimage = models.ForeignKey(
        "NavImage",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class Warranty(models.Model):
    type = models.PositiveSmallIntegerField(
        choices=WARRANTY_TYPE_CHOICES,
        default="10",
    )
    description = models.TextField(
        blank=True,
    )

    def __str__(self):
        return self.type


class ProductReview(models.Model):
    product = models.ForeignKey(
        "Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    username = models.CharField(
        max_length=20,
    )
    date = models.DateTimeField(
        auto_now_add=True,
        editable=False,
    )
    title = models.CharField(
        max_length=50,
    )
    review = models.TextField(
        blank=True,
    )
    score = models.PositiveSmallIntegerField(default=3)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["-date"]
        unique_together = (("product", "review"),)


class Attribute(models.Model):
    name = models.CharField(
        max_length=50,
    )
    description = models.CharField(
        max_length=140,
    )
    group = models.CharField(
        max_length=50,
    )
    units = models.CharField(
        max_length=50,
    )
    is_searchfilter = models.BooleanField(
        default=False,
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["group", "name"]


class ProductAttribute(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
    )
    attribute = models.ForeignKey(
        Attribute,
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ["attribute__group", "attribute__name"]
        unique_together = (("product", "attribute"),)


class Stock(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
    )
    location = models.PositiveSmallIntegerField(
        choices=STOCK_LOCATION_CHOICES,
        default="10",
    )
    quantity = models.IntegerField(
        default=0,
    )

    def __str__(self):
        return self.location + " loc. qty: " + self.quantity

    class Meta:
        ordering = ["-quantity"]


class StockTransact(models.Model):
    stock = models.ForeignKey(
        Stock,
        on_delete=models.CASCADE,
    )
    date = models.DateTimeField(
        auto_now_add=True,
        editable=False,
    )
    quantity_change = models.IntegerField(
        default=0,
    )
    quantity_new = models.IntegerField(
        default=0,
    )
    status = models.PositiveSmallIntegerField(
        choices=STATUS_CHOICES,
        default="90",
    )

    def __str__(self):
        return self.quantity_new

    class Meta:
        ordering = ["-date"]


class Order(models.Model):
    date = models.DateTimeField(
        auto_now_add=True,
        editable=False,
    )
    number = models.CharField(
        max_length=30,
        unique=True,
    )
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    tax_hst = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    tax_gst = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    tax_pst = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    tax_qst = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    comment = models.TextField(
        blank=True,
    )
    status = models.PositiveSmallIntegerField(
        choices=STATUS_CHOICES,
        default="90",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
    )
    address = models.ForeignKey(
        "Address",
        on_delete=models.PROTECT,
    )
    email = models.EmailField(
        max_length=255,
        blank=True,
    )
    phone = models.CharField(
        max_length=254,
        blank=True,
    )

    def __str__(self):
        return self.number

    class Meta:
        ordering = ["-date"]


class ProductOrder(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.PROTECT,
    )
    quantity = models.IntegerField(
        default=0,
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    shipment = models.ForeignKey(
        "Shipment",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.price

    class Meta:
        ordering = ["price"]
        unique_together = (("product", "order"),)


class Payment(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.PROTECT,
    )
    number = models.CharField(
        max_length=30,
        unique=True,
    )
    type = models.PositiveSmallIntegerField(
        choices=PAYMENT_TYPE_CHOICES,
        default="10",
    )
    partial = models.BooleanField(
        default=False,
    )
    status = models.PositiveSmallIntegerField(
        choices=STATUS_CHOICES,
        default="90",
    )

    def __str__(self):
        return self.number


class Shipment(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.PROTECT,
    )
    address = models.ForeignKey(
        "Address",
        on_delete=models.PROTECT,
    )
    number = models.CharField(
        max_length=30,
        unique=True,
    )
    type = models.PositiveSmallIntegerField(
        choices=SHIPMENT_TYPE_CHOICES,
        default="10",
    )
    partial = models.BooleanField(
        default=False,
    )
    returning = models.BooleanField(
        default=False,
    )
    status = models.PositiveSmallIntegerField(
        choices=STATUS_CHOICES,
        default="90",
    )

    def __str__(self):
        return self.number


class Address(models.Model):
    full_name = models.CharField(max_length=50)
    address_1 = models.CharField(max_length=250)
    address_2 = models.CharField(max_length=250)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)

    def __str__(self):
        return self.full_name


class StatusHistory(models.Model):
    date = models.DateTimeField(
        auto_now_add=True,
        editable=False,
    )
    status = models.PositiveSmallIntegerField(
        choices=STATUS_CHOICES,
        default="90",
    )
    comment = models.TextField(
        blank=True,
    )

    def __str__(self):
        return self.date

    class Meta:
        ordering = ["-date"]
        abstract = True


class ProductStatusHistory(StatusHistory):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
    )


class StockTransactStatusHistory(StatusHistory):
    stocktransact = models.ForeignKey(
        StockTransact,
        on_delete=models.CASCADE,
    )


class OrderStatusHistory(StatusHistory):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
    )


class PaymentStatusHistory(StatusHistory):
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
    )


class ShipmentStatusHistory(StatusHistory):
    shipment = models.ForeignKey(
        Shipment,
        on_delete=models.CASCADE,
    )
