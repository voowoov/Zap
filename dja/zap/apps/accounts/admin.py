from django import forms
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.db import models

UserModel = get_user_model()
from zap.apps.priv_files.models import PrivFile

from .models import (
    Account,
    AddressCpProject,
    AddressCpUser,
    AddressUPS,
    Deposit,
    Invoice,
    Mailmessage,
    Project,
)

admin.site.register(Invoice)
admin.site.register(Deposit)
admin.site.register(Mailmessage)
admin.site.register(AddressCpUser)
admin.site.register(AddressCpProject)
admin.site.register(AddressUPS)


class UserAdmin(admin.TabularInline):
    model = UserModel
    extra = 0
    show_change_link = True
    fields = (
        "email",
        "first_name",
        "last_name",
        "is_responsible",
        "is_active",
    )
    readonly_fields = fields


class AddressCpProjectAdmin(admin.TabularInline):
    model = AddressCpProject
    extra = 0
    show_change_link = True


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    inlines = [
        UserAdmin,
        AddressCpProjectAdmin,
    ]


class PrivFileAdmin(admin.TabularInline):
    model = PrivFile
    extra = 0
    # formfield_overrides = {
    #     models.DateTimeField: {
    #         "widget": forms.DateTimeInput(
    #             attrs={"type": "datetime-local", "style": "height: auto;"}
    #         )
    #     },
    # }
    readonly_fields = ("file_size_MB",)


@admin.register(Project)
class AccountAdmin(admin.ModelAdmin):
    inlines = [
        PrivFileAdmin,
    ]
