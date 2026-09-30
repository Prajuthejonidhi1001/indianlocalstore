import os
import sys
import django

# Setup Django
sys.path.append('C:\\indianlocalstore\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from shops.models import Shop
from users.models import User

# We will create one seller user for dummy shops if none exists, or just use one.
seller, created = User.objects.get_or_create(
    username="dummy_seller_master",
    defaults={
        "email": "dummyseller@example.com",
        "role": "seller",
        "first_name": "Dummy",
        "last_name": "Seller"
    }
)

dummy_shops = [
    {
        "name": "Myntra Fashion Hub",
        "description": "Premium clothing and lifestyle brand store.",
        "address": "123 Fashion Street, Bangalore",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560001",
        "latitude": 12.971598,
        "longitude": 77.594562,
        "is_active": True,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png",
        "banner_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"
    },
    {
        "name": "Flipkart Electronics",
        "description": "The ultimate destination for gadgets and electronics.",
        "address": "456 Tech Park, Bangalore",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560034",
        "latitude": 12.935116,
        "longitude": 77.624480,
        "is_active": True,
        "logo_url": "https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg",
        "banner_url": "https://images.unsplash.com/photo-1550009158-9effb6628373?auto=format&fit=crop&q=80&w=1200"
    },
    {
        "name": "Amazon Supermart",
        "description": "A to Z of everything you need, delivered fresh.",
        "address": "789 Amazon Way, Mumbai",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "latitude": 18.922064,
        "longitude": 72.834641,
        "is_active": True,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
        "banner_url": "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&q=80&w=1200"
    },
    {
        "name": "Reliance Fresh",
        "description": "Fresh produce and daily groceries near you.",
        "address": "101 Reliance Retail, Delhi",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110001",
        "latitude": 28.613939,
        "longitude": 77.209021,
        "is_active": True,
        "logo_url": "https://upload.wikimedia.org/wikipedia/en/5/52/Reliance_Fresh_logo.png",
        "banner_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200"
    },
    {
        "name": "Nykaa Beauty Palace",
        "description": "All your cosmetic and beauty needs in one place.",
        "address": "Beauty Lane, Pune",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "411001",
        "latitude": 18.520430,
        "longitude": 73.856743,
        "is_active": True,
        "logo_url": "https://upload.wikimedia.org/wikipedia/en/3/30/Nykaa_logo.svg",
        "banner_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200"
    },
    {
        "name": "Local Kiranawala",
        "description": "Your trusted neighborhood store for everyday essentials.",
        "address": "Street 10, Chennai",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "pincode": "600001",
        "latitude": 13.082680,
        "longitude": 80.270718,
        "is_active": True,
        "logo_url": "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&q=80&w=200",
        "banner_url": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=1200"
    }
]

import urllib.request
from django.core.files.base import ContentFile

print("Populating dummy shops...")
for shop_data in dummy_shops:
    logo_url = shop_data.pop("logo_url")
    banner_url = shop_data.pop("banner_url")
    
    # Check if shop exists
    if not Shop.objects.filter(name=shop_data['name']).exists():
        # Create unique seller for each shop
        shop_seller, _ = User.objects.get_or_create(
            username=f"seller_{shop_data['name'].replace(' ', '_').lower()}",
            defaults={
                "email": f"seller_{shop_data['name'].replace(' ', '_').lower()}@example.com",
                "role": "seller",
                "first_name": shop_data['name'],
                "last_name": "Store"
            }
        )
        shop = Shop.objects.create(seller=shop_seller, **shop_data)
        
        print(f"Created shop: {shop.name}")
        
        # We don't download files directly to the model's ImageField because it could be slow or block.
        # But wait, we can just save a URL if we had a URL field.
        # Since it's an ImageField, let's download the images.
        try:
            logo_req = urllib.request.Request(logo_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(logo_req) as response:
                shop.logo.save(f"{shop.name}_logo.png", ContentFile(response.read()), save=False)
                
            banner_req = urllib.request.Request(banner_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(banner_req) as response:
                shop.banner.save(f"{shop.name}_banner.jpg", ContentFile(response.read()), save=False)
                
            shop.save()
            print(f"Saved images for {shop.name}")
        except Exception as e:
            print(f"Failed to fetch image for {shop.name}: {e}")

print("Done populating dummy shops!")
