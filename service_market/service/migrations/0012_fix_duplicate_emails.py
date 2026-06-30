# Migration de données (à exécuter AVANT la migration de schéma qui ajoute
# la contrainte unique sur Compte.email).
#
# Sans cette étape, si la base contient déjà :
#   - plusieurs comptes avec email='' (chaîne vide), ou
#   - plusieurs comptes avec le même email non vide,
# alors l'ajout d'une contrainte UNIQUE échouerait au déploiement.
#
# Cette migration :
#   1. Génère un email unique factice pour tous les comptes dont l'email est vide ('').
#   2. Pour les emails en double, garde l'email sur le compte le
#      plus ancien (date_joined la plus ancienne) et génère un email factice unique
#      pour les autres, en loggant un avertissement pour qu'un admin puisse les recontacter.

from django.db import migrations
import logging

logger = logging.getLogger(__name__)


def fix_duplicate_and_blank_emails(apps, schema_editor):
    Compte = apps.get_model('service', 'Compte')

    # 1. Emails vides ('') ou None (au cas où) → Génération d'un email unique factice
    # On boucle un par un car chaque email généré doit être unique.
    blank_comptes = Compte.objects.filter(email='')
    for compte in blank_comptes:
        placeholder_email = f"{compte.username}_{compte.id}@placeholder.service.market".lower()
        logger.info(f"[fix_duplicate_emails] Email vide pour '{compte.username}' (id={compte.id}) -> Affectation de {placeholder_email}")
        compte.email = placeholder_email
        compte.save(update_fields=['email'])

    # 2. Emails non vides en double → on garde le plus ancien compte intact,
    #    on attribue un email factice aux autres.
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
        # On garde le premier (le plus ancien), on modifie les autres.
        for compte in comptes[1:]:
            placeholder_email = f"{compte.username}_{compte.id}@placeholder.service.market".lower()
            logger.warning(
                f"[fix_duplicate_emails] Email en double '{email}' : "
                f"l'email du compte '{compte.username}' (id={compte.id}) a été "
                f"remplacé par '{placeholder_email}' pour permettre la future contrainte unique. "
                f"Le compte '{comptes[0].username}' (id={comptes[0].id}) garde l'email d'origine."
            )
            compte.email = placeholder_email
            compte.save(update_fields=['email'])


def reverse_noop(apps, schema_editor):
    # Pas de retour en arrière possible (on ne peut pas deviner les emails
    # d'origine qui ont été modifiés) — migration de données non réversible.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('service', '0011_prestataireportfolio_serviceimage'),
    ]

    operations = [
        migrations.RunPython(fix_duplicate_and_blank_emails, reverse_noop),
    ]