import requests
import os

BASE_URL = 'https://indianlocalstore-api-cjiq.onrender.com/api/products'

MAPPING = {
    'Agri equipment': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\agri_equipment_1786717543170.png',
    'Feeds & cattle feed': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\agri_feeds_1786717574431.png',
    'Nursery': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\agri_nursery_1786717717116.png',
    'Carpentry & Wood': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\construction_carpentry_1786717829933.png',
    'Electric Items': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\construction_electric_1786717858640.png',
    'Hardware': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\construction_hardware_1786717991353.png',
    'Paints': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\construction_paints_1786718005576.png',
    'PVC Fabrication': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\construction_pvc_1786718169632.png',
    'Home appliances': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\electronics_home_1786718341693.png',
    'Laptop': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\electronics_laptop_1786718421100.png',
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

