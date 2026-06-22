import os
import django
import requests
import re
from django.core.files.base import ContentFile
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category, SubCategory
import urllib.parse
import json

def get_ddg_image(keyword):
    print(f"Searching DDG for: {keyword}")
    try:
        res = requests.post("https://html.duckduckgo.com/html", data={"q": keyword}, headers={"User-Agent": "Mozilla/5.0"})
        # Parse out the vqd from the HTML
        match = re.search(r'vqd=([\d-]+)', res.text)
        if not match:
            return None
        vqd = match.group(1)
        
        # Call the image API
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        }
        params = {
            "l": "us-en",
            "o": "json",
            "q": keyword,
            "vqd": vqd,
            "f": ",,,",
            "p": "1"
        }
        res2 = requests.get("https://duckduckgo.com/i.js", params=params, headers=headers)
        data = res2.json()
        if "results" in data and len(data["results"]) > 0:
            for item in data["results"][:3]: # try up to 3 images
                img_url = item["image"]
                print(f"Found URL: {img_url}")
                img_res = requests.get(img_url, timeout=5)
                if img_res.status_code == 200:
                    return img_res.content
    except Exception as e:
        print(f"Failed DDG search for {keyword}: {e}")
    return None

KEYWORDS = {
    # Categories
    "Agriculture": "indian agriculture farming tractor",
    "Fashion": "indian boutique clothing fashion store",
    "Automobile": "car repair mechanic motorcycle shop",
    "Construction": "building materials hardware store",
    "Electronics": "electronics gadgets store laptops smartphones",
    "Traders": "livestock trader sheep cattle",
    "Event Management": "indian wedding stage decoration events",
    "Furnitures": "wooden furniture sofa showroom",
    "Marts": "supermarket grocery store india",
    "Second Hand Vehicles": "used cars dealership motorcycles",
    "Pharmacy": "pharmacy medical store india",
}

def run():
    print("Fetching images for Categories...")
    for cat in Category.objects.all():
        kw = KEYWORDS.get(cat.name, cat.name + " shop india")
        img_data = get_ddg_image(kw)
        if img_data:
            filename = f"cat_{slugify(cat.name)}.jpg"
            cat.icon.save(filename, ContentFile(img_data), save=True)
            print(f"Saved category: {cat.name}")

    print("Fetching images for SubCategories...")
    for sub in SubCategory.objects.all():
        kw = sub.name + " " + sub.category.name + " india"
        img_data = get_ddg_image(kw)
        if img_data:
            filename = f"sub_{slugify(sub.name)}.jpg"
            sub.icon.save(filename, ContentFile(img_data), save=True)
            print(f"Saved subcategory: {sub.name}")
            
if __name__ == "__main__":
    run()
