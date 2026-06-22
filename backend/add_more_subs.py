import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import SubCategory, Category

automobile = Category.objects.filter(name='Automobile').first()
if automobile:
    s1, _ = SubCategory.objects.get_or_create(name='Tyres and Tubes', category=automobile)
    s2, _ = SubCategory.objects.get_or_create(name='Others', category=automobile)
    
    if not s1.icon and automobile.icon:
        s1.icon = automobile.icon
        s1.save()
    if not s2.icon and automobile.icon:
        s2.icon = automobile.icon
        s2.save()

furnitures = Category.objects.filter(name='Furnitures').first()
if furnitures:
    s3, _ = SubCategory.objects.get_or_create(name='Others', category=furnitures)
    if not s3.icon and furnitures.icon:
        s3.icon = furnitures.icon
        s3.save()

for s in SubCategory.objects.filter(name__iexact='others'):
    s.order = 1
    s.save()

print("Subcategories added/verified.")
