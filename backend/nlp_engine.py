import os
import re
import asyncio  # <--- NEW: Essential for non-blocking speed
import google.generativeai as genai
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from dotenv import load_dotenv

load_dotenv()

# --- 1. EAGER LOADING (The Fix) ---
# We load the heavy model IMMEDIATELY when the server starts.
print("⏳ Initializing Local AI Engine... (This may take 10-20 seconds)")

try:
    model_name = "SamLowe/roberta-base-go_emotions"
    
    # 1. Load Tokenizer & Model manually from disk (Offline Mode)
    # This prevents the network loop AND the "unexpected keyword" error
    tokenizer = AutoTokenizer.from_pretrained(model_name, local_files_only=True)
    model = AutoModelForSequenceClassification.from_pretrained(model_name, local_files_only=True)

    # 2. Create the pipeline with the pre-loaded components
    LOCAL_EMOTION_PIPELINE = pipeline(
        "text-classification",
        model=model, 
        tokenizer=tokenizer,
        top_k=None  # Fixes the deprecated warning
    )
    print("✅ Local Emotion Model Loaded Successfully into RAM.")

except Exception as e:
    # If the model isn't downloaded yet, this will catch it
    print(f"⚠️ CRITICAL: Could not load Local Model. Ensure it is cached. {e}")
    LOCAL_EMOTION_PIPELINE = None

# Configure Gemini for the lighter tasks
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# --- HELPER FUNCTIONS ---

def get_gemini_flash():
    # Use Flash for speed on the cloud side
    return genai.GenerativeModel('gemini-2.5-flash')

def contains_arabic(text: str) -> bool:
    """
    Checks if the string contains any characters in the Arabic Unicode range.
    Range \u0600-\u06FF covers the primary Arabic block.
    """
    return bool(re.search(r'[\u0600-\u06FF]', text))

def create_translation_prompt(message: str) -> str:
    """
    A refined prompt that handles Egyptian Arabic Dialect while 
    strictly preserving any English words or technical terms found in the text.
    """
    return f"""
    You are an expert translator specializing in **Egyptian Arabic Dialect**.
    
    **YOUR GOAL:**
    Translate the Arabic parts of the following message into English to capture the student's emotional intent.
    
    **CRITICAL RULES:**
    1. **ARABIC ONLY:** Translate ONLY the Arabic words. 
    2. **PRESERVE ENGLISH:** Do NOT change, rephrase, or correct any English words, code snippets, or technical terms already present in the message. Keep them exactly as they are.
    3. **OUTPUT:** Return the final hybrid sentence in full English (where Arabic is translated and English is kept).

    **Input Message:** "{message}"
    
    **Translation:**
    """

# --- MAIN ENGINES ---

async def analyze_sentiment(message: str):
    """
    Hybrid Pipeline: 
    1. Gatekeeper -> Checks if translation is needed.
    2. Gemini (Cloud) -> Translates Egyptian Arabic to English (if needed).
    3. RoBERTa (Local) -> Analyzes Emotion on your GPU/CPU (Running in a thread to avoid blocking).
    """
    # 1. Check if local model is alive
    if not LOCAL_EMOTION_PIPELINE:
        print("⚠️ Local model missing, returning neutral.")
        return {"top_emotion": "neutral", "top_3_emotions": [], "translated_text": message}

    try:
        # 2. LANGUAGE GATEKEEPER
        # If Arabic is detected, we translate. If pure English, we skip Gemini to save time & reduce error.
        if contains_arabic(message):
            print(f"🌍 Arabic detected in: '{message}' -> Translating...")
            translation_model = get_gemini_flash()
            prompt = create_translation_prompt(message)
            response = await translation_model.generate_content_async(prompt)
            translated_text = response.text.strip()
            print(f"✅ Translated: {translated_text}")
        else:
            # Pure English input (e.g., "I hate strings") -> Pass directly to emotion engine
            translated_text = message

        # 3. Analyze using Local Model (RoBERTa) - NON-BLOCKING OPTIMIZATION
        # We define a synchronous helper function to run the model
        def run_local_inference(text):
            return LOCAL_EMOTION_PIPELINE(text)[0]

        # We await it using to_thread so the main server loop doesn't freeze while the CPU calculates
        emotion_scores_list = await asyncio.to_thread(run_local_inference, translated_text)
        
        # 4. Process Results
        scores = {item['label']: round(item['score'], 4) for item in emotion_scores_list}
        top_emotion = max(scores, key=scores.get)
        sorted_emotions = sorted(scores.items(), key=lambda item: item[1], reverse=True)[:3]
        
        return {
            "top_emotion": top_emotion,
            "top_3_emotions": sorted_emotions,
            "translated_text": translated_text
        }

    except Exception as e:
        print(f"❌ NLP Pipeline Error: {e}")
        # Fail gracefully to neutral
        return {
            "top_emotion": "neutral", 
            "top_3_emotions": [], 
            "translated_text": message
        }

async def extract_learning_insight(original_message: str, translated_message: str) -> dict:
    """
    Uses Gemini to extract pedagogical insights for the teacher dashboard.
    """
    model = get_gemini_flash() 
    
    prompt = f"""
    You are an expert educational psychologist.
    
    **TASK:**
    Analyze this student message for specific learning indicators.
    Original: "{original_message}"
    Translated: "{translated_message}"
    
    **CRITERIA:**
    1. Does the student reveal a specific **misconception**?
    2. Is there a **gap in prerequisite knowledge**?
    3. Is there a clear **strength** or **interest**?
    
    **OUTPUT:**
    - If YES: Return a concise note (max 6 words). Example: "Struggles with loops", "Confused by recursion".
    - If NO (e.g., just greetings or generic frustration): Return "None".
    """
    
    try:
        response = await model.generate_content_async(prompt)
        note_content = response.text.strip()
        
        # Filter out "None" or very short/empty responses
        if "None" in note_content or len(note_content) < 3:
            return None

        return {
            "note": note_content,
            "weight": 1.5  # Default weight for a new insight
        }
        
    except Exception as e:
        print(f"Error extracting insight: {e}")
        return None