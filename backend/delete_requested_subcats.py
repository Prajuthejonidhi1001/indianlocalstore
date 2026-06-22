import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import SubCategory, Category

def clean():
    # In automobiles: remove tyres and tubes, duplicate two wheelers, four wheelers, lubricants and oils
    auto_cat = Category.objects.filter(name__icontains='Automobile').first()
    if auto_cat:
        SubCategory.objects.filter(category=auto_cat, name__icontains='tyre').delete()
        SubCategory.objects.filter(category=auto_cat, name__icontains='tube').delete()
        SubCategory.objects.filter(category=auto_cat, name__icontains='lubricant').delete()
        SubCategory.objects.filter(category=auto_cat, name__icontains='oil').delete()
        SubCategory.objects.filter(category=auto_cat, name__icontains='two wheeler').delete()
        SubCategory.objects.filter(category=auto_cat, name__icontains='four wheeler').delete()

    # In electronics: remove duplicate and remove laptops and mobile
    elec_cat = Category.objects.filter(name__icontains='Electronic').first()
    if elec_cat:
        SubCategory.objects.filter(category=elec_cat, name__icontains='laptop').delete()
        SubCategory.objects.filter(category=elec_cat, name__icontains='mobile').delete()
        
    # Pharmacy: fits aid in pharmacy only which are there present in the parent category
    pharm_cat = Category.objects.filter(name__icontains='Pharmacy').first()
    if pharm_cat:
        SubCategory.objects.filter(category=pharm_cat, name__icontains='first aid').delete()
        SubCategory.objects.filter(category=pharm_cat, name__icontains='fits aid').delete()

    # Ensure no duplicates globally (both within category and across all if needed?)
    # The prompt says "remove duplicates from aall sub categories of each categories"
    # Meaning no duplicate names inside the same category.
    for cat in Category.objects.all():
        seen_names = set()
        for sub in SubCategory.objects.filter(category=cat).order_by('id'):
            norm = sub.name.lower().strip()
            # Catch "wedding services" vs "wedding" etc if needed
            if norm in seen_names:
                sub.delete()
            else:
                seen_names.add(norm)

    print("Cleanup successful")

if __name__ == '__main__':
    clean()
