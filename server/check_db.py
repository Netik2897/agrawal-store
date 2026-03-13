import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

from store.models import Product, Category

print(f"Categories count: {Category.objects.count()}")
for cat in Category.objects.all():
    print(f"  - {cat.name} ({cat.slug})")

print(f"Products count: {Product.objects.count()}")
for prod in Product.objects.all():
    print(f"  - {prod.name} ({prod.price})")
