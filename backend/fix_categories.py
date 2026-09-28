import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category, SubCategory
from django.db.models import Count

def fix_categories():
    print("Starting category fix...")

    # 3. Remove all duplicates from all categories
    # Subcategory duplicates
    print("Removing duplicate subcategories...")
    for category in Category.objects.all():
        subcategories = SubCategory.objects.filter(category=category)
        seen = set()
        for sub in subcategories:
            if sub.name.lower() in seen:
                print(f"Deleting duplicate subcategory: {sub.name} in {category.name}")
                sub.delete()
            else:
                seen.add(sub.name.lower())

    # Category duplicates
    print("Removing duplicate categories...")
    seen_cats = set()
    for cat in Category.objects.all():
        if cat.name.lower() in seen_cats:
            print(f"Deleting duplicate category: {cat.name}")
            cat.delete()
        else:
            seen_cats.add(cat.name.lower())

    # Helper function to get or create category
    def get_cat(name):
        return Category.objects.filter(name__iexact=name).first()

    # Helper function to add subcategory
    def add_sub(cat, sub_name):
        if cat and not SubCategory.objects.filter(category=cat, name__iexact=sub_name).exists():
            SubCategory.objects.create(category=cat, name=sub_name)
            print(f"Added {sub_name} to {cat.name}")

    # 1. In agriculture sector separate the fertilizer & pesticides sectors
    agri = get_cat('Agriculture')
    if agri:
        # Check if "Fertilizer & Pesticides" exists and split it
        combined = SubCategory.objects.filter(category=agri, name__iexact='Fertilizer & Pesticides').first()
        if combined:
            combined.name = 'Fertilizers'
            combined.save()
            add_sub(agri, 'Pesticides')
        else:
            add_sub(agri, 'Fertilizers')
            add_sub(agri, 'Pesticides')

    # 2. In construction sector add the steel sub sector
    const = get_cat('Construction')
    add_sub(const, 'Steel')

    # 4. In fashion sector add the artificial jewels
    fash = get_cat('Fashion')
    add_sub(fash, 'Artificial Jewels')

    # 6. In automobile sector add the auto mobile parts sub sector
    auto = get_cat('Automobile')
    add_sub(auto, 'Automobile Parts')

    # 7. In event management add the sub sectors wedding service, birthday decoration, corporate event
    event = get_cat('Event Management')
    add_sub(event, 'Wedding Service')
    add_sub(event, 'Birthday Decoration')
    add_sub(event, 'Corporate Event')

    # 8. In mart category add the meat mart subsector, fresh mart.
    mart = get_cat('Mart') or get_cat('Marts')
    add_sub(mart, 'Meat Mart')
    add_sub(mart, 'Fresh Mart')

    # 9. In pharmacy category add the sub sector medicine, baby cares, fitness supplement.
    pharm = get_cat('Pharmacy')
    add_sub(pharm, 'Medicine')
    add_sub(pharm, 'Baby Cares')
    add_sub(pharm, 'Fitness Supplement')

    # 5. Add "Others" as sub sectors for all categories
    for cat in Category.objects.all():
        if not SubCategory.objects.filter(category=cat, name__iexact='Others').exists():
            SubCategory.objects.create(category=cat, name='Others', order=1)
            print(f"Added 'Others' to {cat.name}")
        else:
            # ensure 'Others' has order 1
            other_sub = SubCategory.objects.filter(category=cat, name__iexact='Others').first()
            if other_sub and other_sub.order != 1:
                other_sub.order = 1
                other_sub.save()

    print("Finished fixing categories!")

if __name__ == '__main__':
    fix_categories()
