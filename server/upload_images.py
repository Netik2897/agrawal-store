import os
import django
from django.core.files import File
import cloudinary
import cloudinary.uploader

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

from django.conf import settings
from store.models import Product

# Manual config for the uploader since it's not a Django storage call
if hasattr(settings, 'CLOUDINARY_STORAGE'):
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
        api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
        api_secret=settings.CLOUDINARY_STORAGE['API_SECRET']
    )

def upload_local_images():
    print("Starting image upload to Cloudinary...")
    print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")
    products = Product.objects.all()
    for product in products:
        if product.image:
            # Get the path to the local file
            img_path = str(product.image)
            if img_path.startswith('media/'):
                img_path = img_path[len('media/'):]
            
            local_path = os.path.join(settings.MEDIA_ROOT, img_path)
            if os.path.exists(local_path):
                print(f"Uploading {local_path} for product {product.name}...")
                try:
                    # Keep extension as part of public_id to match Django storage behavior
                    public_id = f"media/{img_path}"
                    result = cloudinary.uploader.upload(
                        local_path,
                        public_id=public_id,
                        overwrite=True,
                        resource_type="image"
                    )
                    print(f"Successfully uploaded: {result['secure_url']}")
                except Exception as e:
                    print(f"Error uploading {local_path}: {e}")
            else:
                print(f"Local file not found: {local_path}")

if __name__ == "__main__":
    upload_local_images()
