import urllib.request
import json

payload = {
    "markdown": "| A | B |\n|:---:|:---:|\n| 1 | 2 |",
    "settings": {}
}
req = urllib.request.Request("http://127.0.0.1:5000/convert", data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
try:
    res = urllib.request.urlopen(req)
    print("Status:", res.status)
except Exception as e:
    print(e)
