# Migration de schéma : ajoute la contrainte unique sur Compte.email.
# Doit s'exécuter APRÈS 0012_fix_duplicate_emails (qui neutralise les
# doublons existants), sinon cette migration échoue si la base contient
# déjà des doublons.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('service', '0012_fix_duplicate_emails'),
    ]

    operations = [
        migrations.AlterField(
            model_name='compte',
            name='email',
            field=models.EmailField(
                max_length=254,
                unique=True,
                null=True,
                blank=True,
                verbose_name='email address',
            ),
        ),
    ]
