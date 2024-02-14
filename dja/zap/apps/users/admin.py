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
from zap.apps.accounts.models import Account, AddressCpUser
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
    inlines = [
        AddressCpUserAdmin,
    ]

    actions = [send_email_password_reset]
    ### The forms to add and change user instances
    form = UserChangeForm
    add_form = UserCreationForm

    ### The fields to be used in displaying the User model.
    ### These override the definitions on the base UserAdmin
    ### that reference specific fields on auth.User model.
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "email",
                    "password",
                    "account",
                    "is_responsible",
                    "is_active",
                    "filespro_folder",
                )
            },
        ),
        (
            _("Personal info"),
            {
                "fields": (
                    "prefix_title",
                    "first_name",
                    "middle_name",
                    "last_name",
                    "social_name",
                    "suffix_title",
                    "time_zone",
                    "avatar",
                )
            },
        ),
        (
            _("Permissions"),
            {"fields": ("is_superuser", "is_staff", "user_permissions", "groups")},
        ),
    )
    ### My custom fieldsets for staff, see get_fieldsets addon below too
    fieldsets_staff = (
        (
            None,
            {"fields": ("email", "password", "account", "is_responsible", "is_active")},
        ),
        (
            _("Personal info"),
            {
                "fields": (
                    "prefix_title",
                    "first_name",
                    "middle_name",
                    "last_name",
                    "suffix_title",
                    "time_zone",
                    "avatar",
                )
            },
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

    ###  my custom addon for staffs
    def get_fieldsets(self, request, obj=None):
        if not request.user.is_superuser:
            return self.fieldsets_staff
        return super().get_fieldsets(request, obj)


admin.site.register(Param)
# admin.site.unregister(Group)
