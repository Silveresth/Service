"""
Django settings for service_market project.
"""
from pathlib import Path
from decouple import config
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-fallback-do-not-use-in-prod-generate-new')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = [
    'backend-sm.onrender.com', 
    'localhost', 
    '127.0.0.1',
    '192.168.100.19', # Utile si tu testes encore en local sur ton réseau
]
AUTH_USER_MODEL = 'service.Compte'

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Real-time
    'channels',
    # Packages
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'cloudinary',
    # Ton app
    'service',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',   # ← sert les fichiers statiques
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
}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.100.19:3000',
    'https://cloud-ensure-impure.ngrok-free.dev',
]

#  render + tout domaine configuré en .env
CORS_ALLOWED_ORIGINS = [
    "https://frontsm-7ydc.onrender.com", # Remplace par ton URL Render
]

# En développement uniquement : autoriser toutes les origines
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = False  # Security: even dev, explicit origins
    CORS_ALLOWED_ORIGINS += ['http://localhost:3000', 'http://127.0.0.1:3000']

ROOT_URLCONF = 'service_market.urls'

# ─── PayGate Global ───────────────────────────────────────────────────────────
PAYGATE_TOKEN = config('PAYGATE_TOKEN', default='')
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
    REDIS_URL = config('REDIS_URL', default='redis://127.0.0.1:6379')
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [REDIS_URL],
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
        'DIRS': [
            BASE_DIR / 'build',  # ← index.html React (pas frontend/build !)
        ],
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

DATABASES = {
    'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))
}


# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Lome'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
REACT_BUILD_DIR = BASE_DIR / 'frontend' / 'build'
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    REACT_BUILD_DIR / 'static', 
    REACT_BUILD_DIR,          
]

# 3. On utilise WhiteNoise (le plus simple et stable)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Security for production
if not DEBUG:
    # Indique à Django qu'il est derrière un proxy qui gère le HTTPS
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

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

# Logging
import os as _os
_log_dir = BASE_DIR / 'logs'
_log_dir.mkdir(exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'service': {
            'handlers': ['console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
    },
}

CSRF_TRUSTED_ORIGINS = [
    'http://192.168.100.19:8000',
    'https://cloud-ensure-impure.ngrok-free.dev',
    'https://*.onrender.com',  
]
REDIS_URL = config('REDIS_URL', default=None)

if REDIS_URL:
    # On force rediss:// pour le SSL sur Railway
    if REDIS_URL.startswith('redis://'):
        REDIS_URL = REDIS_URL.replace('redis://', 'rediss://', 1)

    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [REDIS_URL],
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer',
        },
    }

# Indique à Django d'utiliser Cloudinary pour les médias
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'