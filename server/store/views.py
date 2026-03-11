from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Sum
from django.http import JsonResponse
from .models import Product, Order

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
    }
    return render(request, 'store/admin/dashboard.html', context)

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
            'stock': product.stock,
            'available': product.available,
            'category__name': product.category.name,
            'category_slug': product.category.slug,
            'is_featured': product.is_featured,
            'image_url': image_url
        })
    
    # Manually adding CORS headers for simplicity
    response = JsonResponse(product_data, safe=False)
    response["Access-Control-Allow-Origin"] = "*"
    return response

def category_list(request):
    from .models import Category
    categories = Category.objects.all()
    category_data = [{'name': c.name, 'slug': c.slug} for c in categories]
    response = JsonResponse(category_data, safe=False)
    response["Access-Control-Allow-Origin"] = "*"
    return response
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
                subject=data.get('subject'),
                message=data.get('message')
            )
            response = JsonResponse({'status': 'success', 'message': 'Thank you for your message!'})
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type"
            return response
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
