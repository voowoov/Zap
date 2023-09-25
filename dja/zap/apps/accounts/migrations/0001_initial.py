# Generated by Django 4.2.5 on 2023-09-25 03:12

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import zap.apps.accounts.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('account_number', models.CharField(max_length=9, unique=True)),
                ('account_type', models.CharField(choices=[('O', 'Organisation'), ('I', 'Individual')], default='I', max_length=1)),
                ('company_name', models.CharField(blank=True, max_length=35)),
                ('company_avatar', models.ImageField(blank=True, null=True, upload_to='avatar')),
                ('is_locked', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('closed_date', models.DateTimeField(blank=True, null=True)),
                ('log', models.TextField(blank=True)),
                ('deposited', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('amount_due', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
            ],
        ),
        migrations.CreateModel(
            name='AddressCp',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=40, verbose_name='Full Name')),
                ('add_info', models.CharField(blank=True, max_length=40)),
                ('unit_number', models.CharField(blank=True, max_length=6)),
                ('address_1', models.CharField(max_length=40)),
                ('city', models.CharField(max_length=30)),
                ('province', models.CharField(max_length=5)),
                ('postal_code', models.CharField(max_length=10)),
                ('country', models.CharField(choices=[('CA', 'Canada'), ('US', 'USA')], default='CA', max_length=2)),
                ('validated', models.BooleanField(default=False)),
                ('verified_date', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
        ),
        migrations.CreateModel(
            name='AddressUPS',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=35)),
                ('address_1', models.CharField(blank=True, max_length=35)),
                ('address_2', models.CharField(blank=True, max_length=35)),
                ('address_3', models.CharField(blank=True, max_length=35)),
                ('city', models.CharField(max_length=30)),
                ('province', models.CharField(max_length=5)),
                ('postal_code', models.CharField(max_length=9)),
                ('country', models.CharField(choices=[('CA', 'Canada'), ('US', 'USA')], default='CA', max_length=2)),
                ('residential', models.BooleanField(default=False)),
                ('validated', models.BooleanField(default=False)),
                ('verified', models.BooleanField(default=False)),
                ('verified_date', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
        ),
        migrations.CreateModel(
            name='Deposit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(auto_now_add=True)),
                ('number', models.CharField(max_length=8)),
                ('details', models.CharField(max_length=255)),
                ('receipt_pdf', models.FileField(upload_to=zap.apps.accounts.models.uploadPathFunction)),
                ('status', models.CharField(choices=[('bo', 'Booked'), ('ca', 'Cancelled'), ('pr', 'In Progress'), ('pe', 'Pending'), ('de', 'Delivered'), ('pd', 'Partially Delivered'), ('re', 'Refunded'), ('pr', 'Partially Refunded'), ('pi', 'Paid'), ('pp', 'Partially Paid'), ('de', 'Declined'), ('ap', 'Awaiting Payment'), ('au', 'Awaiting Pickup'), ('as', 'Awaiting Shipment'), ('co', 'Completed'), ('af', 'Awaiting Fulfillment'), ('mv', 'Manual Verification Required'), ('di', 'Disputed'), ('ap', 'Approved'), ('pa', 'Pending approval'), ('in', 'Incomplete')], default='green', max_length=30)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(auto_now_add=True)),
                ('number', models.CharField(max_length=8)),
                ('details', models.CharField(max_length=255)),
                ('invoice_pdf', models.FileField(upload_to=zap.apps.accounts.models.uploadPathFunction)),
                ('status', models.CharField(choices=[('bo', 'Booked'), ('ca', 'Cancelled'), ('pr', 'In Progress'), ('pe', 'Pending'), ('de', 'Delivered'), ('pd', 'Partially Delivered'), ('re', 'Refunded'), ('pr', 'Partially Refunded'), ('pi', 'Paid'), ('pp', 'Partially Paid'), ('de', 'Declined'), ('ap', 'Awaiting Payment'), ('au', 'Awaiting Pickup'), ('as', 'Awaiting Shipment'), ('co', 'Completed'), ('af', 'Awaiting Fulfillment'), ('mv', 'Manual Verification Required'), ('di', 'Disputed'), ('ap', 'Approved'), ('pa', 'Pending approval'), ('in', 'Incomplete')], default='green', max_length=30)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='Mailmessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sender', models.CharField(default='zap', max_length=12)),
                ('subject', models.CharField(blank=True, max_length=128)),
                ('body', models.TextField(blank=True)),
                ('date', models.DateTimeField(default=django.utils.timezone.now)),
                ('read', models.BooleanField(default=False)),
                ('language', models.CharField(default='en', max_length=2)),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='Param',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_account_number', models.IntegerField(default=300000100)),
            ],
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('number', models.CharField(max_length=8)),
                ('details', models.CharField(max_length=255)),
                ('status', models.CharField(choices=[('bo', 'Booked'), ('ca', 'Cancelled'), ('pr', 'In Progress'), ('pe', 'Pending'), ('de', 'Delivered'), ('pd', 'Partially Delivered'), ('re', 'Refunded'), ('pr', 'Partially Refunded'), ('pi', 'Paid'), ('pp', 'Partially Paid'), ('de', 'Declined'), ('ap', 'Awaiting Payment'), ('au', 'Awaiting Pickup'), ('as', 'Awaiting Shipment'), ('co', 'Completed'), ('af', 'Awaiting Fulfillment'), ('mv', 'Manual Verification Required'), ('di', 'Disputed'), ('ap', 'Approved'), ('pa', 'Pending approval'), ('in', 'Incomplete')], default='pe', max_length=2)),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='AddressCpProject',
            fields=[
                ('addresscp_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='accounts.addresscp')),
            ],
            bases=('accounts.addresscp',),
        ),
        migrations.CreateModel(
            name='AddressCpUser',
            fields=[
                ('addresscp_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='accounts.addresscp')),
            ],
            bases=('accounts.addresscp',),
        ),
    ]