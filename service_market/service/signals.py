from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Reservation
from .utils_notifications import create_notification

@receiver(post_save, sender=Reservation)
def notify_new_reservation(sender, instance, created, **kwargs):
    if created:
        # Notifier le prestataire
        prestataire_user = instance.service.prestataire.user
        client_username = instance.client.user.username
        service_nom = instance.service.nom
        
        message = f"Nouvelle réservation de '{service_nom}' par {client_username}. Confirmez-la dans vos réservations."
        create_notification(prestataire_user, message, 'reservation')
