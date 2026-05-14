from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from django.http import JsonResponse
import os

# Ta fonction de vue pour la racine
def api_root(request):
    return JsonResponse({
        "status": "online",
        "message": "Backend de Service Market opérationnel",
        "api_docs": "/api/" 
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('service.urls')),
    
    # Route pour les fichiers médias (photos de profil, etc.)
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    
    # Racine du site : On affiche le JSON au lieu de chercher un index.html inexistant
    path('', api_root),
]

# Optionnel : Servir les fichiers statiques en développement
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)