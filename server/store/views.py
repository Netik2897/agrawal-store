from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Sum
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from .models import Product, Order, MetalRate, ContactMessage, Category
import json

@staff_member_required
def admin_dashboard(request):
    product_count = Product.objects.count()
    order_count = Order.objects.count()
    total_sales = Order.objects.filter(status='Completed').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    latest_orders = Order.objects.order_by('-created_at')[:5]
    from .models import ContactMessage
    message_count = ContactMessage.objects.count()
    
    context = {
        'product_count': product_count,
        'order_count': order_count,
        'message_count': message_count,
        'total_sales': total_sales,
        'latest_orders': latest_orders,
        'admin_name': request.user.first_name or request.user.username or "Netik Agrawal"
    }
    return render(request, 'store/admin/dashboard.html', context)

def home(request):
    return render(request, 'index.html')

def catalog_page(request):
    return render(request, 'catalog.html')

def about_page(request):
    return render(request, 'about.html')

def contact_page(request):
    return render(request, 'contact.html')

def account_page(request):
    return render(request, 'account.html')

def product_list(request):
    products = Product.objects.all()
    product_data = []
    
    for product in products:
        image_url = ""
        if product.image:
            image_url = request.build_absolute_uri(product.image.url)
            
        product_data.append({
            'id': product.id,
            'name': product.name,
            'slug': product.slug,
            'description': product.description,
            'price': str(product.price),
            'weight': float(product.weight),
            'metal_type': product.metal_type,
            'making_charges': str(product.making_charges),
            'stock': product.stock,
            'available': product.available,
            'category__name': product.category.name,
            'category_slug': product.category.slug,
            'is_featured': product.is_featured,
            'image_url': image_url
        })
    
    return JsonResponse(product_data, safe=False)

def category_list(request):
    from .models import Category
    categories = Category.objects.all()
    category_data = [{'name': c.name, 'slug': c.slug} for c in categories]
    return JsonResponse(category_data, safe=False)
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def submit_contact_form(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            from .models import ContactMessage
            ContactMessage.objects.create(
                name=data.get('name'),
                email=data.get('email'),
                phone=data.get('phone'),
                subject=data.get('subject'),
                message=data.get('message')
            )
            return JsonResponse({'status': 'success', 'message': 'Thank you for your message!'})
        except Exception as e:
            response = JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            response["Access-Control-Allow-Origin"] = "*"
            return response
    
    # Handle OPTIONS for CORS preflight
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    return JsonResponse({'status': 'error', 'message': 'Only POST method allowed'}, status=405)

@csrf_exempt
def user_register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('email') # Use email as username
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('name')

            if User.objects.filter(username=username).exists():
                return JsonResponse({'status': 'error', 'message': 'User already exists'}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password, first_name=first_name)
            login(request, user)
            
            response = JsonResponse({'status': 'success', 'message': 'Registered successfully'})
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'POST only'}, status=405)

@csrf_exempt
def user_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('email')
            password = data.get('password')
            
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                response = JsonResponse({
                    'status': 'success', 
                    'user': {
                        'name': user.first_name or user.username,
                        'email': user.email
                    }
                })
                response["Access-Control-Allow-Origin"] = "*"
                return response
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid credentials'}, status=401)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'POST only'}, status=405)

def user_logout(request):
    logout(request)
    response = JsonResponse({'status': 'success'})
    response["Access-Control-Allow-Origin"] = "*"
    return response

def get_user_profile(request):
    if request.user.is_authenticated:
        response = JsonResponse({
            'status': 'success',
            'user': {
                'name': request.user.first_name or request.user.username,
                'email': request.user.email
            }
        })
    else:
        response = JsonResponse({'status': 'error', 'message': 'Not authenticated'}, status=401)
    
    response["Access-Control-Allow-Origin"] = "*"
    return response

def metal_rates(request):
    rates = MetalRate.objects.all()
    rate_data = {rate.metal_type: str(rate.rate_per_gram) for rate in rates}
    
    # Provide default if no rates set in DB yet
    if not rate_data:
        rate_data = {
            'GOLD_24K': '7350.00',
            'GOLD_22K': '6850.00',
            'SILVER': '92.00'
        }
        
    response = JsonResponse(rate_data)
    response["Access-Control-Allow-Origin"] = "*"
    return response

def sitemap(request):
    """Dynamic sitemap for SEO"""
    from django.http import HttpResponse
    import datetime
    
    base_url = "https://premgold.pythonanywhere.com"
    pages = [
        {"loc": "/", "priority": "1.0"},
        {"loc": "/catalog/", "priority": "0.9"},
        {"loc": "/about/", "priority": "0.8"},
        {"loc": "/contact/", "priority": "0.8"},
    ]
    
    # Add products to sitemap
    products = Product.objects.filter(available=True)
    for product in products:
        pages.append({
            "loc": f"/catalog/?cat={product.category.slug}",
            "priority": "0.6"
        })

    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    for page in pages:
        xml.append('  <url>')
        xml.append(f'    <loc>{base_url}{page["loc"]}</loc>')
        xml.append(f'    <lastmod>{today}</lastmod>')
        xml.append(f'    <priority>{page["priority"]}</priority>')
        xml.append('  </url>')
        
    xml.append('</urlset>')
    
    return HttpResponse("\n".join(xml), content_type="application/xml")
