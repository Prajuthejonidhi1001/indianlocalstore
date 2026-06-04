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

from products.models import Category

def main():
    cats = Category.objects.all()
    for cat in cats:
        if cat.icon:
            print(f"Skipping {cat.name}, already has icon.")
            continue
        
        # Determine good keyword
        keyword = cat.name.split(' ')[0].replace('&', '')
        if keyword == 'Second': keyword = 'vehicle,car'
        if keyword == 'Home': keyword = 'interior,decor'
        if keyword == 'Mart': keyword = 'supermarket,grocery'
        if keyword == 'Event': keyword = 'party,event'
        
        url = f"https://loremflickr.com/600/600/{keyword},product/all"
        print(f"Fetching for {cat.name}: {url}")
        
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 200:
                filename = f"{cat.name.replace(' ', '_').replace('&', 'and').lower()}.jpg"
                cat.icon.save(filename, ContentFile(r.content), save=True)
                print(f"Saved icon for {cat.name}")
            else:
                print(f"Failed to fetch for {cat.name} (Status: {r.status_code})")
        except Exception as e:
            print(f"Error fetching for {cat.name}: {e}")

if __name__ == "__main__":
    main()
