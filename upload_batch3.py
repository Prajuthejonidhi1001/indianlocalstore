import requests
import os

BASE_URL = 'https://indianlocalstore-api-cjiq.onrender.com/api/products'

# Map subcategory names to absolute file paths of the generated images
MAPPING = {
    'Saree & Fancy Printing': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\fashion_saree_1786690631008.png',
    'Beds': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\furnitures_beds_1786690917319.png',
    'Dining': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\furnitures_dining_1786691155031.png',
    'Office Furniture': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\furnitures_office_1786691170322.png',
    'Outdoor Furniture': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\furnitures_outdoor_1786691202505.png',
    'Wholesale Markets': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\mart_wholesale_1786691226468.png',
    'Sofas': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\furnitures_sofas_1786691365822.png',
}

def get_categories():
    response = requests.get(f'{BASE_URL}/categories/')
    return response.json()['results']

def upload_icon(url, file_path):
    if not os.path.exists(file_path):
        print(f'File not found: {file_path}')
        return
    with open(file_path, 'rb') as f:
        files = {'icon': f}
        print(f'Uploading {file_path} to {url}...')
        response = requests.patch(url, files=files)
        if response.status_code in (200, 204):
            print(f'SUCCESS: {url}')
        else:
            print(f'FAILED: {response.status_code} - {response.text}')

def main():
    print('Fetching categories...')
    categories = get_categories()
    
    for cat in categories:
        for sub in cat.get('subcategories', []):
            sub_name = sub['name']
            sub_id = sub['id']
            
            if sub_name in MAPPING:
                upload_icon(f'{BASE_URL}/subcategories/{sub_id}/', MAPPING[sub_name])

if __name__ == '__main__':
    main()

