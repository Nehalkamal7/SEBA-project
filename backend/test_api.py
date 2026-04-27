import os
import time
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load your API Key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Error: No API Key found in .env file")
    exit()

print(f"🔑 Testing API Key: {api_key[:5]}...{api_key[-5:]}")
genai.configure(api_key=api_key)

# 2. Define the models to test
models_to_test = ['gemini-1.5-flash', 'gemini-2.5-flash']

for model_name in models_to_test:
    print(f"\n🧪 Testing Model: {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        # Record start time
        start = time.time()
        response = model.generate_content("Reply with 'OK' if you can hear me.")
        duration = time.time() - start
        
        print(f"✅ SUCCESS! {model_name} responded in {duration:.2f}s")
        print(f"   Response: {response.text.strip()}")
        
    except Exception as e:
        print(f"❌ FAILED: {model_name}")
        print(f"   Error Details: {e}")