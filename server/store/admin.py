from django.contrib import admin
from django.urls import reverse
from .models import Category, Product, Order, OrderItem, ContactMessage, MetalRate, CustomerProfile, Cart, CartItem

admin.site.site_header = "Prem Jewellers Administration"
admin.site.site_title = "Prem Admin Portal"
admin.site.index_title = "Welcome to your Business Management"

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'city', 'created_at']
    search_fields = ['user__username', 'phone_number', 'city']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['price']

@admin.register(MetalRate)
class MetalRateAdmin(admin.ModelAdmin):
    list_display = ['get_metal_type_display', 'rate_per_gram', 'last_updated']
    list_editable = ['rate_per_gram']
    ordering = ['metal_type']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'metal_type', 'weight', 'price', 'making_charges', 'stock', 'available', 'is_featured']
    list_filter = ['available', 'is_featured', 'metal_type', 'category']
    list_editable = ['price', 'stock', 'available', 'is_featured', 'making_charges']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description', 'metal_type']
    ordering = ['-created']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'email', 'total_amount', 'payment_status', 'status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    list_editable = ['status', 'payment_status']
    search_fields = ['customer_name', 'email', 'transaction_id']
    ordering = ['-created_at']
    inlines = [OrderItemInline]

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'session_id', 'created_at']
    inlines = [CartItemInline]

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    ordering = ['-created_at']
    readonly_fields = ['name', 'email', 'subject', 'message', 'created_at']
