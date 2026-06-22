import urllib.request
import re
import urllib.parse
import json

def search_bing(keyword):
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(keyword)}&form=HDRSC2"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        # Bing stores image data in an attribute called m="{...murl...}"
        matches = re.findall(r'm="([^"]+)"', html)
        for m in matches:
            try:
                data = json.loads(m.replace('&quot;', '"'))
                if "murl" in data:
                    print("Found:", data["murl"])
                    return data["murl"]
            except:
                pass
    except Exception as e:
        print("Error:", e)
    return None

search_bing("indian agriculture farming tractor")
