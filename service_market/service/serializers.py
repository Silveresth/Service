from rest_framework import serializers
from .models import DemandeRetrait
from .models import Compte, Client, Prestataire, Service, Reservation, Paiement, Evaluation, Categorie, Atelier, Message, Notification, ServiceImage, PrestatairePortfolio


# ── Compte (custom user) ──────────────────────────────────────────
class CompteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compte
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'telephone', 'adresse', 'type_compte', 'is_staff', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'is_staff', 'is_active']


class CompteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compte
        fields = ['first_name', 'last_name', 'email', 'telephone', 'adresse']

    def validate_email(self, value):
        qs = Compte.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Un compte existe déjà avec cet email.")
        return value


# ── Auth ──────────────────────────────────────────────────────────
class RegisterClientSerializer(serializers.Serializer):
    username   = serializers.CharField()
    email      = serializers.EmailField()
    first_name = serializers.CharField()
    last_name  = serializers.CharField()
    telephone  = serializers.CharField()
    adresse    = serializers.CharField()
    password   = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if Compte.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def validate_email(self, value):
        if Compte.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un compte existe déjà avec cet email.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        compte = Compte(**validated_data)
        compte.type_compte = 'client'
        compte.set_password(password)
        compte.save()
        Client.objects.create(user=compte)
        return compte


class RegisterPrestataireSerializer(serializers.Serializer):
    username      = serializers.CharField()
    email         = serializers.EmailField()
    first_name    = serializers.CharField()
    last_name     = serializers.CharField()
    telephone     = serializers.CharField()
    adresse       = serializers.CharField()
    password      = serializers.CharField(write_only=True)
    specialite    = serializers.CharField()
    numero_flooz  = serializers.CharField(required=False, allow_blank=True, default='')
    numero_mix    = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_username(self, value):
        if Compte.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def validate_email(self, value):
        if Compte.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un compte existe déjà avec cet email.")
        return value

    def create(self, validated_data):
        password     = validated_data.pop('password')
        specialite   = validated_data.pop('specialite')
        numero_flooz = validated_data.pop('numero_flooz', '')
        numero_mix   = validated_data.pop('numero_mix', '')
        compte = Compte(**validated_data)
        compte.type_compte = 'prestataire'
        compte.set_password(password)
        compte.save()
        Prestataire.objects.create(
            user=compte,
            specialite=specialite,
            numero_flooz=numero_flooz,
            numero_mix=numero_mix
        )
        return compte


# ── Categorie ────────────────────────────────────────────────────
class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'icone']


class PrestatairePortfolioSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PrestatairePortfolio
        fields = ['id', 'image', 'image_url', 'description']

    def get_image_url(self, obj):
        if obj.image:
            url = obj.image.url
            if url.startswith('http'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


# ── Prestataire ──────────────────────────────────────────────────
class PrestataireSerializer(serializers.ModelSerializer):
    user = CompteSerializer(read_only=True)
    photo_url = serializers.SerializerMethodField()
    services_count = serializers.SerializerMethodField()
    note_moyenne = serializers.SerializerMethodField()
    reservations_count = serializers.SerializerMethodField()
    portfolio = PrestatairePortfolioSerializer(many=True, read_only=True)

    class Meta:
        model = Prestataire
        fields = ['id', 'user', 'specialite', 'numero_flooz', 'numero_mix', 'photo', 'photo_url', 'solde',
                  'services_count', 'note_moyenne', 'reservations_count', 'statut_activite', 'portfolio',
                  'type_abonnement', 'date_expiration_abonnement']

    def get_photo_url(self, obj):
        if obj.photo:
            url = obj.photo.url
            if url.startswith('http'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_services_count(self, obj):
        return obj.services.count()

    def get_note_moyenne(self, obj):
        from django.db.models import Avg
        from .models import Evaluation
        res = Evaluation.objects.filter(reservation__service__prestataire=obj).aggregate(Avg('note'))
        return res['note__avg'] if res['note__avg'] else None

    def get_reservations_count(self, obj):
        from .models import Reservation
        return Reservation.objects.filter(service__prestataire=obj).count()


class DemandeRetraitSerializer(serializers.ModelSerializer):
    prestataire_nom = serializers.SerializerMethodField()

    class Meta:
        model = DemandeRetrait
        fields = ['id', 'prestataire', 'prestataire_nom', 'montant', 'methode', 'numero_paiement',
                  'statut', 'date_demande', 'date_validation', 'notes_admin']
        read_only_fields = ['id', 'prestataire', 'date_demande', 'date_validation', 'statut']

    def validate_montant(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant du retrait doit être strictement supérieur à 0.")
        if value < 100:
            raise serializers.ValidationError("Le montant minimum de retrait est de 100 FCFA.")
        return value

    def get_prestataire_nom(self, obj):
        user = obj.prestataire.user
        return user.get_full_name() or user.username


# ── Client ────────────────────────────────────────────────────
class ClientSerializer(serializers.ModelSerializer):
    user = CompteSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Client
        fields = ['user', 'username']


class ServiceImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ServiceImage
        fields = ['id', 'image', 'image_url']

    def get_image_url(self, obj):
        if obj.image:
            url = obj.image.url
            if url.startswith('http'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


# ── Service ──────────────────────────────────────────────────────
class ServiceSerializer(serializers.ModelSerializer):
    # Fournit directement les infos user du prestataire, pour éviter tout soucis de shape côté frontend.
    prestataire = PrestataireSerializer(read_only=True)

    prestataire_id = serializers.IntegerField(source='prestataire.id', read_only=True)
    prestataire_nom = serializers.SerializerMethodField()
    categorie   = CategorieSerializer(read_only=True)

    categorie_id = serializers.PrimaryKeyRelatedField(
        queryset=Categorie.objects.all(), source='categorie',
        write_only=True, required=False, allow_null=True
    )
    # Alias for backward compatibility
    est_actif = serializers.BooleanField(source='disponibilite', read_only=True)
    image_url = serializers.SerializerMethodField()
    model_3d_url = serializers.SerializerMethodField()
    has_ar = serializers.SerializerMethodField()
    note_avg = serializers.SerializerMethodField()
    nb_notes = serializers.SerializerMethodField()
    images = ServiceImageSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'nom', 'description', 'prix', 'disponibilite', 'est_actif',
            'prestataire',
            'prestataire_id', 'prestataire_nom',
            'categorie', 'categorie_id',
            'image', 'image_url', 'model_3d', 'model_3d_url', 'has_ar',
            'note_avg', 'nb_notes', 'images',
        ]


    def get_prestataire_nom(self, obj):
        try:
            user = obj.prestataire.user
            return user.get_full_name() or user.username
        except Exception:
            return None

    def get_model_3d_url(self, obj):
        if obj.model_3d:
            url = obj.model_3d.url
            if url.startswith('http'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_has_ar(self, obj):
        return bool(obj.model_3d)

    def get_image_url(self, obj):
        if obj.image:
            url = obj.image.url
            if url.startswith('http'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_note_avg(self, obj):
        # Compute average rating from evaluations related to this service
        from django.db.models import Avg
        try:
            result = Evaluation.objects.filter(reservation__service=obj).aggregate(Avg('note'))
            return result['note__avg'] if result and result['note__avg'] else None
        except Exception:
            return None

    def get_nb_notes(self, obj):
        # Count evaluations for this service
        try:
            return Evaluation.objects.filter(reservation__service=obj).count()
        except Exception:
            return 0


# ── Paiement ────────────────────────────────────────────────────
class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = ['id', 'methode', 'montant_total', 'montant_prestataire',
                  'montant_frais', 'numero_client', 'numero_prestataire',
                  'numero_admin', 'transaction_ref', 'ussd_prestataire',
                  'ussd_admin', 'statut', 'date_paiement']
        read_only_fields = ['id', 'date_paiement']


# ── Evaluation ──────────────────────────────────────────────────
class ReservationMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['id', 'statut', 'montant']

class ServiceMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'nom']

class ClientMinSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Client
        fields = ['id', 'user', 'username']

# Serializer for evaluation
class EvaluationSerializer(serializers.ModelSerializer):
    service_nom  = serializers.SerializerMethodField()
    prestataire  = serializers.SerializerMethodField()
    client       = serializers.SerializerMethodField()

    class Meta:
        model  = Evaluation
        fields = ['id', 'note', 'commentaire', 'date_eval',
                  'service_nom', 'prestataire', 'client']

    def _get_first_reservation(self, obj):
        """
        Evaluation -> Reservation via Reservation.evaluation (related_name='reservation')
        Donc `obj.reservation` est un manager. On prend la première (il ne devrait y en avoir qu'une).
        """
        try:
            rel = getattr(obj, 'reservation', None)
            if rel is None:
                return None
            # related manager queryset
            return rel.first() if hasattr(rel, 'first') else rel
        except Exception:
            return None

    def get_service_nom(self, obj):
        try:
            res = self._get_first_reservation(obj)
            if res and res.service:
                return res.service.nom
        except Exception:
            pass
        return None

    def get_prestataire(self, obj):
        try:
            res = self._get_first_reservation(obj)
            if res and res.service and res.service.prestataire:
                user = res.service.prestataire.user
                return user.get_full_name() or user.username
        except Exception:
            pass
        return None

    def get_client(self, obj):
        try:
            res = self._get_first_reservation(obj)
            if res and res.client:
                user = res.client.user
                return user.get_full_name() or user.username
        except Exception:
            pass
        return None

# ── Message ──────────────────────────────────────────────────────
class MessageSerializer(serializers.ModelSerializer):
    sender = CompteSerializer(read_only=True)
    message = serializers.CharField(source='contenu', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'reservation', 'sender', 'contenu', 'message', 'date_envoi', 'lu']
        read_only_fields = ['id', 'date_envoi']


# ── Notification ─────────────────────────────────────────────────
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'message', 'lue', 'created_at']
        read_only_fields = ['id', 'created_at']


# ── Reservation ─────────────────────────────────────────────────
class ReservationSerializer(serializers.ModelSerializer):
    service    = ServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(), source='service', write_only=True
    )
    client     = ClientSerializer(read_only=True)
    paiement_id = serializers.SerializerMethodField()
    evaluation_id = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = ['id', 'date_res', 'lieu', 'notes', 'statut', 'montant', 'confirmation',
                  'service', 'service_id', 'client', 'paiement_id', 'evaluation_id']
        read_only_fields = ['id', 'date_res', 'confirmation']

    def get_paiement_id(self, obj):
        return obj.paiement.id if obj.paiement else None

    def get_evaluation_id(self, obj):
        return obj.evaluation.id if obj.evaluation else None



# ── Atelier ──────────────────────────────────────────────────────
class AtelierSerializer(serializers.ModelSerializer):
    prestataire = PrestataireSerializer(read_only=True)

    class Meta:
        model = Atelier
        fields = ['id', 'nom', 'adresse', 'latitude', 'longitude',
                  'telephone', 'description', 'est_actif',
                  'date_creation', 'prestataire']
        read_only_fields = ['id', 'date_creation', 'prestataire']

# ── Itinéraire ────────────────────────────────────────────────────
class ServiceListSerializer(serializers.ModelSerializer):
    prestataire = serializers.StringRelatedField()

    class Meta:
        model = Service
        fields = ['id', 'nom', 'prix', 'prestataire']

class AtelierListSerializer(serializers.ModelSerializer):
    prestataire = serializers.StringRelatedField()

    class Meta:
        model = Atelier
        fields = ['id', 'nom', 'adresse', 'latitude', 'longitude', 'prestataire']


# ── Paiement Admin (avec infos réservation) ─────────────────────
class PaiementAdminSerializer(serializers.ModelSerializer):
    service_nom = serializers.SerializerMethodField()
    client_nom = serializers.SerializerMethodField()
    prestataire_nom = serializers.SerializerMethodField()

    class Meta:
        model = Paiement
        fields = [
            'id', 'methode', 'montant_total', 'montant_prestataire',
            'montant_frais', 'numero_client', 'numero_prestataire',
            'numero_admin', 'transaction_ref', 'ussd_prestataire',
            'ussd_admin', 'statut', 'date_paiement', 'telephone',
            'tx_reference_paygate', 'service_nom', 'client_nom', 'prestataire_nom',
        ]

    def get_service_nom(self, obj):
        try:
            return obj.reservation.service.nom
        except Exception:
            return None

    def get_client_nom(self, obj):
        try:
            user = obj.reservation.client.user
            return user.get_full_name() or user.username
        except Exception:
            return None

    def get_prestataire_nom(self, obj):
        try:
            user = obj.reservation.service.prestataire.user
            return user.get_full_name() or user.username
        except Exception:
            return None


# ── Prestataire Analytics ────────────────────────────────────────
class PrestataireStatsSerializer(serializers.Serializer):
    total_revenue = serializers.FloatField()
    total_reservations = serializers.IntegerField()
    acceptance_rate = serializers.FloatField()
    avg_note = serializers.FloatField(allow_null=True)
    nb_notes = serializers.IntegerField()
    services_count = serializers.IntegerField()
    ateliers_count = serializers.IntegerField()
    category_avg_revenue = serializers.FloatField()
    revenue_monthly = serializers.ListField(child=serializers.FloatField())
    monthly_labels = serializers.ListField(child=serializers.CharField())
    top_services = serializers.ListField(child=serializers.DictField())
    solde = serializers.FloatField()
    statut_activite = serializers.CharField()
    portfolio = PrestatairePortfolioSerializer(many=True, required=False)
    type_abonnement = serializers.CharField(required=False, default='gratuit')
    date_expiration_abonnement = serializers.DateTimeField(allow_null=True, required=False)


class SignalementSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source='client.user.username', read_only=True)
    prestataire_username = serializers.CharField(source='prestataire.user.username', read_only=True)
    prestataire_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Signalement
        fields = ['id', 'client', 'client_username', 'prestataire', 'prestataire_username', 'prestataire_nom', 'motif', 'justification', 'created_at']
        read_only_fields = ['client']

    def get_prestataire_nom(self, obj):
        user = obj.prestataire.user
        return user.get_full_name() or user.username


class FavoriSerializer(serializers.ModelSerializer):
    prestataire_details = PrestataireSerializer(source='prestataire', read_only=True)
    
    class Meta:
        model = Favori
        fields = ['id', 'client', 'prestataire', 'prestataire_details', 'created_at']
        read_only_fields = ['client']
