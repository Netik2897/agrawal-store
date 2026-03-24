import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

from django.contrib.auth.models import User

print("Existing Users:")
for user in User.objects.all():
    print(f"- Username: '{user.username}', Email: '{user.email}', Is Staff: {user.is_staff}, Is Superuser: {user.is_superuser}")
