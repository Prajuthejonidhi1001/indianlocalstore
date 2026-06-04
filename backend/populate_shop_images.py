import os
import sys
import socket
import django
import requests
from django.core.files.base import ContentFile

_original_getaddrinfo = socket.getaddrinfo
def ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return _original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = ipv4_getaddrinfo

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from shops.models import Shop

def main():
    shops = Shop.objects.all()
    print(f"Found {shops.count()} shops to process.")
    
    for shop in shops:
        if shop.logo:
            print(f"Skipping {shop.name}, already has logo.")
            continue
            
        search_term = f"storefront,shop,market"
        url = f"https://loremflickr.com/600/400/{search_term.replace(' ', ',')},product/all"
        print(f"Fetching for {shop.name}: {url}")
        
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 200:
                filename = f"shop_{shop.name.replace(' ', '_').replace('&', 'and').lower()}.jpg"
                shop.logo.save(filename, ContentFile(r.content), save=True)
                print(f"Saved logo for {shop.name}")
            else:
                print(f"Failed to fetch for {shop.name} (Status: {r.status_code})")
        except Exception as e:
            print(f"Error fetching for {shop.name}: {e}")

if __name__ == "__main__":
    main()
