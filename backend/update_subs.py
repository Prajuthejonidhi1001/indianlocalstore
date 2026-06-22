import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import SubCategory, Category

others_subcats = SubCategory.objects.filter(name__iexact='others')
for s in others_subcats:
    s.order = 1
    s.save()

electronics = Category.objects.filter(name='Electronics').first()
if electronics:
    s1, c1 = SubCategory.objects.get_or_create(name='Mobiles and Tablets', category=electronics)
    s2, c2 = SubCategory.objects.get_or_create(name='PC and Laptops', category=electronics)
    
    if c1 and electronics.icon:
        s1.icon = electronics.icon
        s1.save()
    if c2 and electronics.icon:
        s2.icon = electronics.icon
        s2.save()

print("Subcategories updated and added.")
