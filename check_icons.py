import requests
cats = requests.get('https://indianlocalstore-api-cjiq.onrender.com/api/products/categories/').json()['results']
for c in cats:
    for sub in c.get('subcategories', []):
        icon = sub.get('icon')
        print(f"{c['name']} --- {sub['name']}: {icon}")
