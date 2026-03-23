
import os
import django

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrawal_store_backend.settings')
django.setup()

from django.contrib.auth.models import User

def fix_passwords():
    users_to_fix = ['admin', 'netik']
    fixed = []
    
    for username in users_to_fix:
        user = User.objects.filter(username=username).first()
        if not user:
            # Create user if it doesn't exist
            user = User.objects.create_superuser(username, f'{username}@example.com', 'admin123')
            fixed.append(f"Created AND Fixed password for user: {username}")
        else:
            user.set_password('admin123')
            user.save()
            fixed.append(f"Fixed password for existing user: {username}")
            
    for msg in fixed:
        print(f"✅ {msg}")
    print("\n🚀 You can now login at https://premgold.pythonanywhere.com/admin/ with:")
    print("Username: admin (or netik)")
    print("Password: admin123")

if __name__ == "__main__":
    fix_passwords()
