import requests

API_KEY = "AIzaSyDYdJZHkLP9JTLrFZEpZfDlENoK8sNm4f8"
CX = "60268a945b8e044c9"
QUERY = "triangle"

url = f"https://www.googleapis.com/customsearch/v1?q={QUERY}&cx={CX}&key={API_KEY}&searchType=image"

response = requests.get(url)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")