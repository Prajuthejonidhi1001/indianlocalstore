import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category

ALLOWED_CATS = [
    'Agriculture',
    'Automobile',
    'Construction',
    'Electronics',
    'Event Management',
    'Fashion',
    'Furnitures',
    'Marts',
    'Pharmacy',
    'Second Hand Vehicles',
    'Traders'
]

def run():
    print("Deleting extra categories...")
    for cat in Category.objects.all():
        if cat.name not in ALLOWED_CATS:
            print(f"Deleting category: {cat.name}")
            cat.delete()
    print("Remaining categories:")
    print([c.name for c in Category.objects.all()])

if __name__ == "__main__":
    run()
