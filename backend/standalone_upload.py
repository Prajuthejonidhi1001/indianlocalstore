import os
import sys
import django

# Setup Django
sys.path.append(r'c:\indianlocalstore\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.files import File
from django.db import close_old_connections
from products.models import Category, SubCategory

ICON_DIR = r'C:\indianlocalstore\icon for app'

cat_mappings = {
    "Fashion": "fashion main.png",
    "Electronics": "electronic main.png",
    "Agriculture": "agri main.png",
    "Construction": "construction main.png",
    "Pharmacy": "pharmacy.png",
}

subcat_mappings = {
    # Agriculture
    "Agri equipment": "agri equip.png",
    "Feeds & cattle feed": "agri feed.png",
    "Fertilizers": "fertilizer.jpeg",
    "Nursery": "agri nursary.png",
    "Pesticides": "Pesticide.png",
    "Seeds": "seeds.jpeg",
    
    # Automobile
    "Automobile Parts": "auto mobile parts.jpeg",
    "Commercial": "commercial vehical.png",
    "Four Wheelers": "four wheeler.png",
    "Modified Vehicles": "modified vehical.png",
    "Two Wheelers": "two vehical.png",
    
    # Construction
    "Carpentry & Wood": "carpentry items.png",
    "Electric Items": "electrical items.png",
    "Hardware": "hardware.png",
    "Paints": "paints.png",
    "PVC Fabrication": "fabrication.png",
    "Steel": "steel.png",
    "Tiles & Granite": "tails & granites.png",
    
    # Electronics
    "Accessories": "electronic accesories.png",
    "Audio & Video": "audio&video.png",
    "Home appliances": "home appliances.png",
    "Laptop": "laptops.png",
    "Mobile": "mobile.png",
    
    # Event Management
    "Birthday Decoration": "Birthday decoration.png",
    "Corporate Event": "corporate events.jpeg",
    "Stage Decoration": "stage decoration.png",
    "Wedding Service": "weddind service.png",
    
    # Fashion
    "Artificial Jewels": "artificial jewel.jpeg",
    "Beautician": "Beautician.png",
    "Rental Stores": "Rental Stores.png",
    "Tailors": "tailor.png",
    "Textile": "fashion textile.png",
    
    # Mart
    "Fresh Mart": "Fresh_Mart.png",
    "Meat Mart": "Meat Mart.png",
    
    # Pharmacy
    "Baby Cares": "Baby_Cares.png",
    "Fitness Supplement": "fitness supplement.png",
    "Medicine": "Medicines.png",
    
    # Second Hand Vehicles
    "Commercial Vehicles": "commercial vehical.png",
    "Four Wheeled": "four wheeler.png",
    "Heavy Vehicles": "heavy vehicles.png",
    "Two Wheeled": "two vehical.png",
    
    # Traders
    "Coffee Traders": "Coffee Traders.png",
    "Cow": "cows.png",
    "Goats": "goats.png",
    "Pets": "pets.png",
    "Sheep": "sheeps.png",
    "Silage": "silage.png",
}

others_mappings = {
    "Agriculture": "agri others.png",
    "Automobile": "autobile others.jpeg",
    "Construction": "construction other.png",
    "Event Management": "event management others.png",
    "Fashion": "fashion for others.jpeg",
    "Furnitures": "furniture others.jpeg",
    "Mart": "Mart_Others.png",
    "Pharmacy": "Pharmacy Others.png",
    "Second Hand Vehicles": "others secondhand vehicles.png",
    "Traders": "Traders_others.png",
}

categories = list(Category.objects.prefetch_related('subcategories').all())

for cat in categories:
    close_old_connections()
    if cat.name in cat_mappings:
        path = os.path.join(ICON_DIR, cat_mappings[cat.name])
        if os.path.exists(path):
            try:
                with open(path, 'rb') as f:
                    cat.icon.save(cat_mappings[cat.name], File(f), save=True)
                    print(f"Updated Category {cat.name}")
                    sys.stdout.flush()
            except Exception as e:
                print(f"Failed {cat.name}: {e}")

    for sub in cat.subcategories.all():
        close_old_connections()
        path = None
        if sub.name == "Others" and cat.name in others_mappings:
            path = os.path.join(ICON_DIR, others_mappings[cat.name])
        elif sub.name in subcat_mappings:
            path = os.path.join(ICON_DIR, subcat_mappings[sub.name])
            
        if not path or not os.path.exists(path):
            if sub.name == "Accessories": path = os.path.join(ICON_DIR, "electronic assc.png")
            elif sub.name == "Birthday Decoration": path = os.path.join(ICON_DIR, "birthday decoration.jpeg")
            elif sub.name == "Corporate Event": path = os.path.join(ICON_DIR, "corporate event.jpeg")
            elif sub.name == "Artificial Jewels": path = os.path.join(ICON_DIR, "artificial jewels.jpeg")
            elif sub.name == "Baby Cares": path = os.path.join(ICON_DIR, "baby care product.png")
            elif sub.name == "Fitness Supplement": path = os.path.join(ICON_DIR, "fitness suppliment.png")
            elif sub.name == "Others" and cat.name == "Furnitures": path = os.path.join(ICON_DIR, "furniture other.jpeg")
            elif sub.name == "Others" and cat.name == "Electrical": path = os.path.join(ICON_DIR, "electrical others.png")
            
        if path and os.path.exists(path):
            try:
                with open(path, 'rb') as f:
                    sub.icon.save(os.path.basename(path), File(f), save=True)
                    print(f"Updated SubCategory {sub.name} in {cat.name}")
                    sys.stdout.flush()
            except Exception as e:
                print(f"Failed {sub.name}: {e}")

print("Done uploading icons via Django!")
