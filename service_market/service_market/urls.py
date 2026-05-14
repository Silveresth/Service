from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('service.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# ── Production : servir le build React pour toutes les autres routes ──
# Le fichier build/index.html est copié dans staticfiles par collectstatic
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^(?!api/|admin/|media/).*$',
                TemplateView.as_view(template_name='index.html'),
                name='react-app'),
    ]

