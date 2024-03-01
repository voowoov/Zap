from django.contrib import admin
from django.contrib.auth import get_user_model

UserModel = get_user_model()

from .models import (
    AddressCpProject,
    AddressCpUser,
    AddressUPS,
    ClientAccount,
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
        "is_active",
    )
    readonly_fields = fields


class AddressCpProjectAdmin(admin.TabularInline):
    model = AddressCpProject
    extra = 0
    show_change_link = True


@admin.register(ClientAccount)
class AccountAdmin(admin.ModelAdmin):
    inlines = [
        UserAdmin,
        AddressCpProjectAdmin,
    ]
