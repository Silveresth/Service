from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('service', '0006_fix_paiements_frais'),
    ]

    operations = [
        migrations.AlterField(
            model_name='compte',
            name='telephone',
            field=models.CharField(max_length=20),
        ),
    ]
