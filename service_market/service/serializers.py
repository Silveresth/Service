from rest_framework import serializers
from .models import Compte, Client, Prestataire, Service, Reservation, Paiement, Evaluation, Categorie, Atelier, Message, Notification


# ── Compte (custom user) ──────────────────────────────────────────
class CompteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compte
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'telephone', 'adresse', 'type_compte', 'is_staff', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'is_staff']


class CompteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compte
        fields = ['first_name', 'last_name', 'email', 'telephone', 'adresse']


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


# ── Prestataire ──────────────────────────────────────────────────
class PrestataireSerializer(serializers.ModelSerializer):
    user = CompteSerializer(read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Prestataire
        fields = ['user', 'specialite', 'numero_flooz', 'numero_mix', 'photo', 'photo_url']

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None


# ── Client ────────────────────────────────────────────────────
class ClientSerializer(serializers.ModelSerializer):
    user = CompteSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Client
        fields = ['user', 'username']


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

    class Meta:
        model = Service
        fields = [
            'id', 'nom', 'description', 'prix', 'disponibilite', 'est_actif',
            'prestataire',
            'prestataire_id', 'prestataire_nom',
            'categorie', 'categorie_id',
            'image', 'image_url', 'model_3d', 'model_3d_url', 'has_ar',
            'note_avg', 'nb_notes',
        ]


    def get_prestataire_nom(self, obj):
        try:
            user = obj.prestataire.user
            return user.get_full_name() or user.username
        except Exception:
            return None

    def get_model_3d_url(self, obj):
        if obj.model_3d:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.model_3d.url)
            return obj.model_3d.url
        return None

    def get_has_ar(self, obj):
        return bool(obj.model_3d)

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
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
