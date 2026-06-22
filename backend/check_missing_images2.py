import os
import django
import sys

sys.path.append('c:\\indianlocalstore\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import SubCategory
import requests

missing = []
for s in SubCategory.objects.all():
    if not s.icon or not s.icon.name:
        missing.append(f"{s.name} ({s.category.name})")
        continue

    # Test the Cloudinary URL
    try:
        url = s.icon.url
        # If it throws an error or if the URL returns 404
        r = requests.head(url)
        if r.status_code != 200:
            missing.append(f"{s.name} ({s.category.name})")
    except Exception as e:
        missing.append(f"{s.name} ({s.category.name})")

print("Missing:", len(missing))
for m in missing:
    print("-", m)
