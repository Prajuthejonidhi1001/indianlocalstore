import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from shops.models import Shop

def run():
    shops = Shop.objects.all()
    count = 0
    for shop in shops:
        if shop.category is None:
            first_product = shop.seller.products.first()
            if first_product:
                shop.category = first_product.category
                shop.subcategory = first_product.subcategory
                shop.save()
                count += 1
                cat_name = shop.category.name if shop.category else "None"
                print(f"Mapped {shop.name} to {cat_name}")
    print(f"Successfully mapped {count} shops.")

if __name__ == '__main__':
    run()
