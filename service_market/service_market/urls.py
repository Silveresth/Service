from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.generic import TemplateView
from django.views.static import serve

from django.http import FileResponse
import os

def serve_static_file(filename, content_type):
    def view(request):
        path = os.path.join(settings.BASE_DIR, 'build', filename)
        return FileResponse(open(path, 'rb'), content_type=content_type)
    return view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('service.urls')),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    
    # Fichiers PWA — avant le catch-all
    path('manifest.json', serve_static_file('manifest.json', 'application/json')),
    path('sw.js', serve_static_file('sw.js', 'application/javascript')),
    path('leaflet.css', serve_static_file('leaflet.css', 'text/css')),
    path('leaflet.js', serve_static_file('leaflet.js', 'application/javascript')),
    
    # Catch-all React — EN DERNIER
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]