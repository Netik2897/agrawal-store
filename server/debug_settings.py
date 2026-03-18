import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

try:
    print(f"STATICFILES_DIRS: {settings.STATICFILES_DIRS}")
    print(f"STATICFILES_STORAGE: {getattr(settings, 'STATICFILES_STORAGE', 'NOT FOUND')}")
    print(f"STORAGES: {settings.STORAGES}")
except Exception as e:
    print(f"Error: {e}")
