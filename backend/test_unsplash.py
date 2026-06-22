import requests

def test_unsplash(query):
    url = f"https://unsplash.com/napi/search/photos?query={query}&per_page=1"
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers)
    print("Status:", res.status_code)
    try:
        data = res.json()
        print("URL:", data['results'][0]['urls']['regular'])
    except Exception as e:
        print("Error:", e, res.text[:200])

test_unsplash("farming tractor")
