from django.contrib import admin
from .models import Compte, Client, Prestataire, Service, Reservation, Paiement, Evaluation, Categorie, Atelier, Message, Notification

# Configuration de l'affichage des comptes
@admin.register(Compte)
class CompteAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'type_compte', 'is_staff')
    list_filter = ('type_compte', 'is_staff')
    search_fields = ('username', 'email')

# Configuration pour les services
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('nom', 'categorie', 'prix', 'prestataire', 'disponibilite', 'has_ar_model')
    list_filter = ('categorie', 'disponibilite')
    search_fields = ('nom', 'description')
    readonly_fields = ('has_ar_model',)

    def has_ar_model(self, obj):
        return bool(obj.model_3d)
    has_ar_model.short_description = "AR 3D disponible"
    has_ar_model.boolean = True

# Configuration pour les réservations
@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'service', 'date_res', 'date_debut', 'lieu', 'statut', 'montant')
    list_filter = ('statut', 'date_res')
    search_fields = ('lieu', 'notes', 'service__nom')

# Configuration pour les messages
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'reservation', 'sender', 'date_envoi', 'lu')
    list_filter = ('lu', 'date_envoi')
    search_fields = ('contenu',)

# Configuration pour les notifications
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'type', 'message', 'lue', 'created_at')
    list_filter = ('type', 'lue', 'created_at')
    search_fields = ('message',)

# Enregistrement simple pour les autres modèles
admin.site.register(Client)
admin.site.register(Prestataire)
admin.site.register(Atelier)
admin.site.register(Paiement)
admin.site.register(Evaluation)

@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('nom', 'icone')
    search_fields = ('nom',)

# Personnalisation du titre de l'interface
admin.site.site_header = "Administration Service Market"
admin.site.site_title = "Service Market Admin"
admin.site.index_title = "Gestion de la plateforme"

