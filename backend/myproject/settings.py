"""
Django settings for core project.
"""

import os
from corsheaders.defaults import default_headers
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-c7%3n_-amyhne&37hqymfxdfd*y&eo!au@3m5vqfw$jvlv1vt@'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',
    "rest_framework",
    'rest_framework.authtoken',
    "accounts",
    'volunteers',  # ⭐ ADD THIS if not already there
    'events',
    'corsheaders',
    'rest_framework_simplejwt',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',

    # MUST BE FIRST FOR CROSS-ORIGIN COOKIE CREATION
    'django.contrib.sessions.middleware.SessionMiddleware',  
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',  # still fine disabled

    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'volunteers.middleware.VolunteerMiddleware',

    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ⭐ FIX: Remove SessionAuthentication CSRF enforcement
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],   # <-- NO SessionAuth
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}


AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',   # Standard backend
]

ROOT_URLCONF = 'myproject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'myproject.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ugnayan_db',
        'USER': 'ugnayanuser',
        'PASSWORD': 'ugnayanuser',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

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

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ⭐ CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "origin",
    "x-csrftoken",
    "x-requested-with",
]

CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]

SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = False

# 🔥 FIX — MUST BE FALSE for PATCH to work
SESSION_COOKIE_HTTPONLY = False

SESSION_SAVE_EVERY_REQUEST = True
SESSION_COOKIE_NAME = "sessionid"

# 🔥 ADD THIS TOO
CSRF_COOKIE_HTTPONLY = False

# ⭐ CSRF Configuration
CSRF_COOKIE_SAMESITE = "Lax"      # ⭐ MUST be "Lax" for http://localhost
CSRF_COOKIE_SECURE = False
CSRF_TRUSTED_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]
