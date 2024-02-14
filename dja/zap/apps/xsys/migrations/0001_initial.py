# Generated by Django 5.0.1 on 2024-02-13 00:28

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CookieOnServer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cos_id', models.CharField(max_length=32)),
                ('last_login_email', models.CharField(blank=True, max_length=255, null=True)),
                ('remember_email', models.BooleanField(default=True)),
                ('stay_signed_in', models.BooleanField(default=True)),
            ],
        ),
    ]
