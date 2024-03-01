# Generated by Django 5.0.1 on 2024-03-01 01:04

import django.utils.timezone
import tinymce.models
import zap.apps.articles.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('article_slug', models.CharField(max_length=255, unique=True)),
                ('title_fr', models.CharField(blank=True, max_length=255)),
                ('title_en', models.CharField(blank=True, max_length=255)),
                ('subtitle_fr', models.CharField(blank=True, max_length=255)),
                ('subtitle_en', models.CharField(blank=True, max_length=255)),
                ('content_fr', tinymce.models.HTMLField(blank=True)),
                ('content_en', tinymce.models.HTMLField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('image_main', models.ImageField(blank=True, null=True, upload_to=zap.apps.articles.models.uploadPathFunction)),
                ('image_tumbnail', models.ImageField(blank=True, null=True, upload_to=zap.apps.articles.models.uploadPathFunction)),
            ],
            options={
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='Author',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('author_slug', models.CharField(max_length=255, unique=True)),
                ('name_fr', models.CharField(blank=True, max_length=255)),
                ('name_en', models.CharField(blank=True, max_length=255)),
                ('description_fr', tinymce.models.HTMLField(blank=True)),
                ('description_en', tinymce.models.HTMLField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='ImageContent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to=zap.apps.articles.models.uploadPathFunction)),
            ],
        ),
    ]
