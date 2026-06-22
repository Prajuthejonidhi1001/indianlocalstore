import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import SubCategory
from django.core.files import File

images = [
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\four_wheelers_1781287780229.png", "Four wheelers", "Second Hand Vehicles"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\others_furnitures_1781287791135.png", "Others", "Furnitures"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\heavy_vehicles_1781287804085.png", "Heavy vehicles", "Second Hand Vehicles"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\medicines_1781287815859.png", "Medicines", "Pharmacy"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\hardware_construction_1781287827662.png", "Hardware", "Construction"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\paints_construction_1781287838476.png", "Paints", "Construction"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\others_pharmacy_1781287850440.png", "Others", "Pharmacy"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\baby_care_1781287863038.png", "Baby care", "Pharmacy"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\one_gram_silver_1781287875619.png", "One gram silver store", "Fashion"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\rental_store_1781287889790.png", "Rental store", "Fashion"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\beautician_1781287901541.png", "Beautician", "Fashion"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\tiles_granites_1781287911871.png", "Tiles & granites", "Construction"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\birthday_decor_1781287921891.png", "Birthday decor", "Event Management"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\corporate_events_1781287933068.png", "Corporate events", "Event Management"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\home_furnitures_1781287951194.png", "Home furnitures", "Furnitures"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\pvc_plastic_1781287963078.png", "PVC or plastic", "Furnitures"),
    (r"C:\Users\praju\.gemini\antigravity\brain\00d89ed3-372c-473c-94fa-ea650b0c1f28\artificial_jewelry_1781287975152.png", "Artificial jewelry", "Fashion"),
]

for img_path, subcat_name, cat_name in images:
    try:
        subcat = SubCategory.objects.filter(name=subcat_name, category__name=cat_name).first()
        if subcat and os.path.exists(img_path):
            with open(img_path, 'rb') as f:
                filename = os.path.basename(img_path)
                subcat.icon.save(filename, File(f), save=True)
                print(f"Successfully uploaded image for {subcat_name}")
        else:
            print(f"Skipping {subcat_name}: SubCategory not found or image missing.")
    except Exception as e:
        print(f"Error saving {subcat_name}: {e}")

print("Done applying first 17 images.")
