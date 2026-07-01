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

        # Vérifier si le chat est actif (uniquement en statut confirme) pour envoyer un message
        if not await self.can_send_messages(self.room_name):
            return

        # Sauvegarder le message en base et notifier le destinataire
        msg, recipient_id = await self.save_message_and_notify(self.room_name, self.user.id, message)

        if msg:
            timestamp = msg.date_envoi.isoformat()
            # Diffuser à tous les membres du groupe du chat (pour affichage instantané)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': self.user.username,
                    'sender_id': self.user.id,
                    'timestamp': timestamp,
                }
            )

            # Envoyer une notification WebSocket en temps réel au destinataire via son groupe personnel
            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {
                    'type': 'notification',
                    'message': f"Nouveau message de {self.user.username} pour '{msg.reservation.service.nom}'",
                    'notif_type': 'chat',
                    'level': 'info',
                    'created_at': timestamp,
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
            # Chat accessible si la réservation est confirmée, terminée ou annulée (pour l'historique)
            if reservation.statut not in ['confirmee', 'terminee', 'annulee']:
                logger.warning(f"[ChatConsumer] Réservation {reservation_id} statut='{reservation.statut}' — chat refusé")
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
    def can_send_messages(self, reservation_id):
        try:
            reservation = Reservation.objects.get(id=reservation_id)
            return reservation.statut == 'confirmee'
        except Reservation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message_and_notify(self, reservation_id, sender_id, content):
        try:
            from django.db import transaction
            with transaction.atomic():
                reservation = Reservation.objects.select_related('client__user', 'service__prestataire__user').get(id=reservation_id)
                sender = Compte.objects.get(id=sender_id)
                msg = Message.objects.create(reservation=reservation, sender=sender, contenu=content)

                # Déterminer le destinataire
                if reservation.client.user_id == sender_id:
                    recipient = reservation.service.prestataire.user
                else:
                    recipient = reservation.client.user

                # Créer l'enregistrement de notification en base de données pour le destinataire
                Notification.objects.create(
                    user=recipient,
                    type='chat',
                    message=f"Nouveau message de {sender.username} pour '{reservation.service.nom}'"
                )

                return msg, recipient.id
        except Exception as e:
            logger.error(f"Save message and notify failed (res {reservation_id}, sender {sender_id}): {e}")
            return None, None


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
