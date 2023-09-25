from django.contrib import admin

from .models import Article, Author, ImageContent

admin.site.register(Author)
admin.site.register(ImageContent)


class ImageContentAdmin(admin.TabularInline):
    model = ImageContent
    extra = 0
    show_change_link = True


@admin.register(Article)
class AccountAdmin(admin.ModelAdmin):

    inlines = [
        ImageContentAdmin,
    ]
