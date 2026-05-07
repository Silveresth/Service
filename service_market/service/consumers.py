import json
import logging
logger = logging.getLogger(__name__)


from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.core.exceptions import ObjectDoesNotExist
from .models import Compte, Reservation, Message, Notification


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['reservation_id']
        self.room_group_name = f"chat_{self.room_name}"
        self.user = await self.get_user_from_token()

        if isinstance(self.user, AnonymousUser):
            logger.warning(f"[ChatConsumer] Connexion refusée — token invalide (reservation_id={self.room_name})")
            await self.close()
            return

        # Vérifier que l'utilisateur est le client ou le prestataire de cette réservation
        if not await self.can_access_chat(self.room_name):
            logger.warning(f"[ChatConsumer] Connexion refusée — accès interdit pour {self.user.username} (reservation_id={self.room_name})")
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        logger.info(f"[ChatConsumer] {self.user.username} connecté au chat {self.room_group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')

        if not message.strip():
            return

        # Sauvegarder le message en base
        msg = await self.save_message(self.room_name, self.user.id, message)

        # Diffuser à tous les membres du groupe
        timestamp = msg.date_envoi.isoformat() if msg else None
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': self.user.username,
                'sender_id': self.user.id,
                'timestamp': timestamp,
                'is_me': False,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender': event['sender'],
            'sender_id': event['sender_id'],
            'timestamp': event['timestamp'],
            'is_me': event['sender_id'] == self.user.id,
        }))
        
        # Also send a notification when receiving a chat message (not from self)
        if event['sender_id'] != self.user.id:
            await self.send_chat_notification(
                f"Nouveau message de {event['sender']}"
            )

    async def send_chat_notification(self, message):
        """Send a WebSocket notification to the current user when receiving a chat message"""
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            # Create notification record
            await database_sync_to_async(self._save_notification_record)(self.user.id, message, 'chat')
            
            # Send real-time notification
            channel_layer = get_channel_layer()
            user_group = f"user_{self.user.id}"
            
            async_to_sync(channel_layer.group_send)(
                user_group,
                {
                    'type': 'notification',
                    'message': message,
                    'notif_type': 'chat',
                    'level': 'info',
                }
            )
        except Exception as e:
            logger.exception(f"Chat notification failed for user {self.user.id if hasattr(self, 'user') else 'unknown'}: {e}")


    def _save_notification_record(self, user_id, message, notif_type):
        try:
            from .models import Compte, Notification
            user = Compte.objects.get(id=user_id)
            Notification.objects.create(user=user, type=notif_type, message=message)
        except Exception as e:
            logger.error(f"Notification record save failed: {e}")

    @database_sync_to_async
    def get_user_from_token(self):
        try:
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            for param in query_string.split('&'):
                if param.startswith('token='):
                    token = param.split('=')[1]
                    break
            if token:
                access_token = AccessToken(token)
                return Compte.objects.get(id=access_token['user_id'])
        except (Exception, ObjectDoesNotExist) as e:
            logger.error(f"Token invalid or user not found: {e}")
            return AnonymousUser()

    @database_sync_to_async
    def can_access_chat(self, reservation_id):
        try:
            reservation = Reservation.objects.select_related('client__user', 'service__prestataire__user').get(id=reservation_id)
            # Chat accessible uniquement si la réservation est confirmée
            if reservation.statut != 'confirmee':
                logger.warning(f"[ChatConsumer] Réservation {reservation_id} statut='{reservation.statut}' — chat refusé (doit être 'confirmee')")
                return False
            is_client = reservation.client.user_id == self.user.id
            is_prestataire = reservation.service.prestataire.user_id == self.user.id
            if not (is_client or is_prestataire):
                logger.warning(f"[ChatConsumer] {self.user.username} n'est ni client ni prestataire de la réservation {reservation_id}")
            return is_client or is_prestataire
        except Reservation.DoesNotExist:
            logger.error(f"[ChatConsumer] Réservation {reservation_id} introuvable")
            return False

    @database_sync_to_async
    def save_message(self, reservation_id, user_id, content):
        try:
            reservation = Reservation.objects.get(id=reservation_id)
            user = Compte.objects.get(id=user_id)
            return Message.objects.create(reservation=reservation, sender=user, contenu=content)
        except Exception as e:
            logger.error(f"Save message failed (res {reservation_id}, user {user_id}): {e}")
            return None


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = await self.get_user_from_token()
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return

        self.user_group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    async def receive(self, text_data):
        pass  # Le client n'envoie rien, il reçoit seulement

    async def notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': event.get('message', ''),
            'notif_type': event.get('notif_type', 'systeme'),
            'level': event.get('level', 'info'),
            'created_at': event.get('created_at'),
        }))

    @database_sync_to_async
    def get_user_from_token(self):
        try:
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            for param in query_string.split('&'):
                if param.startswith('token='):
                    token = param.split('=')[1]
                    break
            if token:
                access_token = AccessToken(token)
                return Compte.objects.get(id=access_token['user_id'])
        except (Exception, ObjectDoesNotExist) as e:
            logger.error(f"Token invalid or user not found: {e}")
            return AnonymousUser()
