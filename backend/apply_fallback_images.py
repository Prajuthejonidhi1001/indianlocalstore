import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import SubCategory

subcats = SubCategory.objects.all()
count = 0
for subcat in subcats:
    if not subcat.icon and subcat.category.icon:
        subcat.icon = subcat.category.icon
        subcat.save()
        count += 1
        print(f"Applied parent category image for: {subcat.name}")

print(f"Done! Fallback images applied to {count} subcategories.")
