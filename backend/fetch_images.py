import os
import django
import requests
from django.core.files.base import ContentFile
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category, SubCategory

# High quality keyword mapping
KEYWORDS = {
    # Categories
    "Agriculture": "farming,tractor,agriculture",
    "Fashion": "clothing,fashion,boutique",
    "Automobile": "cars,motorcycles,mechanic",
    "Construction": "construction,hardware,building",
    "Electronics": "smartphone,laptop,gadgets",
    "Traders": "trader,livestock,farming",
    "Event Management": "wedding,event,stage",
    "Furnitures": "furniture,sofa,interior",
    "Marts": "supermarket,grocery,store",
    "Second Hand Vehicles": "usedcars,motorcycle,dealership",
    "Pharmacy": "pharmacy,medicine,drugstore",
    
    # Subcategories (fallback to their name if not specified)
    "Saree pinning": "saree,indian clothing",
    "Beautician": "salon,makeup,beauty",
    "Tailor": "tailor,sewing,fabric",
    "Mobiles": "smartphone,iphone",
    "Laptops": "laptop,macbook",
    "Pet traders": "pets,dog,cat",
    "Sheep trader": "sheep,flock",
    "Cow trader": "cow,cattle",
    "Medicines": "pills,medicine",
    "Baby care": "baby,diapers",
    "Meat mart": "butcher,meat",
    "Hardware": "tools,hardware",
}

def fetch_image(keyword):
    # Using loremflickr which redirects to an image
    url = f"https://loremflickr.com/600/400/{keyword.replace(' ', ',')}/all"
    try:
        print(f"Fetching: {url}")
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.content
    except Exception as e:
        print(f"Failed to fetch {keyword}: {e}")
    return None

def run():
    print("Fetching images for Categories...")
    for cat in Category.objects.all():
        kw = KEYWORDS.get(cat.name, cat.name.lower())
        img_data = fetch_image(kw)
        if img_data:
            filename = f"cat_{slugify(cat.name)}.jpg"
            cat.icon.save(filename, ContentFile(img_data), save=True)
            print(f"Saved category: {cat.name}")

    print("Fetching images for SubCategories...")
    for sub in SubCategory.objects.all():
        kw = KEYWORDS.get(sub.name, sub.name.lower() + "," + sub.category.name.lower())
        img_data = fetch_image(kw)
        if img_data:
            filename = f"sub_{slugify(sub.name)}.jpg"
            sub.icon.save(filename, ContentFile(img_data), save=True)
            print(f"Saved subcategory: {sub.name}")
            
if __name__ == "__main__":
    run()
