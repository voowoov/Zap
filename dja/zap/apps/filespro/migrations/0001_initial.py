# Generated by Django 5.0.1 on 2024-03-01 01:04

import django.core.files.storage
import django.db.models.deletion
import pathlib
import zap.apps.filespro.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='FilesproFolder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('max_storage_size', models.PositiveIntegerField(default=0)),
                ('used_storage_size', models.PositiveIntegerField(default=0)),
                ('freq_limit_storage', models.PositiveIntegerField(default=0)),
                ('last_timestamp', models.PositiveIntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='FilesproFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(storage=django.core.files.storage.FileSystemStorage(base_url='/media_private/', location=pathlib.PurePosixPath('/usr/src/priv_files')), upload_to=zap.apps.filespro.models.uploadPathFunction)),
                ('file_name', models.CharField(max_length=255)),
                ('file_size', models.PositiveIntegerField()),
                ('filespro_folder', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='filespro.filesprofolder')),
            ],
        ),
    ]
