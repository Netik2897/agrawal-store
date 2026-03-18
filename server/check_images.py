import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

from django.conf import settings
from store.models import Product

print(f"DEBUG: USE_CLOUDINARY={getattr(settings, 'USE_CLOUDINARY', 'N/A')}")
print(f"DEBUG: DEFAULT_FILE_STORAGE={settings.DEFAULT_FILE_STORAGE}")
print(f"DEBUG: STORAGES={settings.STORAGES}")

print("Current Products and their Images:")
for prod in Product.objects.all():
    try:
        url = prod.image.url if prod.image else "No Image"
        print(f"- {prod.name}: {url}")
    except Exception as e:
        print(f"- {prod.name}: Error getting URL - {str(e)}")
