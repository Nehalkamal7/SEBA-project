import requests
import time
import os
from dotenv import load_dotenv

load_dotenv()

# Use the keys from your .env
API_KEY = os.getenv("GOOGLE_SEARCH_API_KEY")
CX = os.getenv("GOOGLE_SEARCH_CX")
QUERY = "right angled triangle"

def test_hardened_connection():
    url = f"https://www.googleapis.com/customsearch/v1?q={QUERY}&cx={CX}&key={API_KEY}&searchType=image&num=1"
    
    # Strategy 1: Real Browser Headers
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive"
    }

    print(f"🚀 Testing connection to Google API...")
    
    for i in range(1, 4):
        try:
            # Strategy 2: Slow down (Throttling)
            # Sometimes ISPs kill fast, repeated bursts of data
            print(f"🔄 Attempt {i}: Waiting 2 seconds before calling...")
            time.sleep(2) 
            
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                print("✅ SUCCESS! Image found:")
                print(response.json()['items'][0]['link'])
                return True
            else:
                print(f"❌ Failed with Status {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"⚠️ Attempt {i} crashed: {e}")
            
    return False

if __name__ == "__main__":
    test_hardened_connection()