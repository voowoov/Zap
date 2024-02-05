# Generated by Django 5.0.1 on 2024-02-05 14:57

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Movie',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language', models.CharField(max_length=255, verbose_name='language')),
                ('title', models.CharField(max_length=255, verbose_name='title')),
                ('release_date', models.CharField(max_length=255, verbose_name='release_date')),
                ('vote', models.FloatField(default=0, verbose_name='vote')),
            ],
        ),
    ]
