import requests
import json
import os

BASE_URL = 'https://indianlocalstore-api-cjiq.onrender.com/api/products'
ICON_DIR = r'C:\indianlocalstore\icon for app'

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

def match_and_upload():
    categories = get_categories()
    
    cat_mappings = {
        "Fashion": "fashion main.png",
        "Electronics": "electronic main.png",
        "Agriculture": "agri main.png",
        "Construction": "construction main.png",
    }
    
    subcat_mappings = {
        "Textile": "fashion textile.png",
        "Tailors": "tailor.png",
        "Artificial Jewels": "artificial jewels.jpeg",
        
        "Laptop": "laptops.png",
        "Home Appliances": "home appliances.png",
        "Audio & Video": "audio&video.png",
        "Accessories": "electronic assc.png",
        
        "Agri Equipments": "agri equip.png",
        "Feeds & Cattle Feeds": "agri feed.png",
        "Nursery": "agri nursary.png",
        "Fertilizer & Pesticides": "fertilizer.jpeg",
        "Seeds": "seeds.jpeg",
        
        "Hardware": "hardware.png",
        "Paints": "paints.png",
        "Electric Items": "electrical items.png",
        "Tiles & Granite": "tails & granites.png",
        "Carpentry & Wood": "carpentry items.png",
        "PVC Fabrication": "fabrication.png",
        "Steel": "steel.png",
        
        "Auto Mobile Parts": "auto mobile parts.jpeg",
    }
    
    for cat in categories:
        cat_name = cat['name']
        cat_id = cat['id']
        
        if cat_name in cat_mappings:
            upload_icon(f"{BASE_URL}/categories/{cat_id}/", os.path.join(ICON_DIR, cat_mappings[cat_name]))
            
        for sub in cat.get('subcategories', []):
            sub_name = sub['name']
            sub_id = sub['id']
            
            if sub_name == "Others":
                if cat_name == "Agriculture":
                    path = "agri others.png"
                elif cat_name == "Construction":
                    path = "construction other.png"
                elif cat_name == "Fashion":
                    path = "fashion for others.jpeg"
                elif cat_name == "Automobile":
                    path = "autobile others.jpeg"
                elif cat_name == "Furniture":
                    path = "furniture other.jpeg"
                elif cat_name == "Electrical":
                    path = "electrical others.png"
                else:
                    path = None
                
                if path:
                    upload_icon(f"{BASE_URL}/subcategories/{sub_id}/", os.path.join(ICON_DIR, path))
                    
            elif sub_name in subcat_mappings:
                upload_icon(f"{BASE_URL}/subcategories/{sub_id}/", os.path.join(ICON_DIR, subcat_mappings[sub_name]))

if __name__ == "__main__":
    match_and_upload()
