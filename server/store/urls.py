from django.urls import path
from . import views

urlpatterns = [
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('api/products/', views.product_list, name='product_list'),
    path('api/categories/', views.category_list, name='category_list'),
    path('api/contact/', views.submit_contact_form, name='submit_contact_form'),
    path('api/register/', views.user_register, name='user_register'),
    path('api/login/', views.user_login, name='user_login'),
    path('api/logout/', views.user_logout, name='user_logout'),
    path('api/profile/', views.get_user_profile, name='get_user_profile'),
    path('api/cart/', views.cart_handle, name='cart_handle'),
    path('api/quick-login/', views.quick_whatsapp_login, name='quick_whatsapp_login'),
    path('api/rates/', views.metal_rates, name='metal_rates'),
]
