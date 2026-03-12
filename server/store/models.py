from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Manual price override (optional). Set to 0 to use auto-calculation.")
    weight = models.DecimalField(max_digits=10, decimal_places=3, default=0, help_text="Weight in grams")
    METAL_TYPE_CHOICES = [
        ('GOLD_24K', 'Gold 24K'),
        ('GOLD_22K', 'Gold 22K'),
        ('SILVER', 'Silver'),
        ('FIXED', 'Fixed Price (No auto-calc)'),
    ]
    metal_type = models.CharField(max_length=20, choices=METAL_TYPE_CHOICES, default='FIXED')
    making_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Making charges (Flat per gram or absolute)")
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    stock = models.IntegerField(default=0)
    available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Order(models.Model):
    customer_name = models.CharField(max_length=200)
    email = models.EmailField()
    address = models.TextField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[('Pending', 'Pending'), ('Completed', 'Completed')], default='Pending')

    def __str__(self):
        return f"Order {self.id} by {self.customer_name}"
class ContactMessage(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"

class MetalRate(models.Model):
    METAL_CHOICES = [
        ('GOLD_24K', 'Gold 24K'),
        ('GOLD_22K', 'Gold 22K'),
        ('SILVER', 'Silver'),
    ]
    metal_type = models.CharField(max_length=20, choices=METAL_CHOICES, unique=True)
    rate_per_gram = models.DecimalField(max_digits=10, decimal_places=2)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_metal_type_display()}: ₹{self.rate_per_gram}/g"
