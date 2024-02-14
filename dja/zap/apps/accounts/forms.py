from django.core.exceptions import ValidationError
from django.forms import ModelForm

from .models import AddressCpProject, Project


class ProjectForm(ModelForm):
    class Meta:
        model = Project
        fields = "__all__"


class AddressCpForm(ModelForm):
    def clean(self):
        cleaned_data = super().clean()
        unit_number = cleaned_data.get("unit_number")
        address_1 = cleaned_data.get("address_1")
        if unit_number and address_1 and (len(unit_number) + len(address_1) > 40):
            raise ValidationError(
                _(
                    "Unit number and Street address together must total less than %(value)s characters."
                ),
                # _("Unit number and Street address together must total less than %(value)s characters."),
                code="invalid",
                params={"value": "40"},
            )


class AddressCpProjectForm(AddressCpForm):
    class Meta:
        model = AddressCpProject
        exclude = []
