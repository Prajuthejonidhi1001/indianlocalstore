import os
import django
import sys
import time

sys.path.append('c:\\indianlocalstore\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from users.models import OTPVerification

client = Client()

print("--- Step 1: Sending OTP ---")
email = f"test_{int(time.time())}@example.com"
r1 = client.post("/users/send_otp/", {"email": email}, content_type="application/json", HTTP_HOST="localhost")
print(f"Status: {r1.status_code}")
print(f"Response: {r1.content.decode()}")

print("\n--- Step 2: Fetching OTP from Database ---")
otp_record = OTPVerification.objects.filter(email=email).latest('created_at')
otp_code = otp_record.otp
print(f"Retrieved OTP code: {otp_code}")

print("\n--- Step 3: Registering with OTP ---")
r2 = client.post("/users/register/", {
    "username": f"testuser_{int(time.time())}",
    "email": email,
    "first_name": "Test",
    "last_name": "User",
    "password": "SecurePassword123!",
    "role": "customer",
    "phone": "9999999999",
    "otp": otp_code
}, content_type="application/json")

print(f"Status: {r2.status_code}")
print(f"Response: {r2.content.decode()}")

if r2.status_code == 201:
    print("\n✅ OTP Flow successfully tested!")
else:
    print("\n❌ OTP Flow failed!")
