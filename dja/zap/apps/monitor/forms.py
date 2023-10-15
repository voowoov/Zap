from django import forms
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

UserModel = get_user_model()


class EmailAddressForm(forms.Form):
    email = forms.EmailField()
