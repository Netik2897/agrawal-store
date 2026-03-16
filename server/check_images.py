import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

from store.models import Product

print("Current Products and their Images:")
for prod in Product.objects.all():
    try:
        url = prod.image.url if prod.image else "No Image"
        print(f"- {prod.name}: {url}")
    except Exception as e:
        print(f"- {prod.name}: Error getting URL - {str(e)}")
