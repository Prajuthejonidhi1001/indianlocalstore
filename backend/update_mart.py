import os
import sys
import django

sys.path.append(r'c:\indianlocalstore\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.files import File
from products.models import Category

cat = Category.objects.get(name="Mart")
path = r'C:\indianlocalstore\icon for app\Fresh_Mart.png' # Since there's no mart main, we can use Fresh Mart as the main icon for Mart

with open(path, 'rb') as f:
    cat.icon.save('mart_main.png', File(f), save=True)
    print(f"Updated Category {cat.name}")

