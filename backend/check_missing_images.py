import os
import django
import sys

sys.path.append('c:\\indianlocalstore\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import SubCategory
from django.conf import settings

missing = []
for s in SubCategory.objects.all():
    if not s.icon:
        missing.append(s.name)
        continue
    
    # Check if the file exists on the local filesystem
    file_path = os.path.join(settings.MEDIA_ROOT, s.icon.name.replace('media/', ''))
    if not os.path.exists(file_path):
        missing.append(s.name)

print("Missing:", len(missing))
for m in missing:
    print("-", m)
