import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service_market.settings')

from django.core.asgi import get_asgi_application

# Initialize Django ASGI app first - this also calls django.setup()
django_asgi_app = get_asgi_application()

# Import routing AFTER django is fully initialized
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from service.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
