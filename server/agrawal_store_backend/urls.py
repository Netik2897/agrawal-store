"""
URL configuration for agrawal_store_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from django.views.generic.base import RedirectView
from django.conf import settings
from django.conf.urls.static import static

from store import views as store_views

urlpatterns = [
    path('', store_views.home, name='home'),
    path('catalog/', store_views.catalog_page, name='catalog'),
    path('about/', store_views.about_page, name='about'),
    path('contact/', store_views.contact_page, name='contact'),
    path('account/', store_views.account_page, name='account'),
    path('admin/', admin.site.urls),
    path('management-portal/', include('store.urls')),
    
    # Legacy support for .html links
    path('index.html', store_views.home),
    path('catalog.html', store_views.catalog_page),
    path('about.html', store_views.about_page),
    path('contact.html', store_views.contact_page),
    path('account.html', store_views.account_page),
    path('sitemap.xml', store_views.sitemap, name='sitemap'),
    path('robots.txt', store_views.robots_txt, name='robots_txt'),
    path('favicon.ico', RedirectView.as_view(url='https://img.icons8.com/color/48/000000/jewelry.png')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
