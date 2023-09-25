import pytest

pytestmark = pytest.mark.django_db


class TestCategoryModel:
    def test_str_method(self, project_factory):
        # Arrange
        # Act
        x = project_factory()
        # Assert
        assert x.__str__() == "test_pro"


class TestBrandModel:
    pass
