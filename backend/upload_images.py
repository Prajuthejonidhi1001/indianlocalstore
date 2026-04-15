import os
import django
from django.core.files import File

# Initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category, SubCategory

media_root = 'c:/indianlocalstore/backend/media'

print("Uploading Category Images...")
for category in Category.objects.all():
    if category.icon and category.icon.name:
        # Avoid double-uploading if it's already a full cloudinary URL (just in case)
        if category.icon.name.startswith('http'):
            continue
            
        local_path = os.path.join(media_root, category.icon.name)
        if os.path.exists(local_path):
            with open(local_path, 'rb') as f:
                # This automatically uploads to Cloudinary via django-cloudinary-storage
                category.icon.save(os.path.basename(category.icon.name), File(f), save=True)
                print(f"Uploaded {category.name}")
        else:
            print(f"Missing local file for {category.name}: {local_path}")

print("Uploading SubCategory Images...")
for sub in SubCategory.objects.all():
    if sub.icon and sub.icon.name:
        if sub.icon.name.startswith('http'):
            continue
            
        local_path = os.path.join(media_root, sub.icon.name)
        if os.path.exists(local_path):
            with open(local_path, 'rb') as f:
                sub.icon.save(os.path.basename(sub.icon.name), File(f), save=True)
                print(f"Uploaded {sub.name}")
        else:
            print(f"Missing local file for {sub.name}: {local_path}")

print("Done uploading images!")
