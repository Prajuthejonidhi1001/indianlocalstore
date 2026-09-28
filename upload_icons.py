import requests
import json
import os

BASE_URL = 'https://indianlocalstore-api-cjiq.onrender.com/api/products'
ICON_DIR = r'C:\indianlocalstore\icon for app'

# Define mapping
# Categories: "Name" -> filename
CATEGORY_MAPPING = {
    "Fashion": "fashion main.png",
    "Electronics": "electronic main.png",
    "Agriculture": "agri main.png",
    "Construction": "construction main.png",
}

# Subcategories: "Name" -> filename
SUBCATEGORY_MAPPING = {
    "Textile": "fashion textile.png",
    "Tailors": "tailor.png",
    "Laptop": "laptops.png",
    "Home Appliances": "home appliances.png",
    "Audio & Video": "audio&video.png",
    "Accessories": "electronic assc.png",
    "Agri Equipments": "agri equip.png",
    "Feeds & Cattle Feeds": "agri feed.png",
    "Nursery": "agri nursary.png",
    "Hardware": "hardware.png",
    "Paints": "paints.png",
    "Electric Items": "electrical items.png",
    "Tiles & Granite": "tails & granites.png",
    "Carpentry & Wood": "carpentry items.png",
    "PVC Fabrication": "fabrication.png",
    "Others": "construction other.png", # Might map to multiple, we will check parent category if needed
}

def get_categories():
    response = requests.get(f"{BASE_URL}/categories/")
    return response.json()['results']

def upload_icon(url, file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    with open(file_path, 'rb') as f:
        files = {'icon': f}
        print(f"Uploading {file_path} to {url}...")
        response = requests.patch(url, files=files)
        if response.status_code in (200, 204):
            print(f"SUCCESS: {url}")
        else:
            print(f"FAILED: {response.status_code} - {response.text}")

def main():
    print("Fetching categories...")
    categories = get_categories()
    
    for cat in categories:
        cat_name = cat['name']
        cat_id = cat['id']
        
        if cat_name in CATEGORY_MAPPING:
            file_path = os.path.join(ICON_DIR, CATEGORY_MAPPING[cat_name])
            upload_icon(f"{BASE_URL}/categories/{cat_id}/", file_path)
            
        for sub in cat.get('subcategories', []):
            sub_name = sub['name']
            sub_id = sub['id']
            
            # Special logic for "Others" which might exist in multiple
            if sub_name == "Others":
                if cat_name == "Agriculture":
                    file_path = os.path.join(ICON_DIR, "agri others.png")
                elif cat_name == "Construction":
                    file_path = os.path.join(ICON_DIR, "construction other.png")
                else:
                    file_path = None
                
                if file_path:
                    upload_icon(f"{BASE_URL}/subcategories/{sub_id}/", file_path)
            elif sub_name in SUBCATEGORY_MAPPING:
                file_path = os.path.join(ICON_DIR, SUBCATEGORY_MAPPING[sub_name])
                upload_icon(f"{BASE_URL}/subcategories/{sub_id}/", file_path)

if __name__ == '__main__':
    main()
