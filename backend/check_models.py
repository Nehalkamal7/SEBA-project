import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ No API Key found.")
    exit()

genai.configure(api_key=api_key)

print(f"🔍 Checking available models for your API key...")
print("-" * 40)

try:
    # This queries Google's servers for the list
    for m in genai.list_models():
        # We only care about models that can generate text (chatbots)
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ Name: {m.name}")
            print(f"   Description: {m.description}")
            print("-" * 40)

except Exception as e:
    print(f"❌ Error listing models: {e}")