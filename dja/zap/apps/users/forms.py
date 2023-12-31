from django import forms
from django.contrib.auth import authenticate, get_user_model, password_validation
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.forms import Form, ModelForm
from django.utils.translation import gettext_lazy as _

UserModel = get_user_model()


class CreateUserNewAccountForm(UserCreationForm):
    class Meta:
        model = UserModel
        fields = ["email"]
        widgets = {"email": forms.HiddenInput()}

    def __init__(self, *args, **kwargs):
        super(CreateUserNewAccountForm, self).__init__(*args, **kwargs)
        del self.fields["password2"]

    def _post_clean(self):
        super()._post_clean()
        # Validate the password after self.instance is updated with form data
        # by super().
        password = self.cleaned_data.get("password1")
        if password:
            try:
                password_validation.validate_password(password, self.instance)
            except ValidationError as error:
                self.add_error("password1", error)


class MyUserChangeForm(UserChangeForm):
    class Meta:
        model = UserModel
        fields = ["email"]


class SigninForm0(Form):
    stay_signed_in = forms.BooleanField()
    email = forms.EmailField(max_length=35)
    password = forms.CharField(
        label=_("Password"), strip=False, widget=forms.PasswordInput(attrs={"autocomplete": "current-password"})
    )


class SigninFormLev2(ModelForm):
    class Meta:
        model = UserModel
        fields = ["email"]
        # widgets = {"email": forms.HiddenInput()}


class PasswordResetForm(ModelForm):
    class Meta:
        model = UserModel
        fields = ["email"]
        widgets = {"email": forms.HiddenInput()}


# class ResetPasswordForm(forms.form):
#     stay_signed_in = models.BooleanField()
