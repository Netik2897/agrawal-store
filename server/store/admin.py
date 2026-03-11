from django.contrib import admin
from django.urls import reverse
from .models import Category, Product, Order, ContactMessage

admin.site.site_header = "Prem Jewellers Administration"
admin.site.site_title = "Prem Admin Portal"
admin.site.index_title = "Welcome to your Business Management"

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'price', 'stock', 'available', 'is_featured', 'created', 'updated']
    list_filter = ['available', 'is_featured', 'created', 'updated', 'category']
    list_editable = ['price', 'stock', 'available', 'is_featured']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description']
    ordering = ['-created']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'email', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    list_editable = ['status']
    search_fields = ['customer_name', 'email']
    ordering = ['-created_at']

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    ordering = ['-created_at']
    readonly_fields = ['name', 'email', 'subject', 'message', 'created_at']
