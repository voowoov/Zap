# Generated by Django 5.0.1 on 2024-02-15 02:04

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ChatSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('anonymous_session_id', models.IntegerField(blank=True, null=True)),
                ('anonymous_chat_client_name', models.CharField(blank=True, max_length=255, null=True)),
                ('anonymous_chat_client_desc', models.CharField(blank=True, max_length=255, null=True)),
                ('last_updated', models.DateTimeField(default=django.utils.timezone.now)),
                ('conversation', models.TextField()),
            ],
        ),
    ]
