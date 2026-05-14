from django.urls import path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet, CompteViewSet, ServiceViewSet, ReservationViewSet,
    PrestataireViewSet, AtelierViewSet, CategorieViewSet, AdminViewSet,
    EvaluationViewSet, NotificationViewSet, initier_paiement, paygate_callback, verifier_paiement, SmartMatchViewSet,
    mes_points_fidelite, rapport_pdf_admin, ajouter_points
)

router = DefaultRouter()
router.register('auth',          AuthViewSet,         basename='auth')
router.register('comptes',       CompteViewSet,       basename='compte')
router.register('services',      ServiceViewSet,      basename='service')
router.register('reservations',  ReservationViewSet,  basename='reservation')
router.register('prestataires',  PrestataireViewSet,  basename='prestataire')
router.register('ateliers',      AtelierViewSet,      basename='atelier')
router.register('categories',    CategorieViewSet,    basename='categorie')
router.register('evaluations',   EvaluationViewSet,   basename='evaluation')
router.register('notifications', NotificationViewSet, basename='notification')
router.register('smart-match',   SmartMatchViewSet,   basename='smartmatch')
router.register('admin',         AdminViewSet,        basename='admin')

urlpatterns = router.urls + [
    path('paiement/initier/',       initier_paiement,     name='paiement-initier'),
    path('paiement/callback/',      paygate_callback,     name='paiement-callback'),
    path('paiement/statut/',        verifier_paiement,    name='paiement-statut'),
    path('fidelite/mes-points/',    mes_points_fidelite,  name='fidelite-points'),
    path('fidelite/ajouter-points/', ajouter_points,      name='fidelite-ajouter-points'),
    path('admin/rapport-pdf/',      rapport_pdf_admin,    name='admin-rapport-pdf'),
    path('', TemplateView.as_view(template_name='index.html')),
    
]
