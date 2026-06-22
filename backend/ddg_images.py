import os
import django
import requests
from django.core.files.base import ContentFile
from django.utils.text import slugify
from duckduckgo_search import DDGS

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import SubCategory

def get_ddg_image(keyword):
    print(f"Searching DDG for: {keyword}")
    try:
        with DDGS() as ddgs:
            results = ddgs.images(
                keywords=keyword,
                region="wt-wt",
                safesearch="on",
                size="Medium",
                color="color",
                type_image="photo",
                layout="Wide",
                max_results=3,
            )
            for res in results:
                img_url = res.get("image")
                if img_url:
                    try:
                        print(f"Downloading: {img_url}")
                        img_res = requests.get(img_url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                        if img_res.status_code == 200:
                            return img_res.content
                    except Exception as e:
                        print(f"Failed to download {img_url}: {e}")
    except Exception as e:
        print(f"DDG search failed: {e}")
    return None

def run():
    print("Fetching distinct images for SubCategories...")
    # Fetch for all subcategories
    for sub in SubCategory.objects.all():
        cat_name = sub.category.name if sub.category else ""
        # Create a highly specific keyword
        keyword = f"{sub.name} {cat_name} india high quality stock photo"
        
        img_data = get_ddg_image(keyword)
        if img_data:
            filename = f"ddg_sub_{slugify(sub.name)}.jpg"
            sub.icon.save(filename, ContentFile(img_data), save=True)
            print(f"Saved distinct image for subcategory: {sub.name}")
        else:
            print(f"Failed to find image for {sub.name}")

if __name__ == "__main__":
    run()
