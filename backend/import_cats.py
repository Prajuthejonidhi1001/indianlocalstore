import os
import sys
import json
import django

sys.path.append('c:\\indianlocalstore\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category, SubCategory

def run():
    with open('../datadump_utf8.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # First, import Categories
    cat_mapping = {} # Old PK -> New Category instance
    for obj in data:
        if obj['model'] == 'products.category':
            pk = obj['pk']
            fields = obj['fields']
            cat, created = Category.objects.get_or_create(
                name=fields['name'],
                defaults={'icon': fields.get('icon', '')}
            )
            cat_mapping[pk] = cat
            print(f"Category '{cat.name}' {'created' if created else 'exists'}.")

    # Next, import Subcategories
    for obj in data:
        if obj['model'] == 'products.subcategory':
            fields = obj['fields']
            old_cat_id = fields['category']
            
            # Map old category ID to the live category instance
            if old_cat_id in cat_mapping:
                live_cat = cat_mapping[old_cat_id]
            else:
                try:
                    live_cat = Category.objects.get(id=old_cat_id)
                except Category.DoesNotExist:
                    print(f"Warning: Category ID {old_cat_id} not found for subcategory {fields['name']}")
                    continue

            subcat, created = SubCategory.objects.get_or_create(
                name=fields['name'],
                category=live_cat,
                defaults={
                    'order': fields.get('order', 0),
                    'icon': fields.get('icon', '')
                }
            )
            print(f"SubCategory '{subcat.name}' {'created' if created else 'exists'}.")

if __name__ == '__main__':
    run()
