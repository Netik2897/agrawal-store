import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

from django.contrib.auth.models import User

# Check and reset password for 'Netik Goyal'
try:
    user = User.objects.get(username='Netik Goyal')
    user.set_password('admin123')
    user.save()
    print("Password for 'Netik Goyal' reset to 'admin123'.")
except User.DoesNotExist:
    # If not found, create it
    User.objects.create_superuser('Netik Goyal', 'admin@example.com', 'admin123')
    print("User 'Netik Goyal' created as superuser with password 'admin123'.")

# Check and reset password for 'admin'
try:
    user = User.objects.get(username='admin')
    user.set_password('admin123')
    user.save()
    print("Password for 'admin' reset to 'admin123'.")
except User.DoesNotExist:
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("User 'admin' created as superuser with password 'admin123'.")
