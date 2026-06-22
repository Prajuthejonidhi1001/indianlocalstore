import os
import django
from django.core.files import File
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category, SubCategory

IMAGE_MAP = {
    "Agriculture": r"C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\agriculture_cat_1781148900448.png",
    "Fashion": r"C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\fashion_cat_1781148912233.png",
    "Automobile": r"C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\automobile_cat_1781148925805.png",
    "Construction": r"C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\construction_cat_1781148938963.png",
    "Electronics": r"C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\electronics_cat_1781148957487.png",
    "Traders": r"C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\traders_cat_1781148972766.png",
    "Event Management": r"C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\events_cat_1781148993504.png",
    "Furnitures": r"C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\furnitures_cat_1781149007080.png",
    "Marts": r"C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\marts_cat_1781149021643.png",
    "Second Hand Vehicles": r"C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\vehicles_cat_1781150549200.png",
    "Pharmacy": r"C:\Users\praju\.gemini\antigravity\brain\5ce3a14f-7502-4bc9-bdaa-90440576ef36\pharmacy_cat_1781150560964.png",
}

def run():
    print("Applying generated images to Categories...")
    for cat in Category.objects.all():
        img_path = IMAGE_MAP.get(cat.name)
        if img_path and os.path.exists(img_path):
            with open(img_path, 'rb') as f:
                filename = f"gen_cat_{slugify(cat.name)}.png"
                cat.icon.save(filename, File(f), save=True)
                print(f"Saved category: {cat.name}")
        else:
            print(f"Image not found for category: {cat.name}")

    skip_subs = ['Hardware', 'Paints', 'Others', 'Tiles & granites', 'Agri equipment', 'Laptops', 'Home appliances', 'Silage', 'Catering', 'Photography studio', 'Feeds & cattle feed', 'Fertilizer & pesticides', 'Nursery', 'Textile']
    print("Applying parent category images to SubCategories...")
    for sub in SubCategory.objects.all():
        if sub.name in skip_subs:
            print(f"Skipping successfully generated subcategory: {sub.name}")
            continue
        if sub.category:
            img_path = IMAGE_MAP.get(sub.category.name)
            if img_path and os.path.exists(img_path):
                with open(img_path, 'rb') as f:
                    filename = f"gen_sub_{slugify(sub.name)}.png"
                    sub.icon.save(filename, File(f), save=True)
                    print(f"Saved subcategory: {sub.name}")
            else:
                 print(f"Parent icon missing for subcategory: {sub.name}")
                 
if __name__ == "__main__":
    run()
