import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category, SubCategory

# Mapping for Category renaming
CAT_RENAME = {
    "Traders": "Fodders",
}

# Desired Subcategories per Category
DESIRED_SUBCATS = {
    "Agriculture": [
        "AGRI equipment",
        "Feeds & cattle feed",
        "Fertilizer & pesticides",
        "Nursery",
        "Others"
    ],
    "Fashion": [
        "Textile",
        "Shoes",
        "Artificial jewelry",
        "One Gram silver store",
        "Rental store",
        "Saree",
        "Clothes",
        "Beautician",
        "Tailor"
    ],
    "Automobile": [
        "Two wheelers",
        "Four wheelers",
        "Modified vehicles",
        "Tyres and tubes"
    ],
    "Construction": [
        "Hardware",
        "Paints",
        "Electric items",
        "Tiles & Granites",
        "Carpentry wood",
        "PVC Fabrication",
        "Others"
    ],
    "Electronics": [
        "Mobiles",
        "Laptops",
        "Home appliances",
        "Audio and video",
        "Accessories",
        "Others"
    ],
    "Fodders": [
        "Sheep fodder",
        "Cow fodder",
        "Sailage",
        "Pet foods",
        "Others"
    ],
    "Event Management": [
        "Stage decorators",
        "Catering",
        "Photography studio",
        "Wedding services",
        "Birthday decor",
        "Corporate events",
        "Others"
    ],
    "Furnitures": [
        "Home Furnitures",
        "PVC or plastic",
        "Others"
    ],
    "Marts": [
        "Super markets",
        "Convenience store",
        "Wholesale market",
        "Meat mart",
        "Fresh marts"
    ],
    "Second hand vehicles": [
        "Two wheelers",
        "Four wheelers",
        "Commercial vehicles",
        "Heavy vehicles"
    ],
    "Pharmacy": [
        "Medicines",
        "Baby care",
        "Others"
    ]
}

def run():
    print("Renaming Main Categories if needed...")
    for old_name, new_name in CAT_RENAME.items():
        try:
            cat = Category.objects.get(name__iexact=old_name)
            cat.name = new_name
            cat.save()
            print(f"Renamed category '{old_name}' to '{new_name}'")
        except Category.DoesNotExist:
            print(f"Category '{old_name}' not found. Already renamed?")

    print("Syncing SubCategories...")
    for cat_name, desired_subcats in DESIRED_SUBCATS.items():
        try:
            # Try to get the category (case-insensitive to be safe)
            cat = Category.objects.get(name__iexact=cat_name)
        except Category.DoesNotExist:
            print(f"ERROR: Main category '{cat_name}' not found!")
            continue

        # Get existing subcategories for this category
        existing_subcats = list(SubCategory.objects.filter(category=cat))
        existing_names = [s.name for s in existing_subcats]

        # 1. Add missing subcategories
        for ds in desired_subcats:
            # We do a case-insensitive check to see if it exists
            if not any(e.lower() == ds.lower() for e in existing_names):
                print(f"Adding new subcategory '{ds}' to '{cat.name}'")
                SubCategory.objects.create(name=ds, category=cat)

        # 2. Delete unwanted subcategories
        for es in existing_subcats:
            if not any(ds.lower() == es.name.lower() for ds in desired_subcats):
                # Before deleting, check if there's a typo-match we can just rename
                # (We already added the desired ones above, so deleting here is fine if we don't care about the image)
                print(f"Deleting unwanted subcategory '{es.name}' from '{cat.name}'")
                es.delete()

    print("Taxonomy update complete!")

if __name__ == "__main__":
    run()
