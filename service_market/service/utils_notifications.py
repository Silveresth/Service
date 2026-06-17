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
    send_notification_ws(user.id, message, notif_type)
    return notif
