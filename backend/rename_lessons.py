
import sqlite3
import os
import re
import time
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

db_path = "learning_platform.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Fetch lessons with old naming convention
cursor.execute("SELECT id, title, content FROM Lessons WHERE title LIKE 'Term%'")
lessons = cursor.fetchall()
print(f"Found {len(lessons)} lessons to rename.")

for lesson in lessons:
    l_id, title, content = lesson
    
    # Extract order number from existing title "Term 1 Les5" -> 5
    num = "0"
    match = re.search(r'Les\s*(\d+)', title, re.IGNORECASE)
    if match:
        num = match.group(1)
    
    # Prompt for Title Only
    prompt = f"""
    Identify the main TOPIC TITLE of this Math lesson content in 2-5 words.
    Example: "Rational Numbers", "Solving Quadratic Equations", "Geometric Projections".
    Output ONLY the title text. Do not include quotes or "Title:".
    
    Content Preview:
    {(content or "")[:1000]}
    """
    
    try:
        response = model.generate_content(prompt)
        extracted_title = response.text.strip().replace('"', '').replace("Title:", "").strip()
        
        # New Title Format: "5. Rational Numbers"
        new_title = f"{num}. {extracted_title}"
        
        cursor.execute("UPDATE Lessons SET title = ? WHERE id = ?", (new_title, l_id))
        conn.commit()
        print(f"✅ Renamed: '{title}' -> '{new_title}'")
        
        time.sleep(1) # Small buffer
        
    except Exception as e:
        print(f"❌ Error renaming {title}: {e}")

conn.close()
print("\n🎉 Fast renaming complete!")
