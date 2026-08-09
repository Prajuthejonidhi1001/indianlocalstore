import os
import django
import sys
import shutil

sys.path.append('c:\\indianlocalstore\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category
from django.core.files import File

# Ensure media/categories exists
os.makedirs('c:\\indianlocalstore\\backend\\media\\categories', exist_ok=True)

artifact_dir = 'C:\\Users\\praju\\.gemini\\antigravity\\brain\\5ce3a14f-7502-4bc9-bdaa-90440576ef36'

categories = [
    ('Agriculture', 'cat_agriculture_1780936159975.png'),
    ('Automobile', 'cat_automobile_1780936186896.png'),
    ('Construction', 'cat_construction_1780936200097.png'),
    ('Electronics', 'cat_electronics_1780936212867.png'),
    ('Event Management', 'cat_event_management_1780936239934.png'),
    ('Fashion', 'cat_fashion_1780936172302.png'),
    ('Furnitures', 'cat_furnitures_1780936252885.png'),
    ('Marts', 'cat_marts_1780936264469.png'),
    ('Pharmacy', 'cat_pharmacy_1780936287985.png'),
    ('Second Hand Vehicles', 'cat_second_hand_vehicles_1780936277793.png'),
    ('Traders', 'cat_traders_1780936228385.png'),
]

for name, filename in categories:
    source_path = os.path.join(artifact_dir, filename)
    if os.path.exists(source_path):
        cat, created = Category.objects.get_or_create(name=name)
        with open(source_path, 'rb') as f:
            cat.icon.save(filename, File(f), save=True)
        print(f"Created category: {name}")
    else:
        # Fallback if specific file missing
        cat, created = Category.objects.get_or_create(name=name)
        print(f"Created category (no icon found): {name}")

print("Categories restored successfully.")
