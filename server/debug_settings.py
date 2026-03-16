import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

try:
    print(f"STATICFILES_DIRS: {settings.STATICFILES_DIRS}")
except AttributeError as e:
    print(f"Error: {e}")
