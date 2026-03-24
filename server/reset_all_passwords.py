import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

from django.contrib.auth.models import User

# Reset password for all superusers/staff to 'admin123'
users = User.objects.filter(is_superuser=True) | User.objects.filter(is_staff=True)
for user in users:
    user.set_password('admin123')
    user.save()
    print(f"Password for '{user.username}' reset to 'admin123'.")
