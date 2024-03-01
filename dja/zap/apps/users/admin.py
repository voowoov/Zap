from django import forms
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import (
    ReadOnlyPasswordHashField,
    UserChangeForm,
    UserCreationForm,
)
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from zap.apps.accounts.models import AddressCpUser
from zap.apps.users.models import Param, User
from zap.apps.users.tasks import send_email_password_reset_task

UserModel = get_user_model()

# Define an inline admin descriptor for Employee model
# which acts a bit like a singleton


class UserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("email",)


class UserChangeForm(UserChangeForm):
    pass


@admin.action(description="Send email password reset")
def send_email_password_reset(modeladmin, request, queryset):
    send_email_password_reset_task(queryset[0])


class AddressCpUserAdmin(admin.TabularInline):
    model = AddressCpUser
    extra = 0
    show_change_link = True


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # inlines = [
    #     AddressCpUserAdmin,
    # ]

    # actions = [send_email_password_reset]
    # ### The forms to add and change user instances
    # form = UserChangeForm
    # add_form = UserCreationForm

    raw_id_fields = ("client_account",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "email",
                    "password",
                    "is_active",
                    "is_closed",
                    "client_account",
                )
            },
        ),
        (
            _("Personal info"),
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "role_en",
                    "role_fr",
                    "avatar",
                )
            },
        ),
        (
            _("Permissions"),
            {"fields": ("is_superuser", "is_staff", "user_permissions", "groups")},
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2"),
            },
        ),
    )
    list_display = ("email",)
    list_filter = ("email",)
    search_fields = ("email",)
    ordering = ("email",)
    filter_horizontal = ()


admin.site.register(Param)
# admin.site.unregister(Group)
