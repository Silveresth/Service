import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification
import datetime

logger = logging.getLogger(__name__)

def send_notification_ws(user_id, message, notif_type='systeme', level='info'):
    channel_layer = get_channel_layer()
    try:
        async_to_sync(channel_layer.group_send)(
            f"user_{user_id}",
            {
                'type': 'notification',
                'message': message,
                'notif_type': notif_type,
                'level': level,
                'created_at': str(datetime.datetime.now()),
            }
        )
    except Exception as e:
        logger.error(f"Notification WS failed for user {user_id}: {e}")


def create_notification(user, message, notif_type='systeme'):
    notif = Notification.objects.create(user=user, type=notif_type, message=message)
    
    # 1. Dispatch WS notification for active connections
    send_notification_ws(user.id, message, notif_type)
    
    # 2. Dispatch Email alert as fallback for offline notification
    if user.email:
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            subject = f"ServiceMarket - [{notif_type.upper()}] Nouvelle notification"
            body = (
                f"Bonjour {user.first_name or user.username},\n\n"
                f"Vous avez reçu une nouvelle notification sur Service Market :\n"
                f"👉 {message}\n\n"
                f"Pour répondre ou en savoir plus, connectez-vous à la plateforme.\n\n"
                f"L'équipe Service Market"
            )
            send_mail(
                subject,
                body,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True
            )
            logger.info(f"Notification email dispatched successfully to {user.email}")
        except Exception as e:
            logger.error(f"Failed to dispatch notification email to {user.email}: {e}")
            
    return notif
