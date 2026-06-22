import os
import django
import sys

sys.path.append('c:\\indianlocalstore\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, OTPVerification

print("Starting Cleanup...")

deleted_otps = OTPVerification.objects.all().delete()
print(f"Deleted OTPs: {deleted_otps[0]}")

deleted_users = User.objects.all().delete()
print(f"Deleted Users and related data: {deleted_users[0]}")

print("Creating Admin User...")
admin = User.objects.create_superuser(
    username="admin",
    email="admin@indianlocalstore.com",
    password="AdminTest!123",
    first_name="Admin",
    last_name="User"
)
print("Admin created successfully!")
print("Cleanup complete.")
