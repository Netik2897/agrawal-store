from django.urls import path
from . import views

urlpatterns = [
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('api/products/', views.product_list, name='product_list'),
    path('api/categories/', views.category_list, name='category_list'),
    path('api/contact/', views.submit_contact_form, name='submit_contact_form'),
]
