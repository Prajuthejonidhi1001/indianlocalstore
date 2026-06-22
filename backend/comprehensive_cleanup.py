import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import SubCategory, Category

def clean_database():
    # 1. Remove explicit subcategories
    
    # Electronics: remove Laptops, Mobiles
    try:
        elec_cat = Category.objects.get(name__icontains='Electronics')
        SubCategory.objects.filter(category=elec_cat, name__icontains='Laptop').delete()
        SubCategory.objects.filter(category=elec_cat, name__icontains='Mobile').delete()
        print("Removed Laptops and Mobiles from Electronics")
    except Exception as e:
        print("Electronics explicit delete error:", e)

    # Pharmacy: remove First Aid (fits aid)
    try:
        pharm_cat = Category.objects.get(name__icontains='Pharmacy')
        SubCategory.objects.filter(category=pharm_cat, name__icontains='First Aid').delete()
        print("Removed First Aid from Pharmacy")
    except Exception as e:
        print("Pharmacy explicit delete error:", e)

    # 2. Remove duplicates from ALL categories
    for cat in Category.objects.all():
        seen_names = set()
        subs = SubCategory.objects.filter(category=cat).order_by('id')
        
        for sub in subs:
            # Normalize name to catch duplicates like "Wedding Services" vs "Wedding services"
            norm_name = sub.name.lower().strip()
            
            # Special normalization for Event Management
            if "wedding" in norm_name: norm_name = "wedding"
            if "birthday" in norm_name: norm_name = "birthday"
            if "corporate" in norm_name: norm_name = "corporate"
            
            # Special normalization for others
            if "tyre" in norm_name: norm_name = "tyres"
            if "baby" in norm_name: norm_name = "baby care"
            if "two wheeler" in norm_name: norm_name = "two wheelers"
            if "four wheeler" in norm_name: norm_name = "four wheelers"

            if norm_name in seen_names:
                print(f"Deleting duplicate in {cat.name}: {sub.name}")
                sub.delete()
            else:
                seen_names.add(norm_name)

if __name__ == "__main__":
    clean_database()
