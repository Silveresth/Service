# Migration de données (à exécuter AVANT la migration de schéma qui ajoute
# la contrainte unique sur Compte.email).
#
# Sans cette étape, si la base contient déjà :
#   - plusieurs comptes avec email='' (chaîne vide), ou
#   - plusieurs comptes avec le même email non vide,
# alors l'ajout d'une contrainte UNIQUE échouerait au déploiement.
#
# Cette migration :
#   1. Met à NULL tous les emails vides ('') — NULL est autorisé en
#      plusieurs exemplaires sous une contrainte unique, contrairement à ''.
#   2. Pour les emails non vides en double, garde l'email sur le compte le
#      plus ancien (date_joined la plus ancienne) et met les autres à NULL,
#      en loggant un avertissement pour qu'un admin puisse les recontacter.

from django.db import migrations
import logging

logger = logging.getLogger(__name__)


def fix_duplicate_and_blank_emails(apps, schema_editor):
    Compte = apps.get_model('service', 'Compte')

    # 1. Emails vides → NULL
    Compte.objects.filter(email='').update(email=None)

    # 2. Emails non vides en double → on garde le plus ancien compte intact,
    #    on vide l'email des autres.
    from django.db.models import Count

    duplicates = (
        Compte.objects
        .exclude(email__isnull=True)
        .exclude(email='')
        .values('email')
        .annotate(count=Count('id'))
        .filter(count__gt=1)
    )

    for entry in duplicates:
        email = entry['email']
        comptes = list(Compte.objects.filter(email=email).order_by('date_joined'))
        # On garde le premier (le plus ancien), on vide les autres.
        for compte in comptes[1:]:
            logger.warning(
                f"[fix_duplicate_emails] Email en double '{email}' : "
                f"l'email du compte '{compte.username}' (id={compte.id}) a été "
                f"vidé pour permettre la contrainte unique. "
                f"Le compte '{comptes[0].username}' (id={comptes[0].id}) garde l'email."
            )
            compte.email = None
            compte.save(update_fields=['email'])


def reverse_noop(apps, schema_editor):
    # Pas de retour en arrière possible (on ne peut pas deviner les emails
    # d'origine qui ont été vidés) — migration de données non réversible.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('service', '0011_prestataireportfolio_serviceimage'),
    ]

    operations = [
        migrations.RunPython(fix_duplicate_and_blank_emails, reverse_noop),
    ]
