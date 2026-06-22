import os
import django
import sys
import json

sys.path.append('c:\\indianlocalstore\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import SubCategory
import requests

missing = []
for s in SubCategory.objects.all():
    if not s.icon or not s.icon.name:
        missing.append({"id": s.id, "name": s.name, "category": s.category.name})
        continue

    try:
        url = s.icon.url
        r = requests.head(url)
        if r.status_code != 200:
            missing.append({"id": s.id, "name": s.name, "category": s.category.name})
    except Exception as e:
        missing.append({"id": s.id, "name": s.name, "category": s.category.name})

with open("missing_subs.json", "w") as f:
    json.dump(missing, f)

print(f"Wrote {len(missing)} missing to missing_subs.json")
