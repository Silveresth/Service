from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from service.models import (
    Compte,
    Client,
    Prestataire,
    Categorie,
    Service,
    Atelier,
    Reservation,
)


class Command(BaseCommand):
    help = "Seed demo data: au moins 5 lignes par table (client/prestataire/categorie/service/atelier) + quelques réservations."

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=5,
            help="Nombre d'items par table (par défaut 5).",
        )
        parser.add_argument(
            "--wipe",
            action="store_true",
            help="Si fourni, supprime les données seed précédentes avant de reseed.",
        )

    def handle(self, *args, **options):
        count = int(options["count"])
        wipe = bool(options["wipe"])

        User = get_user_model()

        with transaction.atomic():
            if wipe:
                # Wipe uniquement les objets marqués (on filtre par username prefix)
                prefixes = [
                    "seed_client_",
                    "seed_prestataire_",
                    "seed_service_",
                    "seed_categorie_",
                    "seed_atelier_",
                ]

                # Suppression ordonnée (FK)
                Reservation.objects.filter(service__nom__startswith="seed_service_").delete()
                Service.objects.filter(nom__startswith="seed_service_").delete()
                Atelier.objects.filter(nom__startswith="seed_atelier_").delete()
                Categorie.objects.filter(nom__startswith="seed_categorie_").delete()

                Compte.objects.filter(username__startswith="seed_").delete()

            # 1) Create clients & prestataires (noms cohérents)
            client_names = [
                "Amadou",
                "Fatou",
                "Koffi",
                "Aminata",
                "Moussa",
                "Mariama",
                "Serge",
            ]
            prestataire_names = [
                "Sogbossito Pro",
                "Tokoin Services",
                "Bè Maintenance",
                "Adidogomé Tech",
                "Agoè Travaux",
                "Kodjoviakopé BTP",
            ]

            for i in range(count):
                # Client
                client_display = client_names[i % len(client_names)]
                username_c = f"{client_display.lower()}_client_{i+1}"
                user_c = User.objects.filter(username=username_c).first()
                if not user_c:
                    user_c = User.objects.create_user(
                        username=username_c,
                        password="Seed1234!",
                        email="",
                        telephone=f"90000{i+1:02d}",
                        adresse="Lomé",
                        type_compte="client",
                    )
                    Client.objects.get_or_create(user=user_c)

                # Prestataire
                prest_display = prestataire_names[i % len(prestataire_names)]
                username_p = f"{prest_display.lower().replace(' ', '_')}_prestataire_{i+1}"
                user_p = User.objects.filter(username=username_p).first()
                if not user_p:
                    user_p = User.objects.create_user(
                        username=username_p,
                        password="Seed1234!",
                        email="",
                        telephone=f"97700{i+1:02d}",
                        adresse="Lomé",
                        type_compte="prestataire",
                    )
                    Prestataire.objects.get_or_create(
                        user=user_p,
                        defaults={
                            "specialite": "Plomberie",
                            "numero_flooz": "",
                            "numero_mix": "",
                        },
                    )


            # 2) Categories (noms cohérents)
            categories_names = [
                ("Plomberie", "bi-droplet"),
                ("Électricité", "bi-lightning"),
                ("Peinture Domotique", "bi-palette"),
                ("Climatisation", "bi-thermometer"),
                ("Menuiserie", "bi-tools"),
                ("Mécanique", "bi-gear"),
                ("Informatique", "bi-laptop"),
                ("Jardinage", "bi-tree"),
                ("Maçonnerie", "bi-building"),
            ]

            categories = []
            for i in range(count):
                cat_nom, cat_icon = categories_names[i % len(categories_names)]
                cat, _ = Categorie.objects.get_or_create(
                    nom=cat_nom,
                    defaults={"icone": cat_icon},
                )
                categories.append(cat)


            # 3) Services
            prestataires = list(Prestataire.objects.all().order_by("id")[:count])
            if not prestataires:
                raise CommandError("Aucun prestataire seed trouvé/après création")

            services = []
            for i in range(count):
                prest = prestataires[i % len(prestataires)]
                service_names = [
                    "Plomberie & Réparation",
                    "Électricité & Installation",
                    "Peinture Domotique",
                    "Climatisation & Ventilation",
                    "Menuiserie & Finitions",
                    "Mécanique & Maintenance",
                    "Informatique & Réseaux",
                    "Jardinage & Aménagement",
                    "Maçonnerie & Rénovation",
                ]
                service_nom = service_names[i % len(service_names)]

                srv, _ = Service.objects.get_or_create(
                    nom=service_nom,
                    defaults={
                        "prestataire": prest,
                        "categorie": categories[i % len(categories)],
                        "description": [
                            "Intervention rapide et de qualité.",
                            "Travaux soignés avec garantie.",
                            "Conseils personnalisés avant exécution.",
                        ][i % 3],
                        "prix": 10000 + i * 500,
                        "disponibilite": True,
                    },
                )
                services.append(srv)


            # 4) Ateliers
            ateliers = []
            base_lat = 6.12558
            base_lng = 1.23245

            atelier_prefixes = ["Centre", "Sogbossito", "Tokoin", "Bè", "Adidogomé", "Agoè", "Kodjoviakopé"]
            ateliers_names = ["Atelier", "Service", "Bureau"]

            for i in range(count):
                prest = prestataires[i % len(prestataires)]
                atelier_nom = f"{ateliers_names[i % len(ateliers_names)]} {atelier_prefixes[i % len(atelier_prefixes)]}"

                villes_adresse = [
                    "Sogbossito (près station Total Énergy)",
                    "Tokoin (zone marché)",
                    "Bè (près des restaurants)",
                    "Adidogomé (route principale)",
                    "Agoè (centre ville)",
                    "Kodjoviakopé (quartier résidentiel)",
                ]

                at, _ = Atelier.objects.get_or_create(
                    nom=atelier_nom,
                    defaults={
                        "prestataire": prest,
                        "adresse": f"{villes_adresse[i % len(villes_adresse)]}, Lomé",
                        "latitude": round(base_lat + (i * 0.01), 6),
                        "longitude": round(base_lng + (i * 0.01), 6),
                        "telephone": f"90000{i+1:02d}",
                        "description": "Interventions à Lomé — devis rapide et travail soigné.",
                        "est_actif": True,
                        "date_creation": timezone.now(),
                    },
                )
                ateliers.append(at)


            # 5) Réservations
            clients = list(Client.objects.all().order_by("id")[:count])
            if not clients:
                raise CommandError("Aucun client seed trouvé/après création")

            res_created = 0
            lieu_names = [
                "Sogbossito — immeuble résidentiel",
                "Tokoin — maison individuelle",
                "Bè — local commercial",
                "Adidogomé — appartement",
                "Agoè — villa",
                "Kodjoviakopé — chantier",
            ]

            for i, srv in enumerate(services):
                cli = clients[i % len(clients)]
                if not Reservation.objects.filter(
                    service=srv,
                    client=cli,
                    statut__in=["en_attente", "en_attente_paiement"],
                ).exists():
                    Reservation.objects.create(
                        client=cli,
                        service=srv,
                        montant=srv.prix,
                        statut="en_attente",
                        lieu=lieu_names[i % len(lieu_names)],
                        notes="Merci de contacter avant l’intervention.",
                        date_debut=None,
                        confirmation=False,
                    )
                    res_created += 1



            self.stdout.write(self.style.SUCCESS(f"Seed terminé. count={count}."))
            self.stdout.write(self.style.SUCCESS(f"Réservations ajoutées: {res_created}"))

