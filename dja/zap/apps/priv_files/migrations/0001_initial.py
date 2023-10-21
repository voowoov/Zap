# Generated by Django 4.2.5 on 2023-10-17 20:50

import django.core.files.storage
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import pathlib
import zap.apps.priv_files.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PrivFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(storage=django.core.files.storage.FileSystemStorage(base_url='/media_private', location=pathlib.PurePosixPath('/usr/src/priv_files')), upload_to=zap.apps.priv_files.models.uploadPathFunction)),
                ('original_filename', models.CharField(blank=True, max_length=255)),
                ('file_size_MB', models.FloatField(blank=True)),
                ('uploaded_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='accounts.project')),
            ],
        ),
    ]
