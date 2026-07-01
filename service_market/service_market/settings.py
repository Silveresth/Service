"""
Django settings for service_market project.
"""

from pathlib import Path
from decouple import config
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: don't run with debug turned on in production!
# Par défaut à False : si la variable d'env DEBUG n'est pas définie sur le
# serveur, on ne veut JAMAIS exposer les stack traces par accident.
DEBUG = config('DEBUG', default=False, cast=bool)

# SECURITY WARNING: keep the secret key used in production secret!
# Aucun fallback "insecure" en dur ici : si SECRET_KEY n'est pas fourni
# en production, le serveur refuse de démarrer plutôt que de tourner avec
# une clé connue de tout le monde (visible dans ce code source).
if DEBUG:
    SECRET_KEY = config('SECRET_KEY', default='django-insecure-dev-only-not-for-production')
else:
    SECRET_KEY = config('SECRET_KEY')  # lève une erreur explicite si absent

# Liste blanche des domaines autorisés à appeler l'API en cross-origin.
# On n'autorise plus TOUTES les origines (CORS_ALLOW_ALL_ORIGINS) car
# combiné à CORS_ALLOW_CREDENTIALS=True, ça permettait à n'importe quel
# site web de faire des requêtes authentifiées vers cette API.
CORS_ALLOWED_ORIGINS = [
    o.strip() for o in config('CORS_ALLOWED_ORIGINS', default='').split(',') if o.strip()
]
# Schémas additionnels nécessaires pour l'app mobile Capacitor.
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^capacitor://.*$',
    r'^https://.*\.onrender\.com$',
]
if DEBUG:
    CORS_ALLOWED_ORIGINS += ['http://localhost:3000', 'http://127.0.0.1:3000']
CORS_ALLOW_CREDENTIALS = True

# Hôtes autorisés à servir des requêtes (Host header). En prod, on liste
# explicitement les domaines au lieu d'accepter n'importe quel Host (qui
# ouvre la porte à des attaques de type "host header poisoning").
ALLOWED_HOSTS = [
    h.strip() for h in config(
        'ALLOWED_HOSTS',
        default='apk-back.onrender.com,.onrender.com,localhost,127.0.0.1'
    ).split(',') if h.strip()
]

# ─── RENDER CONFIG ────────────────────────────────────────────────────────────
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

AUTH_USER_MODEL = 'service.Compte'

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Storage
    'cloudinary_storage',
    'cloudinary',
    # Real-time
    'channels',
    # Packages
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    # Ton app
    'service',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # ← EN PREMIER obligatoire
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/min',
        'user': '120/min',
        'login': '10/min',       # utilisé sur /auth/login/ et /auth/register/
        'chatbot': '20/min',     # utilisé sur /chatbot/ (appel API IA payant)
    },
}

ROOT_URLCONF = 'service_market.urls'


# ─── PayGate Global ───────────────────────────────────────────────────────────
PAYGATE_TOKEN = config('PAYGATE_TOKEN', default='')
GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID', default='')
# Secret partagé pour vérifier l'authenticité des callbacks PayGate entrants.
# Doit être ajouté dans l'URL de callback configurée côté PayGate, ex:
# https://apk-back.onrender.com/api/paiement/callback/?secret=XXXX
PAYGATE_CALLBACK_SECRET = config('PAYGATE_CALLBACK_SECRET', default='')
PAYGATE_CALLBACK_PATH = "/api/paiement/callback/" 

# ─── CHANNELS (WebSocket) ─────────────────────────────────────────────────────
ASGI_APPLICATION = 'service_market.asgi.application'
if DEBUG:
    # En développement : pas besoin de Redis
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer',
        },
    }
else:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [config('REDIS_URL', default='redis://127.0.0.1:6379')],
            },
        },
    }

from corsheaders.defaults import default_headers

CORS_ALLOW_HEADERS = list(default_headers) + [
    'ngrok-skip-browser-warning',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'service_market.wsgi.application'

DATABASE_URL = config('DATABASE_URL', default='')

# Astuce dev: si DATABASE_URL n'est pas pris en compte dans certains shells,
# on peut forcer SQLite via USE_SQLITE_FOR_DEV=1.
USE_SQLITE_FOR_DEV = config('USE_SQLITE_FOR_DEV', default='0')

if USE_SQLITE_FOR_DEV == '1':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'sm_db.sqlite3',
        }
    }
elif DATABASE_URL:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='sm_db'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }


# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Lome'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
# Le stockage des fichiers statiques est géré dans le dictionnaire STORAGES en bas du fichier

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Security for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Configuration paiements Flooz/Mix (Togo)
FLOOZ_ADMIN_NUM = config('FLOOZ_ADMIN_NUM', default='97430290')
MIX_ADMIN_NUM = config('MIX_ADMIN_NUM', default='93354922')
FEE_PERCENT = 0.03  # 3% frais
PHONE_PREFIX = '228'  # Togo

# Configuration E-mail (fallback notifications hors-ligne)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'noreply@servicemarket.tg'

# Logging
import os as _os
_os.makedirs(BASE_DIR / 'logs', exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs/django.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'service': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },

}

CSRF_TRUSTED_ORIGINS = [
    'https://apk-back.onrender.com',
    'https://*.onrender.com',
    'capacitor://localhost',
    'http://localhost',
]

_extra_csrf = config('CSRF_TRUSTED_ORIGINS', default='')
if _extra_csrf:
    CSRF_TRUSTED_ORIGINS += [o.strip() for o in _extra_csrf.split(',') if o.strip()]

from datetime import timedelta
 
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(hours=12),   # était probablement 5min
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),    # 30 jours
    'ROTATE_REFRESH_TOKENS':  True,                  # nouveau refresh à chaque refresh
    'BLACKLIST_AFTER_ROTATION': True,                # invalide l'ancien refresh après rotation
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ─── CLOUDINARY STORAGE ───────────────────────────────────────────────────────
# ─── Cloudinary ────────────────────────────────────────────────────────────────
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': config('CLOUDINARY_CLOUD_NAME', default=''),
    'API_KEY':    config('CLOUDINARY_API_KEY',    default=''),
    'API_SECRET': config('CLOUDINARY_API_SECRET', default=''),
}

STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage"
        if CLOUDINARY_STORAGE['CLOUD_NAME'] and CLOUDINARY_STORAGE['API_KEY']
        else "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}