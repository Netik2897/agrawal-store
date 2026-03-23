import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

print(f"STORAGES: {settings.STORAGES}")
try:
    print(f"STATICFILES_STORAGE: {settings.STATICFILES_STORAGE}")
except AttributeError as e:
    print(f"STATICFILES_STORAGE Error: {e}")
