import requests
import os

BASE_URL = 'https://indianlocalstore-api-cjiq.onrender.com/api/products'

MAPPING = {
    'Convenience Stores': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\mart_convenience_1786716267113.png',
    'General Stores': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\mart_general_1786716682647.png',
    'Supermarkets': r'C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\mart_supermarkets_1786716709812.png',
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

