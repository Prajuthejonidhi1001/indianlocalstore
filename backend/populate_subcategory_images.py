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

from products.models import SubCategory

def main():
    subcats = SubCategory.objects.all()
    print(f"Found {subcats.count()} subcategories to process.")
    
    for sub in subcats:
        if sub.icon:
            print(f"Skipping {sub.name}, already has icon.")
            continue
            
        search_term = f"{sub.name} {sub.category.name}"
        url = f"https://loremflickr.com/300/300/{search_term.replace(' ', ',')},product/all"
        print(f"Fetching for {sub.name}: {url}")
        
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 200:
                filename = f"sub_{sub.name.replace(' ', '_').replace('&', 'and').lower()}.jpg"
                sub.icon.save(filename, ContentFile(r.content), save=True)
                print(f"Saved icon for {sub.name}")
            else:
                print(f"Failed to fetch for {sub.name} (Status: {r.status_code})")
        except Exception as e:
            print(f"Error fetching for {sub.name}: {e}")

if __name__ == "__main__":
    main()
