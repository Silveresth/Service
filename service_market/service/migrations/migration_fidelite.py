# Collez ce fichier dans service/migrations/ et renommez-le 000X_add_fidelite.py
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('service', '0001_initial'),  # Adaptez avec votre dernière migration
    ]
    operations = [
        migrations.CreateModel(
            name='PointsFidelite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True)),
                ('points', models.IntegerField(default=0)),
                ('niveau', models.CharField(choices=[('bronze','Bronze'),('or','Or'),('platine','Platine')], default='bronze', max_length=10)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('prestataire', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='points_fidelite', to='service.prestataire')),
            ],
        ),
        migrations.CreateModel(
            name='HistoriquePoints',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True)),
                ('points_gagnes', models.IntegerField()),
                ('motif', models.CharField(max_length=200)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('prestataire', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='historique_points', to='service.prestataire')),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
