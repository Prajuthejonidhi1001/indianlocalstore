import os
import sys
import django

sys.path.append(r'c:\indianlocalstore\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.files import File
from products.models import Category, SubCategory

cat = Category.objects.get(name="Electronics")
sub = cat.subcategories.get(name="Others")

path = r'C:\indianlocalstore\icon for app\electrical others.png'

with open(path, 'rb') as f:
    sub.icon.save('electrical_others.png', File(f), save=True)
    print(f"Updated SubCategory {sub.name} in {cat.name}")

