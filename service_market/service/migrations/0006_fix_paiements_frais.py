from django.db import migrations


def recalculer_frais_paiements(apps, schema_editor):
    """
    Recalcule montant_prestataire et montant_frais pour tous les paiements
    existants qui ont montant_frais = 0 mais montant_total > 0.
    Les 3% sont déduits du montant total (prix fixé par le prestataire).
    Le client paie le montant_total, le prestataire reçoit 97%.
    """
    Paiement = apps.get_model('service', 'Paiement')
    updated = 0
    for p in Paiement.objects.filter(montant_frais=0, montant_total__gt=0):
        total = float(p.montant_total)
        p.montant_frais = round(total * 0.03, 2)
        p.montant_prestataire = round(total - p.montant_frais, 2)
        p.save(update_fields=['montant_frais', 'montant_prestataire'])
        updated += 1
    print(f"  → {updated} paiements mis à jour avec les frais 3%")


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('service', '0005_remove_pointsfidelite_prestataire_and_more'),
    ]

    operations = [
        migrations.RunPython(recalculer_frais_paiements, noop),
    ]
