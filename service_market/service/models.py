from django.db import models
from django.contrib.auth.models import AbstractUser

class Compte(AbstractUser):
    telephone = models.CharField(max_length=15)
    adresse = models.TextField()
    
    CHOIX_TYPE = (
        ('client', 'Client'),
        ('prestataire', 'Prestataire'),
    )
    type_compte = models.CharField(max_length=20, choices=CHOIX_TYPE)

    def __str__(self):
        return self.username


class Client(models.Model):
    user = models.OneToOneField(Compte, on_delete=models.CASCADE, related_name='client_profile')
    
    def __str__(self):
        return f"Client: {self.user.username}"

class Prestataire(models.Model):
    user = models.OneToOneField(Compte, on_delete=models.CASCADE, related_name='prestataire_profile')
    specialite = models.CharField(max_length=100)
    numero_flooz = models.CharField(max_length=15, blank=True, default='', help_text="Numéro Flooz (ex: 97430290)")
    numero_mix = models.CharField(max_length=15, blank=True, default='', help_text="Numéro Mix by Yas (ex: 93354922)")
    photo = models.ImageField(upload_to='prestataires/', blank=True, null=True, help_text="Photo de profil du prestataire")
    
    def __str__(self):
        return f"Prestataire: {self.user.username}"

    def get_phone_for_method(self, method):
        if method == 'flooz':
            return self.numero_flooz
        elif method == 'tmoney':
            return self.numero_mix
        return None

class Administrateur(models.Model):
    user = models.OneToOneField(Compte, on_delete=models.CASCADE, related_name='admin_profile')
    
    niveau_acces = models.CharField(max_length=50, default="SuperAdmin")

    def __str__(self):
        return f"Admin: {self.user.username}"

class Categorie(models.Model):
    nom = models.CharField(max_length=100)
    icone = models.CharField(max_length=50, help_text="Nom de l'icône Bootstrap (ex: bi-lightbulb)")

    def __str__(self):
        return self.nom

class Service(models.Model):
    prestataire = models.ForeignKey(Prestataire, on_delete=models.CASCADE, related_name='services')
    nom = models.CharField(max_length=200)
    categorie = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True, related_name='services')
    description = models.TextField()
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    disponibilite = models.BooleanField(default=True)
    image = models.ImageField(upload_to='services/', blank=True, null=True, help_text="Image du service")
    model_3d = models.FileField(upload_to='models_3d/', blank=True, null=True, help_text="Modèle 3D glTF pour AR Preview (optionnel)")
    
    class Meta:
        ordering = ['-id']
    
    def __str__(self):
        return self.nom


class Atelier(models.Model):
    prestataire = models.ForeignKey(Prestataire, on_delete=models.CASCADE, related_name='ateliers')
    nom = models.CharField(max_length=200, help_text="Nom de l'atelier")
    adresse = models.TextField(help_text="Adresse complète de l'atelier")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, help_text="Latitude (ex: 6.125580)")
    longitude = models.DecimalField(max_digits=9, decimal_places=6, help_text="Longitude (ex: 1.232456)")
    telephone = models.CharField(max_length=15, help_text="Numéro de téléphone de l'atelier")
    description = models.TextField(blank=True, help_text="Description supplémentaire")
    est_actif = models.BooleanField(default=True, help_text="L'atelier est-il actif?")
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Atelier"
        verbose_name_plural = "Ateliers"

    def __str__(self):
        return f"{self.nom} - {self.prestataire.user.username}"

    def get_coordinates(self):
        """Retourne les coordonnées sous forme de tuple (lat, lng)"""
        return (float(self.latitude), float(self.longitude))


class Paiement(models.Model):
    METHODE_CHOICES = (
        ('flooz', 'Flooz (*155#)'),
        ('tmoney', 'Mix by Yas (*145#)'),
    )

    reservation = models.ForeignKey(
        'Reservation', 
        on_delete=models.CASCADE, 
        related_name='paiement_set_associes',
        verbose_name="Réservation liée"
    )

    montant_total = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        help_text="Montant total payé par client (FCFA)"
    )
    montant_prestataire = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        help_text="Montant net pour prestataire (FCFA)"
    )
    montant_frais = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        help_text="Frais admin (3%) (FCFA)"
    )

    methode = models.CharField(max_length=50, choices=METHODE_CHOICES, default='flooz')
    numero_client = models.CharField(max_length=15, default='', help_text="Numéro payeur")
    numero_prestataire = models.CharField(max_length=15, default='', help_text="Numéro prestataire")
    numero_admin = models.CharField(max_length=15, default='', help_text="Numéro admin frais")
    
    transaction_ref = models.CharField(max_length=20, blank=True, default='', help_text="Référence paiement")
    ussd_prestataire = models.CharField(max_length=100, blank=True, default='', help_text="Commande USSD prestataire")
    ussd_admin = models.CharField(max_length=100, blank=True, default='', help_text="Commande USSD admin")
    
    date_paiement = models.DateTimeField(null=True, blank=True, auto_now_add=True)
    telephone = models.CharField(max_length=20, blank=True, default='')
    tx_reference_paygate = models.CharField(max_length=100, blank=True, default='')
    
    statut = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'En attente'), 
            ('confirme', 'Confirmé'), 
            ('echoue', 'Échoué')
        ],
        default='pending'
    )

    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"

    def __str__(self):
        return f"Paiement {self.id} (Resa #{self.reservation_id})"

class Evaluation(models.Model):
    note = models.IntegerField()
    commentaire = models.TextField()
    date_eval = models.DateTimeField(auto_now_add=True)


class Reservation(models.Model):
    STATUT_CHOICES = (
        ('en_attente', 'En attente'),
        ('en_attente_paiement', 'En attente de paiement'),
        ('confirmee', 'Confirmée'),
        ('annulee', 'Annulée'),
        ('terminee', 'Terminée'),
    )

    date_res = models.DateTimeField(auto_now_add=True)
    date_debut = models.DateTimeField(null=True, blank=True, help_text="Date et heure de début de l'intervention")
    lieu = models.CharField(max_length=300, blank=True, default='', help_text="Lieu précis de l'intervention")
    notes = models.TextField(blank=True, default='', help_text="Notes supplémentaires du client")
    statut = models.CharField(max_length=25, choices=STATUT_CHOICES, default='en_attente')
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    confirmation = models.BooleanField(default=False)
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='reservations')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='reservations')
    paiement = models.OneToOneField(Paiement, on_delete=models.SET_NULL, null=True, blank=True, related_name='reservation_liee')
    evaluation = models.ForeignKey(Evaluation, on_delete=models.SET_NULL, null=True, blank=True, related_name='reservation')


    class Meta:
        ordering = ['-date_res']

    def __str__(self):
        return f"Réservation {self.id} - {self.service.nom}"


class Message(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(Compte, on_delete=models.CASCADE, related_name='messages_envoyes')
    contenu = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)
    lu = models.BooleanField(default=False)

    class Meta:
        ordering = ['date_envoi']

    def __str__(self):
        return f"Message {self.id} - {self.sender.username}"


class Notification(models.Model):
    TYPE_CHOICES = (
        ('reservation', 'Réservation'),
        ('chat', 'Chat'),
        ('paiement', 'Paiement'),
        ('systeme', 'Système'),
    )

    user = models.ForeignKey(Compte, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='systeme')
    message = models.TextField()
    lue = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notif {self.id} - {self.user.username}"


from django.db.models.signals import pre_save
from django.dispatch import receiver


@receiver(pre_save, sender=Compte)
def create_profile(sender, instance, **kwargs):
    if instance.pk is None:  # Only for new instances
        return
    try:
        if instance.type_compte == 'client':
            Client.objects.get_or_create(user=instance)
        elif instance.type_compte == 'prestataire':
            Prestataire.objects.get_or_create(user=instance)
        if getattr(instance, 'is_staff', False):
            Administrateur.objects.get_or_create(user=instance)
    except Exception:
        pass  # Avoid signal errors
