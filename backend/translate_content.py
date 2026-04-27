
import sqlite3
import os
import time
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Error: GEMINI_API_KEY not found.")
    exit(1)

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

db_path = "learning_platform.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Fetch all lessons
cursor.execute("SELECT id, title, content, content_ar FROM Lessons")
lessons = cursor.fetchall()

print(f"Found {len(lessons)} lessons to process.")

for lesson in lessons:
    l_id, title, content, existing_ar = lesson
    print(f"Processing Lesson {l_id}: {title}...")

    first_char = title.strip()[0] if title.strip() else ""
    if first_char.isdigit():
        print(f"  [SKIP] {title} (Already has new title format)")
        continue

    if not content:
        print(f"  [SKIP] {title} (No content found to process)")
        continue

    prompt_en = f"""
    You are an expert Math teacher.
    
    Task 1: Identify the main TOPIC TITLE of this lesson (e.g. "Rational Numbers").
    Task 2: Rewrite the content into a CONCISE LEARNING SUMMARY.
    
    Rules:
    1. Output format MUST be exactly:
       TITLE: [The Title]
       CONTENT:
       [The Markdown Content]
    2. EXCLUDE ALL QUIZZES/QUESTIONS.
    3. Format content sections: 🎯 Objectives, 💡 Core Concepts, 📝 Formulas, ✨ Summary.
    4. Use simple Grade 8 English.
    
    Original Content:
    {content}
    """

    # 2. Translate to Arabic
    prompt_ar = f"""
    You are an expert educational translator for the Egyptian Math curriculum.
    Translate the following Math lesson content into Arabic, preserving the Markdown formatting.
    
    Rules:
    1. Output ONLY the raw markdown.
    2. Keep the exact same Markdown structure (headers, bullet points, bolding).
    3. Arabic text must be professional and grammatically correct.
    4. KEEP ALL LaTeX MATH FORMULAS EXACTLY AS IS (e.g. $x^2$) - do NOT translate variable names (x, y) to Arabic letters.
    5. Translate section headers effectively (e.g. "Objectives" -> "الأهداف").
    6. Use suitable emojis as in the source.
    7. Ensure the order of content mimics the original English flow.
    
    Original Content:
    {content}
    """

    try:
        # Generate English
        resp_en = model.generate_content(prompt_en)
        raw_text = resp_en.text.strip()
        
        # Parse Title and Content
        new_title = title # Fallback
        new_content_en = raw_text
        
        if "CONTENT:" in raw_text:
            parts = raw_text.split("CONTENT:")
            if "TITLE:" in parts[0]:
                extracted_title = parts[0].replace("TITLE:", "").strip()
                # 3. Format Title with Lesson Number
                # Try to extract number from existing title "Term 1 Les5" -> 5
                import re
                match = re.search(r'Les\s*(\d+)', title, re.IGNORECASE)
                if match:
                    num = match.group(1)
                    new_title = f"{num}. {extracted_title}"
                else:
                    new_title = extracted_title
            
            new_content_en = parts[1].strip()
            
        # Clean markdown fences
        if new_content_en.startswith("```markdown"):
            new_content_en = new_content_en.replace("```markdown", "").replace("```", "").strip()
        elif new_content_en.startswith("```"):
            new_content_en = new_content_en.replace("```", "").strip()

        # Generate Arabic
        resp_ar = model.generate_content(prompt_ar + f"\n\nContext - The English content is:\n{new_content_en}")
        new_content_ar = resp_ar.text.strip()
        
        if new_content_ar.startswith("```markdown"):
            new_content_ar = new_content_ar.replace("```markdown", "").replace("```", "").strip()
        elif new_content_ar.startswith("```"):
            new_content_ar = new_content_ar.replace("```", "").strip()

        # Update DB
        cursor.execute("""
            UPDATE Lessons 
            SET title = ?, content_en = ?, content_ar = ? 
            WHERE id = ?
        """, (new_title, new_content_en, new_content_ar, l_id))
        conn.commit()
        
        print(f"  [OK] Updated Title ('{new_title}') & Content for {title}")
        
    except Exception as e:
        print(f"  [ERROR] Error processing {title}: {str(e)}")
    
    # Sleep to avoid hitting rate limits
    time.sleep(2)

conn.close()
print("\n[DONE] All lessons updated!")
