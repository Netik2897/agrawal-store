import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

from store.models import Product, Category, MetalRate

# Clear existing to ensure clean state
Product.objects.all().delete()
Category.objects.all().delete()

# 1. Create Categories
cats = {}
for name, slug in [('Shirts', 'shirts'), ('T-Shirts', 'tshirts'), ('Jeans', 'jeans'), ('Ethnic', 'ethnic'), ('Winter', 'winter')]:
    cats[slug], _ = Category.objects.get_or_create(name=name, slug=slug)

# 2. Keep Metal Rates as placeholders so old backend code doesn't crash
rates = [('GOLD_24K', 1.00), ('GOLD_22K', 1.00), ('SILVER', 1.00)]
for m_type, rate in rates:
    MetalRate.objects.update_or_create(metal_type=m_type, defaults={'rate_per_gram': rate})

# 3. Create Products for Agrawal Clothing
products_data = [
    {
        'name': "Premium Casual Shirt",
        'cat': cats['shirts'],
        'slug': 'premium-casual-shirt',
        'desc': "100% fine cotton casual shirt for everyday premium feel.",
        'weight': 1499, # Setting weight as price so calculated price works out
        'metal': 'GOLD_24K',
        'img': 'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?q=80&w=2000&auto=format&fit=crop',
        'featured': True
    },
    {
        'name': "Designer Black T-Shirt",
        'cat': cats['tshirts'],
        'slug': 'designer-black-tshirt',
        'desc': "Comfortable and stylish modern minimalist t-shirt.",
        'weight': 999,
        'metal': 'GOLD_22K',
        'img': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2000&auto=format&fit=crop',
        'featured': True
    },
    {
        'name': "Signature Blue Jeans",
        'cat': cats['jeans'],
        'slug': 'signature-blue-jeans',
        'desc': "Stretchable ultra-comfort denim jeans.",
        'weight': 1999,
        'metal': 'GOLD_24K',
        'img': 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=2000&auto=format&fit=crop',
        'featured': True
    },
    {
        'name': "Royal Kurta Ethnic Set",
        'cat': cats['ethnic'],
        'slug': 'royal-kurta-set',
        'desc': "Perfect for festive occasions with intricate tailoring.",
        'weight': 2999,
        'metal': 'SILVER',
        'img': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
        'featured': True
    }
]

for p in products_data:
    Product.objects.create(
        name=p['name'],
        category=p['cat'],
        slug=p['slug'],
        description=p['desc'],
        price=p['weight'], # Use explicit price
        weight=1, 
        metal_type=p['metal'],
        making_charges=0,
        image=p['img'],
        stock=50,
        is_featured=p['featured']
    )

print("Clothing Database successfully populated!")
