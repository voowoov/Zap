from django.core.exceptions import ValidationError
from django.forms import ModelForm

from .models import PrivFile


class PrivFileForm(ModelForm):
    class Meta:
        model = PrivFile
        fields = "__all__"
