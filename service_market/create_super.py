import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service_market.settings')
django.setup()

from service.models import Compte

if not Compte.objects.filter(username='admin').exists():
    Compte.objects.create_superuser(
        username='silvere',
        email='sisisoumdina@gmail.com',
        password='Silvere93354922@##'
    )
    print("Superuser créé !")
else:
    print("Superuser existe déjà.")