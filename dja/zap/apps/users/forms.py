from django import forms
from django.contrib.auth import authenticate, get_user_model, password_validation
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.forms import Form, ModelForm
from django.utils.translation import gettext_lazy as _

UserModel = get_user_model()
from django.contrib.auth.forms import AuthenticationForm


class CustomLoginForm(AuthenticationForm):
    remember_email = forms.BooleanField(required=False)
    stay_signed_in = forms.BooleanField(required=False)

    def confirm_login_allowed(self, user):
        super().confirm_login_allowed(user)
        ### custom validation step
        if user.is_closed:
            raise ValidationError(
                _("This account is closed."),
                code="closed",
            )


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = UserModel
        fields = [
            "username",
            "password1",
            "first_name",
            "last_name",
            "role_en",
            "role_fr",
        ]
        # widgets = {"email": forms.HiddenInput()}

    def __init__(self, *args, **kwargs):
        super(CustomUserCreationForm, self).__init__(*args, **kwargs)
        del self.fields["password2"]
        for field_name in self.fields:
            self.fields[field_name].initial = ""
