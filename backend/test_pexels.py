import requests
import re

def test_pexels(query):
    url = f"https://www.pexels.com/search/{query}/"
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers)
    print("Status:", res.status_code)
    try:
        # Find images in HTML: https://images.pexels.com/photos/...
        matches = re.findall(r'src="(https://images\.pexels\.com/photos/[^"]+)"', res.text)
        if matches:
            print("URL:", matches[0])
        else:
            print("No matches")
    except Exception as e:
        print("Error:", e)

test_pexels("farming")
