import os
import django
from django.core.files import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from products.models import SubCategory

image_map = {
    'Accessories': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\elec_accessories_1781496891526.png',
    'Audio and video': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\audio_video_1781496905391.png',
    'Bike Accessories': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\bike_accessories_1781496932983.png',
    'Car Accessories': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\car_accessories_1781496945358.png',
    'Carpentry wood': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\carpentry_wood_1781496958047.png',
    'Commercial vehicles': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\commercial_vehicles_1781496972400.png',
    'Convenience store': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\convenience_store_1781496985056.png',
    'Cow trader': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\cow_trader_1781497011650.png',
    'Electric items': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\electric_items_1781497029369.png',
    'Fresh marts': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\fresh_marts_1781497049190.png',
    'Meat mart': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\meat_mart_1781497062426.png',
    'Mobiles and Tablets': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\mobiles_tablets_1781497077014.png',
    'Modified vehicles': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\modified_vehicles_1781497092408.png',
    'PC and Laptops': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\pc_laptops_1781497105793.png',
    'Pet traders': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\pet_traders_1781497128592.png',
    'PVC fabrication': r'C:\Users\praju\.gemini\antigravity\brain\17ed8b6d-8142-44ec-92e4-d27dfbadd90a\pvc_fabrication_1781497140822.png',
}

for name, path in image_map.items():
    subcats = SubCategory.objects.filter(name=name)
    if not subcats.exists():
        print(f"Subcategory not found for name: {name}")
    for sub in subcats:
        try:
            with open(path, 'rb') as f:
                sub.icon.save(f'sub_{sub.id}.png', File(f), save=True)
                print(f'Saved {name} for id {sub.id}')
        except Exception as e:
            print(f"Failed {name} for id {sub.id}: {e}")
