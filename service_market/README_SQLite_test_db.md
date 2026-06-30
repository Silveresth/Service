# Base de données SQLite de test (pour développement local)

Ce projet utilise Django. En production tu as PostgreSQL, mais pour le développement/local on peut utiliser SQLite.

## 1) Générer une base SQLite
Depuis `c:/Service/service_market` :

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate

# seed demo data
python manage.py seed_demo_data --count 5 --wipe
```

## 2) Passer Django en SQLite
Dans `service_market/settings.py`, l’applicatif sélectionne PostgreSQL par défaut.

Pour forcer SQLite, crée une variable d’environnement `DATABASE_URL` (optionnel) ou modifie temporairement le code.

### Option A (recommandé) : via DATABASE_URL
```bash
set DATABASE_URL=sqlite:///sm_db.sqlite3
```
Puis relancer les migrations + seed.

### Option B : modifier settings.py temporairement
Remplacer `ENGINE: 'django.db.backends.postgresql'` par `sqlite3` et mettre un chemin.

## 3) Identifiants seed
La commande `seed_demo_data` crée des comptes de type :
- client : username du style `amadou_client_1`, `fatou_client_2`, ...
- prestataire : username du style `sogbossito_pro_prestataire_1`, ...

Mot de passe pour tous les seeds :
- `Seed1234!`

## 4) Fichier DB
Par défaut avec `sqlite:///sm_db.sqlite3` :
- `c:/Service/service_market/sm_db.sqlite3`

