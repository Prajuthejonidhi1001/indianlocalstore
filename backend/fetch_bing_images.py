import os
import django
import requests
import re
import urllib.request
import urllib.parse
import json
from django.core.files.base import ContentFile
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category, SubCategory

def get_bing_image(keyword):
    print(f"Searching Bing for: {keyword}")
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(keyword)}&form=HDRSC2"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        matches = re.findall(r'm="([^"]+)"', html)
        for m in matches:
            try:
                data = json.loads(m.replace('&quot;', '"'))
                if "murl" in data:
                    img_url = data["murl"]
                    print(f"Found URL: {img_url}")
                    img_res = requests.get(img_url, timeout=5, headers={'User-Agent': 'Mozilla/5.0'})
                    if img_res.status_code == 200:
                        return img_res.content
            except Exception as e:
                pass
    except Exception as e:
        print(f"Failed Bing search for {keyword}: {e}")
    return None

KEYWORDS = {
    # Categories
    "Agriculture": "indian agriculture farming tractor",
    "Fashion": "indian boutique clothing fashion store front",
    "Automobile": "car repair mechanic motorcycle shop india",
    "Construction": "building materials hardware store india",
    "Electronics": "electronics gadgets store laptops smartphones india",
    "Traders": "livestock trader sheep cattle india",
    "Event Management": "indian wedding stage decoration events",
    "Furnitures": "wooden furniture sofa showroom india",
    "Marts": "supermarket grocery store india",
    "Second Hand Vehicles": "used cars dealership motorcycles india",
    "Pharmacy": "pharmacy medical store india",
}

def run():
    print("Fetching images for Categories...")
    for cat in Category.objects.all():
        kw = KEYWORDS.get(cat.name, cat.name + " shop india high quality")
        img_data = get_bing_image(kw)
        if img_data:
            filename = f"cat_{slugify(cat.name)}.jpg"
            cat.icon.save(filename, ContentFile(img_data), save=True)
            print(f"Saved category: {cat.name}")

    print("Fetching images for SubCategories...")
    for sub in SubCategory.objects.all():
        kw = sub.name + " " + sub.category.name + " india stock photo"
        img_data = get_bing_image(kw)
        if img_data:
            filename = f"sub_{slugify(sub.name)}.jpg"
            sub.icon.save(filename, ContentFile(img_data), save=True)
            print(f"Saved subcategory: {sub.name}")
            
if __name__ == "__main__":
    run()
