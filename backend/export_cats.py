import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category, SubCategory

cats = Category.objects.all()
cat_values = []
for c in cats:
    desc = c.description.replace("'", "''") if c.description else ""
    name = c.name.replace("'", "''")
    cat_values.append(f"({c.id}, '{name}', '{desc}', true)")

subs = SubCategory.objects.all()
sub_values = []
for s in subs:
    name = s.name.replace("'", "''")
    sub_values.append(f"({s.id}, {s.category_id}, '{name}')")

with open('cats_utf8.sql', 'w', encoding='utf-8') as f:
    f.write("-- 1. INSERT CATEGORIES\n")
    f.write("INSERT INTO products_category (id, name, description, is_active) VALUES \n")
    f.write(",\n".join(cat_values) + ";\n\n")
    
    f.write("-- 2. INSERT SUBCATEGORIES\n")
    if sub_values:
        f.write("INSERT INTO products_subcategory (id, category_id, name) VALUES \n")
        f.write(",\n".join(sub_values) + ";\n")
