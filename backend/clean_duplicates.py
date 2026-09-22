import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category, SubCategory, Product

def merge_subcat(cat_name, keep_name, remove_names):
    cat = Category.objects.filter(name__iexact=cat_name).first()
    if not cat: return
    keep_sub = SubCategory.objects.filter(category=cat, name__iexact=keep_name).first()
    if not keep_sub: return
    for rn in remove_names:
        rem_sub = SubCategory.objects.filter(category=cat, name__iexact=rn).first()
        if rem_sub:
            Product.objects.filter(subcategory=rem_sub).update(subcategory=keep_sub)
            print(f"Deleted subcategory {rn} and merged to {keep_name}")
            rem_sub.delete()

def merge_cat(keep_name, remove_name):
    keep_cat = Category.objects.filter(name__iexact=keep_name).first()
    rem_cat = Category.objects.filter(name__iexact=remove_name).first()
    if keep_cat and rem_cat:
        Product.objects.filter(category=rem_cat).update(category=keep_cat)
        rem_cat.delete()
        print(f"Deleted category {remove_name} and merged to {keep_name}")

def clean_duplicates():
    # Agriculture
    merge_subcat('Agriculture', 'Agri equipment', ['Agri Equipments'])
    merge_subcat('Agriculture', 'Feeds & cattle feed', ['Feeds & Cattle Feeds'])
    # Handle Fertilizers & Pesticides: move products to Fertilizers
    merge_subcat('Agriculture', 'Fertilizers', ['Fertilizers & Pesticides'])
    
    # Construction
    merge_subcat('Construction', 'Tiles & Granite', ['Tiles & granites'])
    
    # Electronics
    merge_subcat('Electronics', 'Laptop', ['Laptops'])
    
    # Marts
    merge_cat('Mart', 'Marts')
    
    print("Cleaned up duplicates!")

if __name__ == '__main__':
    clean_duplicates()
