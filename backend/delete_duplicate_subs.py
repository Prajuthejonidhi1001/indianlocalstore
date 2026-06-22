import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import SubCategory, Category

def remove_duplicates():
    # 1. In Automobile (which might be "Automobile" or "Automobiles")
    try:
        auto_cat = Category.objects.get(name__icontains='Automobile')
        print(f"Found Category: {auto_cat.name}")
        
        # Tyres and tubes
        subs = SubCategory.objects.filter(category=auto_cat, name__icontains='Tyres')
        if subs.count() > 1:
            print(f"Found {subs.count()} 'Tyres' duplicates. Deleting all but first.")
            for s in subs[1:]:
                s.delete()
        elif subs.count() == 1:
            # Wait, the user said "remove tyres and tubes duplicate two wheelers and four wheelers lubricants and oils"
            # Maybe they want to delete all instances of "tyres and tubes", or just the duplicates?
            # "remove tyres and tubes duplicate two wheelers and four wheelers lubricants and oils"
            pass
            
        # Two wheelers
        subs = SubCategory.objects.filter(category=auto_cat, name__icontains='Two wheeler')
        if subs.count() > 1:
            print(f"Found {subs.count()} 'Two wheeler' duplicates. Deleting all but first.")
            for s in subs[1:]:
                s.delete()
                
        # Four wheelers
        subs = SubCategory.objects.filter(category=auto_cat, name__icontains='Four wheeler')
        if subs.count() > 1:
            print(f"Found {subs.count()} 'Four wheeler' duplicates. Deleting all but first.")
            for s in subs[1:]:
                s.delete()
                
        # Lubricants and oils
        subs = SubCategory.objects.filter(category=auto_cat, name__icontains='Lubricant')
        if subs.count() > 1:
            print(f"Found {subs.count()} 'Lubricants' duplicates. Deleting all but first.")
            for s in subs[1:]:
                s.delete()
                
    except Exception as e:
        print("Error in Automobile:", e)
        
    # 2. In Electronics
    try:
        elec_cat = Category.objects.get(name__icontains='Electronics')
        print(f"Found Category: {elec_cat.name}")
        
        # To find duplicates in Electronics, we group by name (case-insensitive)
        seen = {}
        for sub in SubCategory.objects.filter(category=elec_cat):
            name_lower = sub.name.lower().strip()
            # Try to match similar names like "mobile" and "mobiles"
            if "mobile" in name_lower: name_lower = "mobile"
            if "laptop" in name_lower: name_lower = "laptop"
            if "appliance" in name_lower: name_lower = "home appliance"
            
            if name_lower in seen:
                print(f"Deleting duplicate in Electronics: '{sub.name}' (duplicate of '{seen[name_lower].name}')")
                sub.delete()
            else:
                seen[name_lower] = sub
                
    except Exception as e:
        print("Error in Electronics:", e)

if __name__ == "__main__":
    remove_duplicates()
