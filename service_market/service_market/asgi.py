import os
import django
from django.core.asgi import get_asgi_application

# 1. On définit les réglages en premier
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service_market.settings')

# 2. ON INITIALISE DJANGO AVANT TOUT IMPORT DE ROUTING/CONSUMERS
django.setup()

# 3. On récupère l'application HTTP standard
django_asgi_app = get_asgi_application()

# 4. MAINTENANT on peut importer le reste sans crash
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import service.routing 

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            service.routing.websocket_urlpatterns
        )
    ),
})