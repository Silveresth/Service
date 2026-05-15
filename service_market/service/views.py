from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Sum
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import F, Sum, Count

from .models import Compte, Client, Prestataire, Service, Reservation, Paiement, Evaluation, Categorie, Atelier, Message, Notification
from .serializers import (
    CompteSerializer, CompteUpdateSerializer, RegisterClientSerializer, RegisterPrestataireSerializer,
    ServiceSerializer, ReservationSerializer, PaiementSerializer,
    EvaluationSerializer, CategorieSerializer, AtelierSerializer, PrestataireSerializer,
    MessageSerializer, NotificationSerializer
)

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from math import radians, sin, cos, sqrt, atan2
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import uuid
import json
import requests
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.http import JsonResponse


# ── Helper: Envoyer notification WebSocket ──────────────────────
import logging
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
                'created_at': str(__import__('datetime').datetime.now()),
            }
        )
    except Exception as e:
        logger.error(f"Notification WS failed for user {user_id}: {e}")


def create_notification(user, message, notif_type='systeme'):
    notif = Notification.objects.create(user=user, type=notif_type, message=message)
    send_notification_ws(user.id, message, notif_type)
    return notif


# ── Auth ─────────────────────────────────────────────────────────
class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        user = authenticate(
            username=request.data.get('username'),
            password=request.data.get('password')
        )
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
                'user':    CompteSerializer(user).data
            })
        return Response({'error': 'Identifiants invalides'}, status=400)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        return Response(CompteSerializer(request.user).data)

    @action(detail=False, methods=['post'])
    def register_client(self, request):
        serializer = RegisterClientSerializer(data=request.data)
        if serializer.is_valid():
            compte = serializer.save()
            return Response(CompteSerializer(compte).data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'])
    def register_prestataire(self, request):
        serializer = RegisterPrestataireSerializer(data=request.data)
        if serializer.is_valid():
            compte = serializer.save()
            return Response(CompteSerializer(compte).data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'])
    def register(self, request):
        type_compte = request.data.get('type_compte', 'client')
        if type_compte == 'prestataire':
            return self.register_prestataire(request)
        return self.register_client(request)


# ── Compte ───────────────────────────────────────────────────────
class CompteViewSet(viewsets.ModelViewSet):
    queryset = Compte.objects.all()
    serializer_class = CompteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return CompteUpdateSerializer
        return CompteSerializer

    def get_object(self):
        pk = self.kwargs.get('pk')
        if pk == 'me':
            return self.request.user
        return super().get_object()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticatedOrReadOnly()]
        return [permissions.IsAuthenticated()]


# ── Categorie ────────────────────────────────────────────────────
class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


# ── Service ──────────────────────────────────────────────────────
class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Service.objects.select_related('categorie').all()
        q = self.request.query_params.get('search')
        if q:
            qs = qs.filter(nom__icontains=q) | qs.filter(description__icontains=q)
        return qs


    def perform_create(self, serializer):
        if self.request.user.type_compte != 'prestataire':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seuls les prestataires peuvent créer des services.")
        
        try:
            prestataire = Prestataire.objects.get(user=self.request.user)
        except Prestataire.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Profil prestataire introuvable. Contactez le support.")
        
        serializer.save(prestataire=prestataire)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.prestataire.user != request.user and not request.user.is_staff:
            return Response({'error': 'Vous ne pouvez modifier que vos propres services'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.prestataire.user != request.user and not request.user.is_staff:
            return Response({'error': 'Vous ne pouvez supprimer que vos propres services'}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def mes_services(self, request):
        try:
            prestataire = Prestataire.objects.get(user=request.user)
            services = Service.objects.filter(prestataire=prestataire)
            return Response(ServiceSerializer(services, many=True).data)
        except Prestataire.DoesNotExist:
            return Response({'error': "Vous n'êtes pas prestataire"}, status=403)


# ── Prestataire ──────────────────────────────────────────────────
class PrestataireViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Prestataire.objects.all()
    serializer_class = PrestataireSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def stats(self, request):
        """Prestataire analytics dashboard stats"""
        try:
            prestataire, created = Prestataire.objects.select_related('user').get_or_create(user=request.user)
            if created:
                logger.info(f"Created missing Prestataire profile for user {request.user.username}")
        except Exception as e:
            logger.error(f"Prestataire profile error for {request.user.username}: {e}")
            return Response({'error': 'Profil prestataire non trouvé'}, status=404)
        
        from django.db.models import Count, Avg, Q, Sum
        from django.db.models.functions import TruncMonth
        from .serializers import PrestataireStatsSerializer
        
        # Total revenue (confirmed paiements)
        total_revenue = Paiement.objects.filter(
            reservation__service__prestataire=prestataire,
            statut='confirme'
        ).aggregate(revenue=Sum('montant_prestataire'))['revenue'] or 0
        
        # Reservations
        total_reservations = Reservation.objects.filter(service__prestataire=prestataire).count()
        confirmed_reservations = Reservation.objects.filter(
            service__prestataire=prestataire,
            statut__in=['confirmee', 'terminee']
        ).count()
        acceptance_rate = (confirmed_reservations / total_reservations * 100) if total_reservations else 0
        
        # Notes
        avg_note = Evaluation.objects.filter(
            reservation__service__prestataire=prestataire
        ).aggregate(avg=Avg('note'))['avg']
        nb_notes = Evaluation.objects.filter(
            reservation__service__prestataire=prestataire
        ).count()
        
        # Services count
        services_count = Service.objects.filter(prestataire=prestataire).count()
        
        # Ateliers count
        ateliers_count = Atelier.objects.filter(prestataire=prestataire).count()
        
        # Category avg revenue (competitor benchmark)
        prestataire_category = Service.objects.filter(prestataire=prestataire).first()
        category_avg_revenue = 0
        if prestataire_category:
            category_avg_revenue = Paiement.objects.filter(
                reservation__service__categorie=prestataire_category.categorie,
                statut='confirme'
            ).aggregate(avg=Avg('montant_prestataire'))['avg'] or 0
        
        # Monthly revenue (last 6 months) — toujours 6 mois glissants avec labels
        from datetime import date as _date
        try:
            from dateutil.relativedelta import relativedelta as _rd
        except ImportError:
            import subprocess, sys
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'python-dateutil', '--break-system-packages', '-q'])
            from dateutil.relativedelta import relativedelta as _rd

        _today = _date.today()
        _MOIS_FR = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']

        # Récupérer tous les paiements avec leur mois
        _raw = Paiement.objects.filter(
            reservation__service__prestataire=prestataire,
            statut='confirme'
        ).annotate(month=TruncMonth('date_paiement')) \
         .values('month') \
         .annotate(rev=Sum('montant_prestataire'))

        _map = {}
        for _row in _raw:
            if _row['month']:
                _map[(_row['month'].year, _row['month'].month)] = float(_row['rev'] or 0)

        revenue_monthly = []
        monthly_labels = []
        for _i in range(5, -1, -1):
            _d = _today - _rd(months=_i)
            revenue_monthly.append(_map.get((_d.year, _d.month), 0.0))
            monthly_labels.append(_MOIS_FR[_d.month - 1])

        # Top 3 services — calcul du CA par service
        # Modèle:
        # - Reservation.service => Service (related_name='reservations')
        # - Reservation.paiement => Paiement (OneToOneField related_name='reservation_liee')
        # Donc: Service -> reservations -> paiement (via reservation_liee) -> montant_prestataire
        top_services = list(
            Service.objects.filter(prestataire=prestataire).annotate(
                revenue=Sum(
                    'reservations__paiement__montant_prestataire',
                    filter=Q(reservations__paiement__statut='confirme')
                )
            ).order_by('-revenue')[:3].values('nom', 'revenue')
        )
        top_services = [{'nom': s['nom'], 'revenue': float(s['revenue'] or 0)} for s in top_services]

        
        data = {
            'total_revenue': total_revenue,
            'total_reservations': total_reservations,
            'acceptance_rate': round(acceptance_rate, 1),
            'avg_note': round(float(avg_note or 0), 1) if avg_note else None,
            'nb_notes': nb_notes,
            'services_count': services_count,
            'ateliers_count': ateliers_count,
            'category_avg_revenue': category_avg_revenue,
            'revenue_monthly': revenue_monthly,
            'monthly_labels': monthly_labels,
            'top_services': top_services
        }
        
        try:
            serializer = PrestataireStatsSerializer(data)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Stats serializer error: {e}")
            return Response(data, status=200)  # Return raw data if serializer fails


# ── Reservation ──────────────────────────────────────────────────
class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.type_compte == 'prestataire':
            prestataire = Prestataire.objects.select_related('user').get(user=user)
            return Reservation.objects.filter(
                service__prestataire=prestataire
            ).select_related('service__prestataire__user', 'client__user', 'paiement').prefetch_related('messages')
        try:
            client = Client.objects.select_related('user').get(user=user)
            return Reservation.objects.filter(
                client=client
            ).select_related('service__prestataire__user', 'client__user', 'paiement').prefetch_related('messages', 'service__prestataire__services')
        except Client.DoesNotExist:
            return Reservation.objects.none()

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        obj = super(ReservationViewSet, self).get_object()
        user = self.request.user
        # Ownership check
        is_client_owner = hasattr(user, 'client_profile') and obj.client.user == user
        is_prestataire_owner = hasattr(user, 'prestataire_profile') and obj.service.prestataire.user == user
        if not (is_client_owner or is_prestataire_owner or user.is_staff):
            return Response({'error': 'Accès refusé à cette réservation'}, status=403)
        return obj




    def perform_create(self, serializer):
        client, created = Client.objects.get_or_create(user=self.request.user)
        if created:
            logger.info(f"Created missing Client profile for user {self.request.user.username}")
        serializer.save(client=client)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_data = request.data.copy()
        new_statut = new_data.pop('statut', None)
        is_status_only = not new_data  # Only statut change if no other fields

        user = self.request.user
        is_client_owner = hasattr(user, 'client_profile') and instance.client.user == user
        is_prestataire_owner = hasattr(user, 'prestataire_profile') and instance.service.prestataire.user == user

        if user.is_staff:
            # Staff can do anything
            if new_statut:
                instance.statut = new_statut
                instance.save()
                return Response(ReservationSerializer(instance).data)
            return super().update(request, *args, **kwargs)

        if not (is_client_owner or is_prestataire_owner):
            return Response({'error': 'Permission refusée'}, status=403)

        # Status transitions
        if new_statut:
            if is_client_owner:
                if instance.statut in ['en_attente', 'en_attente_paiement'] and new_statut == 'annulee':
                    instance.statut = 'annulee'
                    instance.save()
                    create_notification(
                        instance.service.prestataire.user,
                        f"Le client {user.username} a annulé la réservation '{instance.service.nom}'.",
                        'reservation'
                    )
                    return Response(ReservationSerializer(instance).data)
                elif instance.statut == 'confirmee' and new_statut == 'terminee':
                    instance.statut = 'terminee'
                    instance.save()
                    create_notification(
                        instance.service.prestataire.user,
                        f"Le client {user.username} a marqué la réservation '{instance.service.nom}' comme terminée.",
                        'reservation'
                    )
                    return Response(ReservationSerializer(instance).data)
                else:
                    return Response({'error': "Transition de statut non autorisée pour les clients"}, status=403)

            elif is_prestataire_owner:
                if instance.statut == 'en_attente' and new_statut == 'en_attente_paiement':
                    instance.statut = 'en_attente_paiement'
                    instance.confirmation = True
                    instance.save()
                    create_notification(
                        instance.client.user,
                        f"Votre réservation pour '{instance.service.nom}' a été confirmée par le prestataire. Procédez au paiement.",
                        'reservation'
                    )
                    return Response(ReservationSerializer(instance).data)
                elif new_statut == 'annulee':
                    instance.statut = 'annulee'
                    instance.save()
                    create_notification(
                        instance.client.user,
                        f"Votre réservation pour '{instance.service.nom}' a été refusée par le prestataire.",
                        'reservation'
                    )
                    return Response(ReservationSerializer(instance).data)
                else:
                    return Response({'error': "Transition de statut non autorisée pour les prestataires"}, status=403)

        # Non-status updates (rare) - only if owner
        if is_status_only:
            return Response({'error': 'Seuls les changements de statut sont autorisés via cette API'}, status=400)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        is_owner_client = False
        try:
            client = Client.objects.get(user=request.user)
            is_owner_client = instance.client == client
        except Client.DoesNotExist:
            pass
        is_owner_prestataire = hasattr(request.user, 'prestataire') and instance.service.prestataire.user == request.user
        if not (is_owner_client or is_owner_prestataire or request.user.is_staff):
            return Response({'error': 'Vous ne pouvez pas supprimer cette réservation'}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reserver(self, request):
        """Créer une réservation (étape 1: date, lieu, notes)"""
        service_id = request.data.get('service_id')
        date_debut = request.data.get('date_debut')
        lieu = request.data.get('lieu', '')
        notes = request.data.get('notes', '')

        service = get_object_or_404(Service, id=service_id)

        client, created = Client.objects.get_or_create(user=request.user)
        if created:
            logger.info(f"Created missing Client profile for user {request.user.username}")

        reservation = Reservation.objects.create(
            service=service,
            client=client,
            montant=float(service.prix),
            statut='en_attente',
            date_debut=date_debut or None,
            lieu=lieu,
            notes=notes,
        )

        # Notifier le prestataire
        create_notification(
            service.prestataire.user,
            f"Nouvelle réservation de '{service.nom}' par {client.user.username}. Confirmez-la dans vos réservations.",
            'reservation'
        )

        return Response({
            'id': reservation.id,
            'service': service.nom,
            'montant': reservation.montant,
            'statut': reservation.statut,
            'date_debut': reservation.date_debut,
            'lieu': reservation.lieu,
            'message': 'Réservation créée avec succès — en attente de confirmation du prestataire'
        }, status=201)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticated])
    def messages(self, request, pk=None):
        """GET: liste des messages d'une réservation. POST: envoyer un message."""
        reservation = self.get_object()

        # Vérifier que l'utilisateur est client ou prestataire de cette réservation
        is_client = False
        try:
            client = Client.objects.get(user=request.user)
            is_client = reservation.client == client
        except Client.DoesNotExist:
            pass
        is_prestataire = hasattr(request.user, 'prestataire') and reservation.service.prestataire.user == request.user

        if not (is_client or is_prestataire or request.user.is_staff):
            return Response({'error': 'Accès refusé'}, status=403)

        # Chat accessible uniquement si réservation confirmée
        if reservation.statut != 'confirmee':
            return Response({'error': 'Le chat n\'est disponible que pour les réservations confirmées'}, status=403)

        if request.method == 'GET':
            msgs = Message.objects.filter(reservation=reservation).select_related('sender')
            serializer = MessageSerializer(msgs, many=True)
            return Response(serializer.data)

        # POST
        contenu = request.data.get('contenu', '')
        if not contenu.strip():
            return Response({'error': 'Message vide'}, status=400)

        msg = Message.objects.create(
            reservation=reservation,
            sender=request.user,
            contenu=contenu
        )
        return Response(MessageSerializer(msg).data, status=201)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def evaluer(self, request, pk=None):
        """Soumettre une évaluation pour une réservation"""
        reservation = self.get_object()

        client, created = Client.objects.get_or_create(user=request.user)
        if created:
            logger.info(f"Created missing Client profile for {request.user.username} in evaluer")

        if reservation.client != client:
            return Response({'error': 'Vous ne pouvez pas évaluer cette réservation'}, status=403)

        if reservation.statut not in ['confirmee', 'terminee']:
            return Response({'error': 'Vous ne pouvez évaluer que les réservations confirmées ou terminées'}, status=400)

        if reservation.evaluation:
            return Response({'error': 'Vous avez déjà évalué ce service'}, status=400)

        note = request.data.get('note')
        commentaire = request.data.get('commentaire', '')

        if not note or int(note) not in range(1, 6):
            return Response({'error': 'Note invalide (1 à 5)'}, status=400)

        evaluation = Evaluation.objects.create(
            note=int(note),
            commentaire=commentaire,
        )
        reservation.evaluation = evaluation
        reservation.statut = 'terminee'
        reservation.save()
        return Response({
            'message': 'Évaluation créée', 
            'note': int(note),
            'evaluation_id': evaluation.id
        }, status=201)


# ── Notification ─────────────────────────────────────────────────
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def lire_tout(self, request):
        self.get_queryset().update(lue=True)
        return Response({'ok': True})


# ── Atelier ──────────────────────────────────────────────────────
class AtelierViewSet(viewsets.ModelViewSet):
    serializer_class = AtelierSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Atelier.objects.filter(est_actif=True)

    def perform_create(self, serializer):
        prestataire, created = Prestataire.objects.get_or_create(user=self.request.user)
        if created:
            logger.info(f"Created missing Prestataire profile for {self.request.user.username} in Atelier")
        serializer.save(prestataire=prestataire)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.prestataire.user != request.user and not request.user.is_staff:
            return Response({'error': 'Vous ne pouvez modifier que vos propres ateliers'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.prestataire.user != request.user and not request.user.is_staff:
            return Response({'error': 'Vous ne pouvez supprimer que vos propres ateliers'}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def mes_ateliers(self, request):
        prestataire, created = Prestataire.objects.get_or_create(user=request.user)
        if created:
            logger.info(f"Created missing Prestataire profile for {request.user.username} in mes_ateliers")
        ateliers = Atelier.objects.filter(prestataire=prestataire)
        return Response(AtelierSerializer(ateliers, many=True).data)


# ── Evaluation ──────────────────────────────────────────────────
class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        """
        GET /evaluations/ → toutes les évaluations publiques (avec filtre optionnel ?service=<id>)
        Auth: comportement identique, mais on peut aussi filtrer les propres évaluations
        """
        qs = Evaluation.objects.all()

        # Filtre optionnel par service
        service_id = self.request.query_params.get('service')
        if service_id:
            qs = qs.filter(reservation__service_id=service_id)

        return qs

    def perform_create(self, serializer):
        raise PermissionError("Utilisez /reservations/{id}/evaluer/")

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            client = Client.objects.get(user=request.user)
            if instance.reservation.client != client:
                return Response({'error': 'Vous ne pouvez pas modifier cette évaluation'}, status=403)
        except Client.DoesNotExist:
            return Response({'error': 'Seul un client peut modifier une évaluation'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            client = Client.objects.get(user=request.user)
            if instance.reservation.client != client and not request.user.is_staff:
                return Response({'error': 'Vous ne pouvez pas supprimer cette évaluation'}, status=403)
        except Client.DoesNotExist:
            if not request.user.is_staff:
                return Response({'error': 'Seul un client peut supprimer une évaluation'}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def mes_evaluations(self, request):
        evaluations = self.get_queryset()
        serializer = self.get_serializer(evaluations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def service_evaluations(self, request):
        prestataire, created = Prestataire.objects.get_or_create(user=request.user)
        if created:
            logger.info(f"Created missing Prestataire profile for {request.user.username} in service_evaluations")
        evaluations = Evaluation.objects.filter(
            reservation__service__prestataire=prestataire
        ).prefetch_related('reservation__service')
        serializer = self.get_serializer(evaluations, many=True)
        return Response(serializer.data)


# ── Smart Matching IA ──────────────────────────────────────────────────
class SmartMatchViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def haversine_distance(self, lat1, lon1, lat2, lon2):
        """Distance en km entre 2 points GPS"""
        R = 6371  # Rayon Terre km
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return R * c

    @action(detail=False, methods=['post'])
    def match(self, request):
        data = request.data
        client_lat = data.get('lat', 6.125)
        client_lon = data.get('lon', 1.232)
        budget_max = data.get('budget_max', 20000)
        categories = data.get('categories', [])

        # Nouveaux paramètres côté frontend
        distance_max = data.get('distance_max', 20.0)
        try:
            distance_max = float(distance_max)
        except Exception:
            distance_max = 20.0

        mieux_note = bool(data.get('mieux_note', False))

        # Récupérer ateliers actifs pour géoloc
        ateliers = Atelier.objects.filter(est_actif=True).select_related('prestataire__user', 'prestataire')
        services = Service.objects.filter(disponibilite=True).select_related('prestataire', 'categorie')

        # Robustesse catégories: normalisation trim/lower
        categories_norm = [
            (c or '').strip().lower()
            for c in (categories or [])
            if (c or '').strip()
        ]

        # score final stable (0..1) par service
        best_by_service = {}  # service_id -> {score, distance}

        # Petit debug (optionnel)
        debug = bool(data.get('debug', False) or data.get('debug_smartmatch', False))
        debug_used_filters = {
            'budget_max': budget_max,
            'categories_raw': categories,
            'categories_norm': categories_norm,
            'client_lat': client_lat,
            'client_lon': client_lon,
        }
        debug_breakdown = []  # garder juste les 10 premiers services les plus pertinents

        for atelier in ateliers:

            prestataire = atelier.prestataire
            distance_km = float(
                self.haversine_distance(
                    client_lat, client_lon,
                    float(atelier.latitude), float(atelier.longitude)
                )
            )

            if distance_km <= 0:
                distance_km = 0.01
            if distance_km > distance_max:
                continue

            # Score distance: 1 proche -> 0 à distance_max km
            distance_score = max(0.0, 1.0 - (distance_km / (distance_max or 1.0)))

            prest_services = services.filter(prestataire=prestataire)
            for service in prest_services:
                # Prix (budget_max)
                # - si service.prix > budget_max => on pénalise fortement (et on évite de les laisser dominer)
                try:
                    budget = float(budget_max or 1)
                except Exception:
                    budget = 1.0

                service_prix = float(service.prix or 0)

                if budget_max is not None and float(service_prix) > float(budget):
                    # Prix hors budget => mal classé mais pas forcément exclu
                    # (sinon on risque de retourner trop peu de résultats)
                    prix_norm = 0.05
                else:
                    prix_norm = min(service_prix / (budget or 1.0), 1.0)


                # Note (0..5) calculée sur les évaluations du service
                avg = Evaluation.objects.filter(reservation__service=service).aggregate(_avg=Sum('note'))['_avg']
                nb = Evaluation.objects.filter(reservation__service=service).count()

                # Fallback: éviter une valeur fixe (3.8) qui rend trop de services "identiques"
                if nb:
                    note_avg = float(avg) / float(nb)
                else:
                    global_avg = Evaluation.objects.aggregate(_ga=Sum('note'))['_ga']
                    global_nb = Evaluation.objects.count()
                    note_avg = (float(global_avg) / float(global_nb)) if global_nb else 3.5

                note_score = max(0.0, min(note_avg / 5.0, 1.0))

                # Catégorie
                service_cat_norm = ((service.categorie.nom if service.categorie else '') or '').strip().lower()

                # categories_norm vient du frontend et est basé sur le nom.
                # Donc: on compare via le nom normalisé (et on ne dépend pas d'un id).
                if categories_norm:
                    cat_match = 1.0 if service_cat_norm in categories_norm else 0.0
                else:
                    # Aucune catégorie: on réduit l'impact de cat.
                    cat_match = 0.25

                # Prix_score: prix faible => mieux
                prix_score = prix_norm

                # Pondération:
                # - catégories : beaucoup plus déterminant
                # - mieux_note : on boost le poids du score note
                cat_weight = 0.35 if categories_norm else 0.10

                distance_w = 0.40
                note_w = 0.25
                prix_w = 0.25

                if mieux_note:
                    note_w = 0.45
                    distance_w = 0.30
                    prix_w = 0.15

                other_weight_sum = 1.0 - cat_weight
                base_sum = (distance_w + note_w + prix_w) or 1.0
                other_scale = other_weight_sum / base_sum

                final_score = (
                    distance_w * distance_score * other_scale +
                    note_w      * note_score      * other_scale +
                    prix_w      * prix_score      * other_scale +
                    cat_weight  * cat_match
                )





                current = best_by_service.get(service.id)
                if current is None or final_score > current['score']:
                    best_by_service[service.id] = {
                        'score': final_score,
                        'distance': distance_km,
                    }

        if not best_by_service:
            return Response({'top_matches': [], 'message': 'Aucun prestataire trouvé à proximité'})

        sorted_services_full = sorted(best_by_service.items(), key=lambda kv: kv[1]['score'], reverse=True)
        sorted_services = sorted_services_full[:3]


        service_ids = [sid for sid, _ in sorted_services]
        service_map = {
            s.id: s
            for s in Service.objects.filter(id__in=service_ids)
            .select_related('prestataire', 'prestataire__user', 'categorie')
        }

        top_matches = []
        for sid, info in sorted_services:
            service = service_map.get(sid)
            if not service:
                continue

            top_matches.append({
                'service_id': service.id,
                'nom': service.nom,
                'prestataire': (
                    f"{service.prestataire.user.first_name} {service.prestataire.user.last_name}".strip()
                    or service.prestataire.user.username
                ),
                'prix': float(service.prix),
                'similarity': float(info['score']),
                'distance': float(info['distance']),
            })

        # Debug: aider à vérifier que categories/budget impactent bien
        if debug:
            top_services_debug = []
            for sid, info in sorted_services:
                svc = service_map.get(sid)
                if not svc:
                    continue
                top_services_debug.append({
                    'service_id': sid,
                    'service_nom': svc.nom,
                    'categorie': (svc.categorie.nom if svc.categorie else None),
                    'prix': float(svc.prix),
                    'similarity': float(info['score']),
                    'distance_km': float(info['distance']),
                })

            return Response({
                'top_matches': top_matches,
                'debug': {
                    'filters': debug_used_filters,
                    'top_services': top_services_debug,
                }
            })

        return Response({'top_matches': top_matches})


# ── Admin ─────────────────────────────────────────────────────────
class AdminViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        try:
            return Response({
                'total_comptes':      Compte.objects.count(),
                'total_services':     Service.objects.count(),
                'total_reservations': Reservation.objects.count(),
                'total_prestataires': Prestataire.objects.count(),
                'services': ServiceSerializer(
                    Service.objects.select_related('categorie').all()[:20],
                    many=True
                ).data,
                'comptes': CompteSerializer(
                    Compte.objects.order_by('-date_joined')[:20],
                    many=True
                ).data,
            })
        except Exception as e:
            logger.error(f"Admin stats error: {str(e)}")
            return Response({'error': 'Erreur stats', 'detail': str(e)}, status=500)

    # ── Admin: Tous les services (CRUD complet) ─
    @action(detail=False, methods=['get'], url_path='all_services')
    def all_services(self, request):
        """Retourne TOUS les services (admin only)"""
        try:
            logger.info(f"Admin all_services called by user {request.user.username if request.user.is_authenticated else 'anonymous'}")
            qs = Service.objects.select_related('categorie').all()
            serializer = ServiceSerializer(qs, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in admin all_services: {str(e)}", exc_info=True)
            return Response({'error': 'Erreur serveur', 'detail': str(e)}, status=500)

    @action(detail=False, methods=['delete'], url_path='delete-service')
    def delete_service(self, request):
        """Supprimer un service (admin only)"""
        service_id = request.data.get('id') or request.query_params.get('id')
        try:
            service = Service.objects.get(pk=service_id)
            service.delete()
            return Response({'ok': True, 'message': 'Service supprimé'})
        except Service.DoesNotExist:
            return Response({'error': 'Service introuvable'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    # ── Admin: Toutes les réservations (CRUD complet) ─
    @action(detail=False, methods=['get'], url_path='all_reservations')
    def all_reservations(self, request):
        """Retourne TOUTES les réservations (admin only)"""
        qs = Reservation.objects.select_related(
            'service__prestataire__user', 'client__user', 'paiement'
        ).prefetch_related('messages').all()
        return Response(ReservationSerializer(qs, many=True).data)

    @action(detail=True, methods=['patch'])
    def update_reservation(self, request, pk=None):
        """Modifier réservation (admin only)"""
        try:
            reservation = Reservation.objects.get(pk=pk)
            serializer = ReservationSerializer(reservation, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Reservation.DoesNotExist:
            return Response({'error': 'Réservation introuvable'}, status=404)

    @action(detail=False, methods=['delete'], url_path='delete-reservation')
    def delete_reservation(self, request):
        """Supprimer une réservation (admin only)"""
        reservation_id = request.data.get('id') or request.query_params.get('id')
        try:
            reservation = Reservation.objects.get(pk=reservation_id)
            reservation.delete()
            return Response({'ok': True, 'message': 'Réservation supprimée'})
        except Reservation.DoesNotExist:
            return Response({'error': 'Réservation introuvable'}, status=404)

    # ── Admin: Tous les ateliers (CRUD complet) ─
    @action(detail=False, methods=['get'], url_path='all_ateliers')
    def all_ateliers(self, request):
        """Retourne TOUS les ateliers (admin only, même inactifs)"""
        qs = Atelier.objects.select_related('prestataire__user').all()
        return Response(AtelierSerializer(qs, many=True).data)

    @action(detail=True, methods=['patch'])
    def update_atelier(self, request, pk=None):
        """Modifier atelier (admin only)"""
        try:
            atelier = Atelier.objects.get(pk=pk)
            serializer = AtelierSerializer(atelier, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Atelier.DoesNotExist:
            return Response({'error': 'Atelier introuvable'}, status=404)

    @action(detail=False, methods=['delete'], url_path='delete-atelier')
    def delete_atelier(self, request):
        """Supprimer un atelier (admin only)"""
        atelier_id = request.data.get('id') or request.query_params.get('id')
        try:
            atelier = Atelier.objects.get(pk=atelier_id)
            atelier.delete()
            return Response({'ok': True, 'message': 'Atelier supprimé'})
        except Atelier.DoesNotExist:
            return Response({'error': 'Atelier introuvable'}, status=404)

    # ── Admin: Toutes les évaluations (CRUD complet) ─
    @action(detail=False, methods=['get'], url_path='all_evaluations')
    def all_evaluations(self, request):
        """Retourne TOUTES les évaluations (admin only)"""
        evaluations = Evaluation.objects.prefetch_related(
            'reservation__service__prestataire__user',
            'reservation__client__user',
        ).all()
        serializer = EvaluationSerializer(evaluations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='all_paiements')
    def all_paiements(self, request):
        """Retourne TOUS les paiements (admin only)"""
        from .serializers import PaiementAdminSerializer
        paiements = Paiement.objects.select_related(
            'reservation',
            'reservation__service',
            'reservation__client__user',
            'reservation__service__prestataire__user',
        ).all().order_by('-date_paiement')
        serializer = PaiementAdminSerializer(paiements, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'], url_path='delete-evaluation')
    def delete_evaluation(self, request):
        """Supprimer une évaluation (admin only)"""
        evaluation_id = request.data.get('id') or request.query_params.get('id')
        try:
            evaluation = Evaluation.objects.get(pk=evaluation_id)
            evaluation.delete()
            return Response({'ok': True, 'message': 'Évaluation supprimée'})
        except Evaluation.DoesNotExist:
            return Response({'error': 'Évaluation introuvable'}, status=404)

    # ── Admin: Toutes les catégories (CRUD complet) ─
    @action(detail=False, methods=['get'], url_path='all_categories')
    def all_categories(self, request):
        """Retourne TOUTES les catégories (admin only)"""
        qs = Categorie.objects.all()
        return Response(CategorieSerializer(qs, many=True).data)

    @action(detail=False, methods=['post'])
    def create_category(self, request):
        """Créer une catégorie (admin only)"""
        serializer = CategorieSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['patch'])
    def update_category(self, request, pk=None):
        """Modifier une catégorie (admin only)"""
        try:
            categorie = Categorie.objects.get(pk=pk)
            serializer = CategorieSerializer(categorie, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Categorie.DoesNotExist:
            return Response({'error': 'Catégorie introuvable'}, status=404)

    @action(detail=True, methods=['delete'], url_path='delete-category')
    def delete_category(self, request, pk=None):
        """Supprimer une catégorie (admin only)"""
        try:
            categorie = Categorie.objects.get(pk=pk)
            categorie.delete()
            return Response({'ok': True, 'message': 'Catégorie supprimée'})
        except Categorie.DoesNotExist:
            return Response({'error': 'Catégorie introuvable'}, status=404)

    # ── Admin: Tous les comptes utilisateurs ─
    @action(detail=False, methods=['get'], url_path='all_comptes')
    def all_comptes(self, request):
        """Retourne TOUS les comptes (admin only)"""
        qs = Compte.objects.order_by('-date_joined').all()
        return Response(CompteSerializer(qs, many=True).data)

    @action(detail=False, methods=['delete'], url_path='delete-user')
    def delete_user(self, request):
        """Supprimer un compte utilisateur (admin only)"""
        user_id = request.data.get('id') or request.query_params.get('id')
        if not user_id:
            return Response({'error': 'ID utilisateur requis'}, status=400)
        try:
            compte = Compte.objects.get(pk=user_id)
            # Ne pas permettre la suppression d'un admin
            if compte.is_superuser or compte.is_staff:
                return Response({'error': 'Impossible de supprimer un compte administrateur'}, status=403)
            username = compte.username
            compte.delete()
            return Response({'ok': True, 'message': f'Compte "{username}" supprimé'})
        except Compte.DoesNotExist:
            return Response({'error': 'Compte introuvable'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initier_paiement(request):
    service_id      = request.data.get('service_id')
    reservation_id  = request.data.get('reservation_id')
    phone_number    = request.data.get('phone_number')
    network         = request.data.get('network')
    montant_raw     = request.data.get('montant')
    montant = int(float(montant_raw))
    identifier      = f"SM{uuid.uuid4().hex[:12].upper()}"

    if not reservation_id:
        return Response({"error": "ID de réservation requis"}, status=400)

    try:
        client = Client.objects.get(user=request.user)
    except Client.DoesNotExist:
        return Response({"error": "Vous devez être un client pour payer"}, status=403)

    try:
        reservation = Reservation.objects.select_related('service', 'client__user').get(id=reservation_id, client=client)
    except Reservation.DoesNotExist:
        return Response({"error": "Réservation introuvable"}, status=404)

    if reservation.statut != 'en_attente_paiement':
        return Response({"error": "Cette réservation n'est pas en attente de paiement"}, status=400)

    service_obj = reservation.service
    prix   = float(service_obj.prix)
    # Les 3% sont déduits du montant fixé par le prestataire (pas ajoutés au client)
    frais  = round(prix * 0.03, 2)
    montant_prestataire = round(prix - frais, 2)
    total  = int(prix)  # Le client paie exactement le prix fixé par le prestataire
    reservation.montant = total
    reservation.save()

    # ── MODE SIMULATION (DEBUG) ──────────────────────────────
    if settings.DEBUG:
        paiement = Paiement.objects.create(
            reservation=reservation,
            methode=network.lower() if network else 'flooz',
            montant_total=total,
            montant_prestataire=montant_prestataire,
            montant_frais=frais,
            telephone=phone_number or '',
            transaction_ref=identifier,
            tx_reference_paygate=f'SIM-{identifier}',
            statut='confirme'
        )
        reservation.paiement = paiement
        reservation.statut = 'confirmee'
        reservation.save()

        # Notifications
        create_notification(
            reservation.client.user,
            f"Votre paiement pour '{service_obj.nom}' a été confirmé. Le chat avec le prestataire est maintenant ouvert.",
            'paiement'
        )
        create_notification(
            service_obj.prestataire.user,
            f"Le client {client.user.username} a payé pour '{service_obj.nom}'. Le chat est ouvert.",
            'paiement'
        )

        return Response({
            "tx_reference": f'SIM-{identifier}',
            "identifier":   identifier,
            "reservation_id": reservation.id,
            "simulation":   True,
            "message":      "Paiement simulé avec succès — réservation confirmée",
        })
    # ────────────────────────────────────────────────────────

    # Appel PayGate
    try:
        pg_response = requests.post(
            "https://paygateglobal.com/api/v1/pay",
            json={
                "token":        settings.PAYGATE_TOKEN,
                "phone_number": phone_number,
                "amount":       int(montant),
                "network":      network,
                "identifier":   identifier,
                "description":  f"Réservation service #{service_id}",
                "callback_url": request.build_absolute_uri(settings.PAYGATE_CALLBACK_PATH),
            },
            timeout=15
        )
        pg_data = pg_response.json()
    except Exception as e:
        return Response({"error": f"Erreur réseau PayGate : {str(e)}"}, status=502)

    if pg_data.get('status') not in [0, '0']:
        return Response({"error": pg_data.get('message', 'Erreur PayGate')}, status=400)

    paiement = Paiement.objects.create(
        reservation=reservation,
        methode=network.lower(),
        montant_total=total,
        montant_prestataire=montant_prestataire,
        montant_frais=frais,
        telephone=phone_number,
        transaction_ref=identifier,
        tx_reference_paygate=pg_data.get('tx_reference', ''),
        statut='pending'
    )
    reservation.paiement = paiement
    reservation.save()

    return Response({
        "tx_reference": pg_data.get('tx_reference'),
        "identifier":   identifier,
        "reservation_id": reservation.id,
    })


@csrf_exempt
def paygate_callback(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON invalide"}, status=400)

    identifier = data.get('identifier')
    statut_pg  = data.get('status')

    try:
        paiement = Paiement.objects.select_related('reservation__client__user', 'reservation__service__prestataire__user').get(
            transaction_ref=identifier
        )
    except Paiement.DoesNotExist:
        return JsonResponse({"error": "Paiement inconnu"}, status=404)

    reservation = paiement.reservation

    if statut_pg in [0, '0', 'success', 'SUCCESS']:
        paiement.statut = 'confirme'
        reservation.statut = 'confirmee'
        reservation.save()

        # Notifications
        create_notification(
            reservation.client.user,
            f"Votre paiement pour '{reservation.service.nom}' a été confirmé. Le chat avec le prestataire est maintenant ouvert.",
            'paiement'
        )
        create_notification(
            reservation.service.prestataire.user,
            f"Le client {reservation.client.user.username} a payé pour '{reservation.service.nom}'. Le chat est ouvert.",
            'paiement'
        )
    else:
        paiement.statut = 'echoue'

    paiement.save()
    return JsonResponse({"ok": True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verifier_paiement(request):
    identifier = request.query_params.get('identifier')
    if not identifier:
        return Response({"error": "Paramètre 'identifier' manquant"}, status=400)

    try:
        paiement = Paiement.objects.get(transaction_ref=identifier)
        return Response({"statut": paiement.statut})
    except Paiement.DoesNotExist:
        return Response({"error": "Paiement introuvable"}, status=404)

# ─────────────────────────────────────────
# FIDÉLITÉ
# ─────────────────────────────────────────
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_points_fidelite(request):
    """Retourne les points et le niveau de fidélité du prestataire connecté."""
    from .models import PointsFidelite, HistoriquePoints
    try:
        prest = request.user.prestataire_profile
    except Exception:
        return Response({'error': 'Non prestataire'}, status=403)

    pf, _ = PointsFidelite.objects.get_or_create(prestataire=prest)
    historique = HistoriquePoints.objects.filter(prestataire=prest)[:10]

    NIVEAUX = {
        'bronze':  {'label': 'Bronze',  'min': 0,  'next': 50,  'color': '#92400e', 'icon': 'bi-award-fill'},
        'or':      {'label': 'Or',      'min': 50, 'next': 100, 'color': '#d97706', 'icon': 'bi-trophy-fill'},
        'platine': {'label': 'Platine', 'min': 100,'next': None,'color': '#6366f1', 'icon': 'bi-gem'},
    }
    niveau_info = NIVEAUX.get(pf.niveau, NIVEAUX['bronze'])

    return Response({
        'points': pf.points,
        'niveau': pf.niveau,
        'niveau_label': niveau_info['label'],
        'niveau_color': niveau_info['color'],
        'niveau_icon': niveau_info['icon'],
        'next_level_points': niveau_info['next'],
        'progress_pct': min(100, round((pf.points / (niveau_info['next'] or pf.points or 1)) * 100)) if niveau_info['next'] else 100,
        'historique': [{'motif': h.motif, 'points': h.points_gagnes, 'date': h.created_at.isoformat()} for h in historique],
    })


def ajouter_points(prestataire, points, motif):
    """Helper pour ajouter des points de fidélité."""
    from .models import PointsFidelite, HistoriquePoints
    pf, _ = PointsFidelite.objects.get_or_create(prestataire=prestataire)
    pf.points += points
    pf.save()
    HistoriquePoints.objects.create(prestataire=prestataire, points_gagnes=points, motif=motif)


# ─────────────────────────────────────────
# RAPPORT PDF ADMIN
# ─────────────────────────────────────────
from django.http import HttpResponse
from django.utils import timezone
import datetime

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rapport_pdf_admin(request):
    """Génère un rapport PDF mensuel pour l'admin."""
    from .models import Reservation, Service, Prestataire, Paiement, Evaluation

    # Vérifier que c'est un admin
    if not (request.user.is_staff or hasattr(request.user, 'admin_profile')):
        return Response({'error': 'Accès réservé aux admins'}, status=403)

    # Période (mois courant ou paramètre)
    now = timezone.now()
    mois = int(request.GET.get('mois', now.month))
    annee = int(request.GET.get('annee', now.year))

    # Données statistiques
    reservations = Reservation.objects.filter(date_res__month=mois, date_res__year=annee)
    nb_reservations = reservations.count()
    nb_confirmees  = reservations.filter(statut='confirmee').count()
    nb_terminees   = reservations.filter(statut='terminee').count()
    nb_annulees    = reservations.filter(statut='annulee').count()

    revenus = Paiement.objects.filter(created_at__month=mois, created_at__year=annee, statut='succes')
    total_revenus = sum(p.montant for p in revenus)

    nb_services      = Service.objects.count()
    nb_prestataires  = Prestataire.objects.count()

    mois_nom = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][mois]

    # ── HTML → PDF avec weasyprint ou reportlab ──
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        import io

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()

        PRIMARY = colors.HexColor('#0284c7')
        DARK    = colors.HexColor('#0c2340')
        LIGHT   = colors.HexColor('#e0f2fe')

        title_style = ParagraphStyle('title', fontSize=22, textColor=DARK, fontName='Helvetica-Bold', spaceAfter=4)
        sub_style   = ParagraphStyle('sub',   fontSize=11, textColor=colors.HexColor('#64748b'), spaceAfter=20)
        h2_style    = ParagraphStyle('h2',    fontSize=14, textColor=PRIMARY, fontName='Helvetica-Bold', spaceBefore=16, spaceAfter=8)

        content = []
        content.append(Paragraph(f"Service Market – Rapport Mensuel", title_style))
        content.append(Paragraph(f"{mois_nom} {annee} · Généré le {now.strftime('%d/%m/%Y à %H:%M')}", sub_style))
        content.append(HRFlowable(width='100%', color=PRIMARY, thickness=2))
        content.append(Spacer(1, 12))

        # Résumé
        content.append(Paragraph("Résumé exécutif", h2_style))
        summary_data = [
            ['Indicateur', 'Valeur'],
            ['Total Réservations',     str(nb_reservations)],
            ['Réservations confirmées', str(nb_confirmees)],
            ['Réservations terminées',  str(nb_terminees)],
            ['Réservations annulées',   str(nb_annulees)],
            ['Revenus encaissés',       f"{total_revenus:,.0f} FCFA"],
            ['Services actifs',         str(nb_services)],
            ['Prestataires inscrits',   str(nb_prestataires)],
        ]
        t = Table(summary_data, colWidths=[10*cm, 6*cm])
        t.setStyle(TableStyle([
            ('BACKGROUND',   (0,0), (-1,0), PRIMARY),
            ('TEXTCOLOR',    (0,0), (-1,0), colors.white),
            ('FONTNAME',     (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE',     (0,0), (-1,-1), 11),
            ('BACKGROUND',   (0,1), (-1,-1), colors.white),
            ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white, LIGHT]),
            ('GRID',         (0,0), (-1,-1), 0.5, colors.HexColor('#bae6fd')),
            ('PADDING',      (0,0), (-1,-1), 8),
            ('ALIGN',        (1,0), (1,-1), 'RIGHT'),
        ]))
        content.append(t)
        content.append(Spacer(1, 20))

        # Top prestataires
        content.append(Paragraph("Top Prestataires du mois", h2_style))
        from django.db.models import Count, Sum
        top_prest = (Reservation.objects.filter(date_res__month=mois, date_res__year=annee)
                     .values('service__prestataire__user__username', 'service__prestataire__user__first_name')
                     .annotate(nb=Count('id'), rev=Sum('montant'))
                     .order_by('-nb')[:5])

        if top_prest:
            prest_data = [['Prestataire','Réservations','Revenus (FCFA)']]
            for p in top_prest:
                name = f"{p['service__prestataire__user__first_name'] or ''} @{p['service__prestataire__user__username']}"
                prest_data.append([name, str(p['nb']), f"{p['rev'] or 0:,.0f}"])
            tp = Table(prest_data, colWidths=[8*cm, 4*cm, 4*cm])
            tp.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), PRIMARY),
                ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
                ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTSIZE',   (0,0), (-1,-1), 10),
                ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white, LIGHT]),
                ('GRID',       (0,0), (-1,-1), 0.5, colors.HexColor('#bae6fd')),
                ('PADDING',    (0,0), (-1,-1), 7),
                ('ALIGN',      (1,0), (-1,-1), 'CENTER'),
            ]))
            content.append(tp)

        content.append(Spacer(1, 30))
        content.append(Paragraph("© Service Market Togo · Rapport confidentiel", ParagraphStyle('footer', fontSize=8, textColor=colors.HexColor('#94a3b8'))))

        doc.build(content)
        buffer.seek(0)

        filename = f"rapport_servicemarket_{annee}_{mois:02d}.pdf"
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    except ImportError:
        # Fallback: JSON si reportlab non installé
        return Response({
            'message': 'reportlab non installé. pip install reportlab',
            'data': {
                'mois': mois_nom, 'annee': annee,
                'nb_reservations': nb_reservations, 'total_revenus': float(total_revenus),
                'nb_services': nb_services, 'nb_prestataires': nb_prestataires,
            }
        })
