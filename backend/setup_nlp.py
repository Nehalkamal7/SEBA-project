
from transformers import AutoTokenizer, AutoModelForSequenceClassification

model_name = "SamLowe/roberta-base-go_emotions"

print(f"⏳ Downloading {model_name}... This may take a while.")

try:
    # Force download by setting local_files_only=False (default)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    
    print(f"✅ Successfully downloaded and cached {model_name}")
    print("You can now run the app with 'local_files_only=True'")
    
except Exception as e:
    print(f"❌ Failed to download model: {e}")
