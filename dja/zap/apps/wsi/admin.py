from django.contrib import admin
from django.core.exceptions import PermissionDenied

# Register your models here.
from .models import FileUploadFile


def delete_selected(modeladmin, request, queryset):
    if not modeladmin.has_delete_permission(request):
        raise PermissionDenied
    for obj in queryset:
        obj.delete()


delete_selected.short_description = "Delete selected objects"


# overides of delete by queryset to delete method of the model
class FileUploadFileAdmin(admin.ModelAdmin):
    def delete_model(self, request, obj):
        obj.delete()  # when in the object page

    actions = [delete_selected]  # by selection when in the list


admin.site.register(FileUploadFile, FileUploadFileAdmin)
