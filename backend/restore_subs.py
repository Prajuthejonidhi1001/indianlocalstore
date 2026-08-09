import os
import django
import sys

sys.path.append('c:\\indianlocalstore\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category, SubCategory
from django.core.files import File

artifact_dir = 'C:\\Users\\praju\\.gemini\\antigravity\\brain\\5ce3a14f-7502-4bc9-bdaa-90440576ef36'

subs = [
    ('Hardware', 'Construction', None),
    ('Paints', 'Construction', None),
    ('Tiles & granites', 'Construction', None),
    ('Agri equipment', 'Agriculture', 'sub_agri_equipment_1780936556290.png'),
    ('Feeds & cattle feed', 'Agriculture', 'sub_feeds_1780936569179.png'),
    ('Fertilizer & pesticides', 'Agriculture', 'sub_fertilizer_1780936581477.png'),
    ('Nursery', 'Agriculture', 'sub_nursery_1780936593950.png'),
    ('Laptops', 'Electronics', None),
    ('Home appliances', 'Electronics', None),
    ('Silage', 'Traders', None),
    ('Catering', 'Event Management', None),
    ('Photography studio', 'Event Management', None),
    ('Shoes', 'Fashion', 'sub_shoes_1780936620161.png'),
    ('Textile', 'Fashion', 'sub_textile_1780936607717.png'),
]

for sub_name, cat_name, filename in subs:
    try:
        cat = Category.objects.get(name=cat_name)
        sub, created = SubCategory.objects.get_or_create(category=cat, name=sub_name)
        
        if filename:
            source_path = os.path.join(artifact_dir, filename)
            if os.path.exists(source_path):
                with open(source_path, 'rb') as f:
                    sub.icon.save(filename, File(f), save=True)
                print(f"Created subcategory with image: {sub_name}")
            else:
                print(f"Created subcategory (image missing): {sub_name}")
        else:
            print(f"Created subcategory: {sub_name}")
            
    except Category.DoesNotExist:
        print(f"Category {cat_name} not found for {sub_name}")

print("Subcategories restored successfully.")
