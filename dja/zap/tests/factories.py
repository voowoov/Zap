import factory
from zap.apps.accounts.models import Project


class ProjectFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Project

    number = "test_pro"
