from django import forms
from django.contrib.auth import authenticate, get_user_model, password_validation
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.forms import ModelForm
from django.utils.translation import gettext_lazy as _

UserModel = get_user_model()


class EmailAddressForm(forms.Form):
    email = forms.EmailField()
