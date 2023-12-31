# Generated by Django 4.2.5 on 2023-09-25 03:12

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='mailmessage',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='invoice',
            name='project',
            field=models.ForeignKey(blank=True, on_delete=django.db.models.deletion.CASCADE, to='accounts.project'),
        ),
        migrations.AddField(
            model_name='deposit',
            name='invoice',
            field=models.ForeignKey(blank=True, on_delete=django.db.models.deletion.CASCADE, to='accounts.invoice'),
        ),
        migrations.AddField(
            model_name='addressups',
            name='account',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.account'),
        ),
        migrations.AddField(
            model_name='account',
            name='deposits',
            field=models.ManyToManyField(blank=True, to='accounts.deposit'),
        ),
        migrations.AddField(
            model_name='account',
            name='invoices',
            field=models.ManyToManyField(blank=True, to='accounts.invoice'),
        ),
        migrations.AddField(
            model_name='account',
            name='projects',
            field=models.ManyToManyField(blank=True, to='accounts.project'),
        ),
        migrations.AddField(
            model_name='addresscpuser',
            name='account',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='addresscpproject',
            name='account',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.account'),
        ),
    ]
