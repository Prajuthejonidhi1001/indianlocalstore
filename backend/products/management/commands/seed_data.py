"""
Management command: python manage.py seed_data
Seeds categories, subcategories, seller accounts, shops, and products.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Category, SubCategory, Product
from shops.models import Shop

User = get_user_model()

# ── Category & SubCategory data ──────────────────────────────────────────────
CATEGORIES = {
    "Vegetables": ["Leafy Greens", "Root Vegetables", "Gourds & Squash", "Seasonal Veggies"],
    "Fruits": ["Citrus Fruits", "Tropical Fruits", "Berries", "Dry Fruits"],
    "Dairy": ["Milk", "Paneer & Cheese", "Butter & Ghee", "Curd & Yogurt"],
    "Spices & Masala": ["Whole Spices", "Ground Spices", "Ready Mix Masala", "Herbs"],
    "Grains & Pulses": ["Rice", "Wheat & Flour", "Dal & Lentils", "Millets"],
    "Snacks & Namkeen": ["Chips & Crisps", "Namkeen", "Biscuits & Cookies", "Sweets & Mithai"],
    "Meat & Seafood": ["Chicken", "Mutton & Lamb", "Fish", "Prawns & Seafood"],
    "Beverages": ["Cold Drinks", "Juices & Shakes", "Tea & Coffee", "Packaged Water"],
    "Bakery": ["Bread & Buns", "Cakes & Pastries", "Cookies", "Rusks & Toast"],
    "Personal Care": ["Skincare", "Haircare", "Oral Care", "Bath & Body"],
    "Home & Living": ["Cleaning Supplies", "Kitchen Essentials", "Home Decor", "Bedding"],
    "Electronics": ["Mobiles & Tablets", "Laptops & PCs", "Accessories", "Home Appliances"],
    "Clothing & Fashion": ["Men's Wear", "Women's Wear", "Kids' Wear", "Accessories"],
    "Stationery": ["Notebooks & Diaries", "Pens & Pencils", "Art Supplies", "Office Supplies"],
    "Pharmacy": ["Medicines", "Vitamins & Supplements", "First Aid", "Baby Care"],
    "Automobile": ["Car Accessories", "Bike Accessories", "Lubricants & Oils", "Tyres & Tubes"],
    "Furniture": ["Bedroom Furniture", "Living Room", "Office Furniture", "Kids Furniture"],
    "Event Management": ["Wedding Services", "Birthday Decor", "Corporate Events", "Catering"],
}

# ── Shops: (username, password, shop_name, city, state, pincode, lat, lng, address, phone, email, description) ──
SHOPS = [
    ("seller_freshgreens", "Pass@1234", "Fresh Greens Bazaar", "Hyderabad", "Telangana", "500001",
     17.385, 78.486, "Abids Road, Near Clock Tower", "9000000001", "freshgreens@mail.com",
     "Fresh farm vegetables delivered daily. Best quality guaranteed.", "Vegetables"),

    ("seller_mango", "Pass@1234", "Mango Garden Fruits", "Bengaluru", "Karnataka", "560001",
     12.971, 77.594, "MG Road, Bengaluru", "9000000002", "mangogarden@mail.com",
     "Premium seasonal fruits sourced from local farms.", "Fruits"),

    ("seller_amul", "Pass@1234", "Amul Dairy Hub", "Chennai", "Tamil Nadu", "600001",
     13.082, 80.270, "Anna Salai, Chennai", "9000000003", "amuldairy@mail.com",
     "Fresh dairy products — milk, paneer, ghee and more.", "Dairy"),

    ("seller_masala", "Pass@1234", "Masala King", "Mumbai", "Maharashtra", "400001",
     19.075, 72.877, "Crawford Market, Mumbai", "9000000004", "malasakin@mail.com",
     "Authentic Indian spices and masalas since 1990.", "Spices & Masala"),

    ("seller_grains", "Pass@1234", "Anna's Rice & Grains", "Delhi", "Delhi", "110001",
     28.613, 77.209, "Chandni Chowk, Delhi", "9000000005", "annagrains@mail.com",
     "Premium quality rice, dal, and flour at wholesale prices.", "Grains & Pulses"),

    ("seller_bikaji", "Pass@1234", "Bikaji Snacks World", "Jaipur", "Rajasthan", "302001",
     26.912, 75.787, "MI Road, Jaipur", "9000000006", "bikaji@mail.com",
     "Delicious namkeen, chips and Indian sweets.", "Snacks & Namkeen"),

    ("seller_nonveg", "Pass@1234", "Non-Veg Corner", "Pune", "Maharashtra", "411001",
     18.520, 73.856, "FC Road, Pune", "9000000007", "nonvegcorner@mail.com",
     "Fresh chicken, mutton, fish and seafood daily.", "Meat & Seafood"),

    ("seller_thanda", "Pass@1234", "Thanda Drinks Centre", "Ahmedabad", "Gujarat", "380001",
     23.022, 72.571, "CG Road, Ahmedabad", "9000000008", "thandadrinks@mail.com",
     "Cold drinks, juices, shakes and packaged water.", "Beverages"),

    ("seller_bakery", "Pass@1234", "Morning Bakery", "Kolkata", "West Bengal", "700001",
     22.572, 88.363, "Park Street, Kolkata", "9000000009", "morningbakery@mail.com",
     "Fresh bread, cakes and pastries baked every morning.", "Bakery"),

    ("seller_glamour", "Pass@1234", "Glamour Essentials", "Hyderabad", "Telangana", "500034",
     17.432, 78.456, "Banjara Hills, Hyderabad", "9000000010", "glamour@mail.com",
     "Premium skincare, haircare and personal care products.", "Personal Care"),

    ("seller_homenest", "Pass@1234", "Home Nest Store", "Bengaluru", "Karnataka", "560038",
     12.934, 77.626, "Koramangala, Bengaluru", "9000000011", "homenest@mail.com",
     "Everything for your home — cleaning, kitchen and decor.", "Home & Living"),

    ("seller_techzone", "Pass@1234", "TechZone Electronics", "Chennai", "Tamil Nadu", "600017",
     13.060, 80.248, "T Nagar, Chennai", "9000000012", "techzone@mail.com",
     "Mobiles, laptops, accessories and appliances at best prices.", "Electronics"),

    ("seller_fashion", "Pass@1234", "Fashion Hub", "Mumbai", "Maharashtra", "400050",
     19.122, 72.835, "Linking Road, Bandra", "9000000013", "fashionhub@mail.com",
     "Trendy clothing for men, women and kids.", "Clothing & Fashion"),

    ("seller_study", "Pass@1234", "Study Point", "Delhi", "Delhi", "110092",
     28.671, 77.291, "Laxmi Nagar, Delhi", "9000000014", "studypoint@mail.com",
     "Notebooks, pens, art supplies and office stationery.", "Stationery"),

    ("seller_health", "Pass@1234", "HealthPlus Pharmacy", "Pune", "Maharashtra", "411004",
     18.530, 73.880, "Shivajinagar, Pune", "9000000015", "healthplus@mail.com",
     "Medicines, vitamins, first aid and baby care products.", "Pharmacy"),

    ("seller_autoking", "Pass@1234", "AutoKing Accessories", "Ahmedabad", "Gujarat", "380015",
     23.045, 72.601, "Sardar Patel Ring Road, Ahmedabad", "9000000016", "autoking@mail.com",
     "Car and bike accessories, lubricants and tyres.", "Automobile"),

    ("seller_furniture", "Pass@1234", "Furniture World", "Jaipur", "Rajasthan", "302017",
     26.867, 75.805, "Vaishali Nagar, Jaipur", "9000000017", "furnitureworld@mail.com",
     "Quality furniture for bedroom, living room and office.", "Furniture"),

    ("seller_events", "Pass@1234", "Dream Events", "Kolkata", "West Bengal", "700019",
     22.543, 88.393, "Salt Lake, Kolkata", "9000000018", "dreamevents@mail.com",
     "Wedding, birthday and corporate event planning services.", "Event Management"),
]

# ── Products per category ─────────────────────────────────────────────────────
PRODUCTS = {
    "Vegetables": [
        ("Fresh Spinach Bunch", "Leafy Greens", "Crisp fresh spinach, locally grown, 250g bunch.", 25, 20, 150),
        ("Red Tomatoes 1kg", "Seasonal Veggies", "Fresh red tomatoes, perfect for curries and salads.", 40, 35, 200),
        ("Carrots 500g", "Root Vegetables", "Sweet orange carrots, rich in vitamins.", 30, None, 120),
        ("Bitter Gourd 500g", "Gourds & Squash", "Fresh bitter gourd (karela), great for health.", 35, 30, 80),
        ("Coriander Leaves", "Leafy Greens", "Fresh coriander, essential for Indian cooking.", 15, None, 300),
    ],
    "Fruits": [
        ("Alphonso Mango 1kg", "Tropical Fruits", "Premium Ratnagiri Alphonso mangoes, king of fruits.", 180, 150, 50),
        ("Sweet Oranges 1kg", "Citrus Fruits", "Juicy Nagpur oranges, rich in Vitamin C.", 80, 70, 100),
        ("Strawberries 250g", "Berries", "Fresh red strawberries, perfect for desserts.", 120, 100, 60),
        ("Mixed Dry Fruits 200g", "Dry Fruits", "Almonds, cashews and raisins assorted pack.", 250, 220, 90),
        ("Bananas 1 dozen", "Tropical Fruits", "Ripe yellow bananas, energy-boosting snack.", 50, None, 200),
    ],
    "Dairy": [
        ("Full Cream Milk 1L", "Milk", "Fresh pasteurised full cream milk, daily delivery.", 65, None, 500),
        ("Paneer 200g", "Paneer & Cheese", "Soft fresh paneer, made from pure cow milk.", 90, 80, 150),
        ("Pure Cow Ghee 500ml", "Butter & Ghee", "Aromatic pure cow ghee, traditionally churned.", 350, 320, 80),
        ("Dahi Curd 400g", "Curd & Yogurt", "Thick creamy curd, set overnight naturally.", 45, 40, 250),
        ("Amul Butter 100g", "Butter & Ghee", "Salted butter, perfect for bread and cooking.", 55, None, 300),
    ],
    "Spices & Masala": [
        ("Turmeric Powder 100g", "Ground Spices", "Pure haldi powder, bright yellow colour.", 35, 30, 200),
        ("Garam Masala 50g", "Ready Mix Masala", "Aromatic blend of 12 whole spices.", 60, 55, 150),
        ("Black Pepper Whole 50g", "Whole Spices", "Bold pungent black pepper, freshly packed.", 80, None, 100),
        ("Red Chilli Powder 100g", "Ground Spices", "Fiery red chilli powder, restaurant quality.", 40, 35, 180),
        ("Cumin Seeds 100g", "Whole Spices", "Aromatic jeera seeds, essential for tadka.", 45, None, 160),
    ],
    "Grains & Pulses": [
        ("Basmati Rice 1kg", "Rice", "Long grain aged basmati, fragrant and fluffy.", 120, 110, 300),
        ("Toor Dal 500g", "Dal & Lentils", "Premium arhar dal, protein-rich and tasty.", 75, 70, 250),
        ("Whole Wheat Atta 1kg", "Wheat & Flour", "Stone ground whole wheat flour, high fibre.", 55, None, 400),
        ("Ragi Flour 500g", "Millets", "Finger millet flour, iron and calcium rich.", 65, 60, 120),
        ("Chana Dal 500g", "Dal & Lentils", "Split chickpeas, nutty flavour and high protein.", 70, None, 200),
    ],
    "Snacks & Namkeen": [
        ("Aloo Bhujia 200g", "Namkeen", "Classic spicy potato namkeen, crispy delight.", 50, 45, 300),
        ("Masala Chips 150g", "Chips & Crisps", "Crunchy potato chips with tangy masala.", 30, None, 400),
        ("Besan Ladoo 250g", "Sweets & Mithai", "Ghee-rich besan ladoos, traditional sweet.", 150, 130, 100),
        ("Digestive Biscuits 200g", "Biscuits & Cookies", "Whole wheat digestive biscuits, light snack.", 40, 35, 250),
        ("Kaju Katli 200g", "Sweets & Mithai", "Premium cashew barfi with silver varq.", 280, 250, 80),
    ],
    "Meat & Seafood": [
        ("Chicken Breast 500g", "Chicken", "Fresh boneless chicken breast, cleaned and cut.", 180, 165, 100),
        ("Mutton Curry Cut 500g", "Mutton & Lamb", "Fresh goat mutton, curry cut pieces.", 350, 320, 60),
        ("Rohu Fish 500g", "Fish", "Fresh Rohu (Rohu carp), cleaned and scaled.", 200, 185, 80),
        ("Tiger Prawns 250g", "Prawns & Seafood", "Fresh tiger prawns, deveined and cleaned.", 280, 250, 50),
        ("Chicken Whole 1kg", "Chicken", "Farm fresh whole chicken, ready to cook.", 280, 260, 70),
    ],
    "Beverages": [
        ("Coca Cola 2L", "Cold Drinks", "Chilled Coca-Cola 2 litre bottle.", 95, None, 500),
        ("Real Fruit Juice Orange 1L", "Juices & Shakes", "100% real orange juice, no added sugar.", 110, 99, 300),
        ("Tata Tea Gold 250g", "Tea & Coffee", "Aromatic strong tea leaves, best flavour.", 130, 120, 200),
        ("Bisleri Water 1L", "Packaged Water", "Pure mineral water, sealed and safe.", 20, None, 1000),
        ("Nescafe Classic 50g", "Tea & Coffee", "Instant coffee, rich aroma and bold taste.", 180, 165, 150),
    ],
    "Bakery": [
        ("Whole Wheat Bread", "Bread & Buns", "Soft whole wheat sandwich bread, 400g loaf.", 45, 40, 200),
        ("Chocolate Cake 500g", "Cakes & Pastries", "Moist chocolate sponge with ganache frosting.", 350, 320, 50),
        ("Butter Croissant", "Cookies", "Flaky golden butter croissant, baked fresh.", 30, None, 150),
        ("Rusk Toast 200g", "Rusks & Toast", "Crispy double baked rusk, great with chai.", 40, 35, 300),
        ("Vanilla Pastry", "Cakes & Pastries", "Light vanilla pastry with whipped cream.", 60, 55, 100),
    ],
    "Personal Care": [
        ("Nivea Face Cream 50ml", "Skincare", "Moisturising day cream for all skin types.", 180, 165, 200),
        ("Dove Shampoo 340ml", "Haircare", "Nourishing shampoo for smooth silky hair.", 220, 200, 150),
        ("Colgate Max Fresh 150g", "Oral Care", "Cooling gel toothpaste, mint freshness.", 90, 85, 400),
        ("Dettol Soap 75g", "Bath & Body", "Antibacterial soap, 10x better protection.", 45, None, 500),
        ("Biotique Face Wash 100ml", "Skincare", "Herbal neem face wash for clear skin.", 150, 130, 120),
    ],
    "Home & Living": [
        ("Colin Glass Cleaner 500ml", "Cleaning Supplies", "Streak-free glass and surface cleaner.", 120, 110, 200),
        ("Prestige Non-stick Pan 24cm", "Kitchen Essentials", "Hard anodised non-stick fry pan.", 650, 599, 80),
        ("Handmade Wall Clock", "Home Decor", "Wooden handcrafted wall clock, rustic design.", 450, 400, 60),
        ("Cotton Bedsheet Set", "Bedding", "100% cotton double bedsheet with 2 pillowcases.", 799, 699, 100),
        ("Lizol Floor Cleaner 1L", "Cleaning Supplies", "Disinfectant floor cleaner, pine fragrance.", 180, 160, 250),
    ],
    "Electronics": [
        ("boAt Bassheads Earphones", "Accessories", "Wired earphones with mic, bass-heavy sound.", 399, 349, 300),
        ("Realme C55 Mobile", "Mobiles & Tablets", "6.72 inch FHD+ display, 50MP camera, 5000mAh.", 12999, 11999, 50),
        ("TP-Link WiFi Router", "Accessories", "300Mbps wireless N router, easy setup.", 1299, 1199, 80),
        ("Lenovo IdeaPad 15", "Laptops & PCs", "Intel Core i5, 8GB RAM, 512GB SSD laptop.", 45999, 42999, 20),
        ("Philips LED Bulb 9W", "Home Appliances", "Energy saving LED bulb, 810 lumens brightness.", 120, 99, 500),
    ],
    "Clothing & Fashion": [
        ("Men's Cotton Kurta", "Men's Wear", "Traditional cotton kurta, machine washable.", 699, 599, 100),
        ("Women's Salwar Suit", "Women's Wear", "Comfortable cotton salwar suit set, 3-piece.", 1299, 1099, 80),
        ("Kids' T-Shirt Pack 3", "Kids' Wear", "Pack of 3 colourful cotton t-shirts, age 5-10.", 599, 499, 150),
        ("Leather Belt", "Accessories", "Genuine leather belt with buckle, all sizes.", 399, 349, 200),
        ("Women's Kurti", "Women's Wear", "Printed rayon kurti, trendy and comfortable.", 499, 449, 120),
    ],
    "Stationery": [
        ("Classmate Notebook 200 pages", "Notebooks & Diaries", "Single line notebook, A4 size, smooth pages.", 80, None, 500),
        ("Cello Pen Pack of 10", "Pens & Pencils", "Blue ball pens, smooth writing, pack of 10.", 60, 55, 400),
        ("Camlin Colour Pencils 24", "Art Supplies", "24 shades colour pencils for school projects.", 120, 110, 200),
        ("Stapler with Pins", "Office Supplies", "Heavy duty stapler with 1000 staple pins.", 180, 160, 150),
        ("Sticky Notes Pack 5", "Office Supplies", "5 colour sticky note pads, 100 sheets each.", 99, 89, 300),
    ],
    "Pharmacy": [
        ("Paracetamol 500mg 10 tabs", "Medicines", "Fever and pain relief tablets, strip of 10.", 15, None, 1000),
        ("Vitamin C 500mg 30 tabs", "Vitamins & Supplements", "Immunity booster vitamin C tablets.", 120, 110, 500),
        ("Band-Aid Strips 10pc", "First Aid", "Flexible fabric band-aid for minor cuts.", 35, None, 800),
        ("Johnson Baby Powder 200g", "Baby Care", "Gentle talc-free baby powder, mild fragrance.", 180, 160, 300),
        ("Dettol Antiseptic 100ml", "First Aid", "Multipurpose antiseptic liquid for wound care.", 90, 80, 400),
    ],
    "Automobile": [
        ("Car Dashboard Camera", "Car Accessories", "Full HD 1080p dash cam with night vision.", 2499, 2199, 80),
        ("Bike Chain Lubricant 100ml", "Lubricants & Oils", "Long-lasting chain lube, water resistant.", 180, 160, 200),
        ("Car Air Freshener", "Car Accessories", "Vent clip freshener, rose fragrance, 30 days.", 120, 99, 300),
        ("Puncture Repair Kit", "Tyres & Tubes", "Complete tyre puncture repair kit for bikes.", 150, 130, 150),
        ("Helmet Visor Shield", "Bike Accessories", "Anti-scratch clear visor for full-face helmets.", 350, 299, 100),
    ],
    "Furniture": [
        ("Wooden Study Table", "Office Furniture", "Solid sheesham wood study table with drawer.", 8999, 7999, 30),
        ("Queen Bed with Storage", "Bedroom Furniture", "Queen size bed with hydraulic storage, walnut.", 22999, 19999, 15),
        ("3-Seater Sofa", "Living Room", "Fabric sofa with cushions, premium comfort.", 18999, 16999, 20),
        ("Kids Bunk Bed", "Kids Furniture", "Wooden bunk bed with ladder and safety rails.", 14999, 12999, 10),
        ("Office Chair", "Office Furniture", "Ergonomic mesh chair with lumbar support.", 6999, 5999, 40),
    ],
    "Event Management": [
        ("Wedding Decoration Package", "Wedding Services", "Full mandap, floral and lighting decoration setup.", 50000, 45000, 20),
        ("Birthday Balloon Decor", "Birthday Decor", "Custom balloon arch and table decor setup.", 3500, 3000, 50),
        ("Corporate Event Planning", "Corporate Events", "Full corporate event management, 50-500 guests.", 75000, 65000, 10),
        ("Catering 50 Pax Veg", "Catering", "Buffet catering for 50 people, full veg menu.", 25000, 22000, 30),
        ("DJ Sound System Rental", "Birthday Decor", "Professional DJ setup with lights for parties.", 8000, 7000, 40),
    ],
    "Snacks & Namkeen": [
        ("Aloo Bhujia 200g", "Namkeen", "Classic spicy potato namkeen, crispy delight.", 50, 45, 300),
    ],
}


class Command(BaseCommand):
    help = 'Seed database with categories, shops, and products'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.MIGRATE_HEADING('=== Seeding Database ==='))

        # 1. Categories & Subcategories
        self.stdout.write('Creating categories and subcategories...')
        cat_map = {}
        subcat_map = {}
        for cat_name, subcats in CATEGORIES.items():
            cat, _ = Category.objects.get_or_create(name=cat_name)
            cat_map[cat_name] = cat
            subcat_map[cat_name] = {}
            for sc_name in subcats:
                sc, _ = SubCategory.objects.get_or_create(category=cat, name=sc_name)
                subcat_map[cat_name][sc_name] = sc
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(cat_map)} categories, subcategories done'))

        # 2. Seller users + Shops
        self.stdout.write('Creating seller accounts and shops...')
        seller_shop_map = {}
        for shop_data in SHOPS:
            username, password, shop_name, city, state, pincode, lat, lng, address, phone, email, desc, cat_name = shop_data

            # Create or get seller user
            if not User.objects.filter(username=username).exists():
                seller = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    role='seller',
                    phone=phone,
                    city=city,
                    state=state,
                )
            else:
                seller = User.objects.get(username=username)

            # Create shop if not exists
            if not Shop.objects.filter(seller=seller).exists():
                shop = Shop.objects.create(
                    seller=seller,
                    name=shop_name,
                    description=desc,
                    latitude=lat,
                    longitude=lng,
                    address=address,
                    city=city,
                    state=state,
                    pincode=pincode,
                    phone=phone,
                    email=email,
                    is_open=True,
                    verification_status='verified',
                    rating=4.2,
                    reviews_count=12,
                )
            else:
                shop = Shop.objects.get(seller=seller)

            seller_shop_map[cat_name] = (seller, shop)
            self.stdout.write(f'  ✓ {shop_name} ({city})')

        # 3. Products
        self.stdout.write('Creating products...')
        product_count = 0
        for cat_name, products in PRODUCTS.items():
            if cat_name not in seller_shop_map:
                continue
            seller, shop = seller_shop_map[cat_name]
            cat = cat_map.get(cat_name)
            if not cat:
                continue
            for prod_data in products:
                name, subcat_name, desc, price, disc_price, stock = prod_data
                subcat = subcat_map.get(cat_name, {}).get(subcat_name)
                if not Product.objects.filter(name=name, seller=seller).exists():
                    Product.objects.create(
                        seller=seller,
                        category=cat,
                        subcategory=subcat,
                        name=name,
                        description=desc,
                        price=price,
                        discount_price=disc_price,
                        stock=stock,
                        image='',
                        is_active=True,
                        rating=round(3.8 + (hash(name) % 12) / 10, 1),
                        reviews_count=abs(hash(name)) % 50 + 5,
                    )
                    product_count += 1

        self.stdout.write(self.style.SUCCESS(f'  ✓ {product_count} products created'))
        self.stdout.write(self.style.SUCCESS('=== Seeding complete! ==='))
