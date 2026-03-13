import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

from store.models import Product, Category, MetalRate

# Clear existing to ensure clean state with correct images
Product.objects.all().delete()
Category.objects.all().delete()

# 1. Create Categories
cats = {}
for name, slug in [('Rings', 'rings'), ('Necklaces', 'necklaces'), ('Coins', 'coins'), ('Bangles', 'bangles'), ('Silver', 'silver')]:
    cats[slug], _ = Category.objects.get_or_create(name=name, slug=slug)

# 2. Update Metal Rates
rates = [('GOLD_24K', 7350.00), ('GOLD_22K', 6850.00), ('SILVER', 92.00)]
for m_type, rate in rates:
    MetalRate.objects.update_or_create(metal_type=m_type, defaults={'rate_per_gram': rate})

# 3. Create Products with Images
products_data = [
    {
        'name': "Traditional Gold Ring",
        'cat': cats['rings'],
        'slug': 'traditional-gold-ring',
        'desc': "A beautiful 22k gold ring with intricate floral patterns.",
        'weight': 5.5,
        'metal': 'GOLD_22K',
        'img': 'products/gold_necklace.png', # Using necklace for now as quality gold sample
        'featured': True
    },
    {
        'name': "Royal Bridal Necklace",
        'cat': cats['necklaces'],
        'slug': 'royal-bridal-necklace',
        'desc': "Grand 22k gold necklace set for your special day.",
        'weight': 45.0,
        'metal': 'GOLD_22K',
        'img': 'products/gold_necklace.png',
        'featured': True
    },
    {
        'name': "Artisan Gold Bangles",
        'cat': cats['bangles'],
        'slug': 'artisan-gold-bangles',
        'desc': "Set of traditional 22k gold bangles with unique textures.",
        'weight': 24.0,
        'metal': 'GOLD_22K',
        'img': 'products/gold_bangles.png',
        'featured': True
    },
    {
        'name': "Handcrafted Silver Set",
        'cat': cats['silver'],
        'slug': 'silver-ornaments-set',
        'desc': "Premium silver anklets and decorative coins.",
        'weight': 120.0,
        'metal': 'SILVER',
        'img': 'products/silver_set.png',
        'featured': True
    }
]

for p in products_data:
    Product.objects.create(
        name=p['name'],
        category=p['cat'],
        slug=p['slug'],
        description=p['desc'],
        price=0,
        weight=p['weight'],
        metal_type=p['metal'],
        making_charges=2000,
        image=p['img'],
        stock=10,
        is_featured=p['featured']
    )

print("Database successfully populated with images.")
