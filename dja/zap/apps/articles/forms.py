from django.core.exceptions import ValidationError
from django.forms import ModelForm

from .models import Article, Author, ImageContent


class AuthorForm(ModelForm):
    class Meta:
        model = Author
        fields = "__all__"
class ArticleForm(ModelForm):
    class Meta:
        model = Article
        fields = "__all__"
class ImageContentForm(ModelForm):
    class Meta:
        model = ImageContent
        fields = "__all__"
