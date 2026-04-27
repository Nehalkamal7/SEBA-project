import os
import asyncio
import re
import aiohttp
import google.generativeai as genai
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Import models
from models import Lesson, StudentSentiment, TeacherNote, User, Enrollment, Activity
# Import engines
from nlp_engine import analyze_sentiment, extract_learning_insight
from vector_store import KnowledgeBase
# IMPORT THE QUIZ ENGINE
from quiz_engine import generate_personalized_quiz

# --- Configuration ---
load_dotenv()

# --- LAZY LOADING KNOWLEDGE BASE ---
_kb = None

def get_kb():
    global _kb
    if _kb is None:
        try:
            print("⏳ Loading Knowledge Base... (Lazy Load)")
            _kb = KnowledgeBase()
            print("✅ Knowledge Base Ready.")
        except Exception as e:
            print(f"⚠️ Warning: Could not load Knowledge Base: {e}")
            return None
    return _kb

try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"Error configuring Generative AI: {e}")
    genai = None

def clean_query_for_search(query: str) -> str:
    """Clean query by removing LaTeX math notation and special characters."""
    # Remove LaTeX math delimiters and content: $...$ or $$...$$
    query = re.sub(r'\$+[^$]*\$+', '', query)
    # Remove LaTeX commands like \angle, \circ, etc.
    query = re.sub(r'\\[a-zA-Z]+\{?[^}]*\}?', '', query)
    # Remove extra whitespace
    query = ' '.join(query.split())
    # Remove trailing periods and commas
    query = query.rstrip('.,;')
    return query.strip()

# --- ASYNC IMAGE INJECTOR ---
async def fetch_image_url(session, query, api_key):
    """Async helper to fetch a single image URL using SerpApi."""
    # Clean the query first - remove LaTeX and math notation
    clean_query = clean_query_for_search(query)
    
    url = "https://serpapi.com/search"
    params = {
        "q": clean_query,
        "api_key": api_key,
        "tbm": "isch",  # Image search
        "num": 1,
        "safe": "active"
    }
    try:
        timeout = aiohttp.ClientTimeout(total=10)  # Increased timeout to 10 seconds
        async with session.get(url, params=params, timeout=timeout) as response:
            if response.status == 200:
                data = await response.json()
                # SerpApi returns images in 'images_results' array
                if "images_results" in data and data["images_results"]:
                    image_url = data["images_results"][0]["original"]
                    print(f"✅ Image found for '{clean_query}': {image_url}")
                    return query, image_url
                else:
                    print(f"⚠️ No images found for query: {clean_query}")
            elif response.status == 403:
                # API access denied - likely wrong key or rate limit
                error_data = await response.json()
                error_msg = error_data.get("error", "Unknown error")
                print(f"❌ SerpApi Access Denied (403): {error_msg}")
                print(f"   💡 Check: 1) API key is valid")
                print(f"            2) You have remaining searches in your quota")
                # Return a special marker to indicate API access denied
                return query, "API_ACCESS_DENIED"
            else:
                error_text = await response.text()
                print(f"❌ Image API Error ({response.status}) for '{clean_query}': {error_text[:200]}")
    except asyncio.TimeoutError:
        print(f"⏱️ Image fetch timeout for query: {clean_query}")
    except Exception as e:
        print(f"❌ Image Fetch Error ({clean_query}): {type(e).__name__}: {e}")
    return query, None

async def inject_real_images_async(text: str):
    """
    Finds [Image of X] tags and fetches them in PARALLEL using SerpApi.
    """
    if not text:
        return ""

    api_key = os.getenv("SERPAPI_KEY")
    
    # ✅ YOUR EXACT REGEX PATTERN (Restored & Verified)
    pattern = r"\[Image of ([^\]]+)\]"
    
    try:
        # 1. Find all queries first
        matches = re.findall(pattern, text)
        
        if not matches:
            return text

        if not api_key:
            print("⚠️ SerpApi not configured. SERPAPI_KEY missing.")
            # Fallback: Simple string replacement to avoid regex issues in fallback text
            return text.replace("[Image of", "*(Image Search Not Configured:").replace("]", ")*")
        
        # Track if we got a 403 error (API access denied)
        api_access_denied = False

        print(f"🔍 Searching for {len(matches)} image(s): {matches}")
        
        # 2. Create parallel tasks with proper error handling
        async with aiohttp.ClientSession() as session:
            tasks = [fetch_image_url(session, query, api_key) for query in matches]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        # 3. Create a replacement map, handling exceptions
        replacements = {}
        api_access_denied = False
        for result in results:
            if isinstance(result, Exception):
                print(f"❌ Task exception: {result}")
                if "403" in str(result) or "access" in str(result).lower():
                    api_access_denied = True
                continue
            query, url = result
            if url and url != "API_ACCESS_DENIED":
                replacements[query] = url
            elif url == "API_ACCESS_DENIED":
                api_access_denied = True

        # 4. Replace in text using the map
        def replace_callback(match):
            query = match.group(1)
            url = replacements.get(query)
            if url:
                print(f"✅ Image injected for: {query}")
                return f"![{query}]({url})"
            # Check if it's an API access issue
            clean_q = clean_query_for_search(query)
            if api_access_denied:
                return f"*(Image search unavailable - SerpApi access denied. Please check your API key and quota.)*"
            print(f"⚠️ No image URL found for: {clean_q}")
            return f"*(No image found for {clean_q})*"

        final_text = re.sub(pattern, replace_callback, text)
        print(f"📝 Image injection complete. Found {len(replacements)}/{len(matches)} images.")
        return final_text
        
    except Exception as e:
        print(f"❌ Image Injection Logic Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return text

# --- BACKGROUND TASK: SAVE MEMORY ---
async def save_memory_background(user_id: int, user_message: str, translated_text: str, emotion: str, db: Session):
    try:
        # 1. Save Sentiment
        db.add(StudentSentiment(
            student_id=user_id,
            original_message=user_message,
            translated_message=translated_text,
            sentiment_label=emotion,
            confidence_score=0.9
        ))
        
        # 2. Extract & Save Teacher Notes
        insight = await extract_learning_insight(user_message, translated_text)
        if insight:
            print(f"📝 Background Note Saved: {insight['note']}")
            db.add(TeacherNote(
                student_id=user_id,
                note_content=insight["note"],
                weight=insight["weight"]
            ))
        db.commit()
    except Exception as e:
        print(f"⚠️ Background Memory Error: {e}")

# --- Main Chat Logic ---
async def get_ai_response(user_message: str, lesson_id: int, user_id: int, db: Session):
    
    clean_msg = user_message.lower().strip()

    # --- 0. SIMPLE GREETING HANDLER (Fast Response) ---
    greeting_keywords = ["hi", "hello", "hey", "marhaba", "السلام عليكم", "ازيك", "ازيك يا"]
    is_simple_greeting = any(keyword in clean_msg for keyword in greeting_keywords) and len(clean_msg) < 20
    
    if is_simple_greeting:
        # Get lesson title for context
        sys_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        lesson_title = sys_lesson.title if sys_lesson else "this lesson"
        student = db.query(User).filter(User.id == user_id).first()
        student_name = student.name if student else "there"
        
        return f"Hi {student_name}! 👋 Ready to explore **{lesson_title}**? Ask me anything about the topics covered here, or type 'quiz me' if you want to test your understanding!"

    # --- 1. INTENT DETECTION: QUIZ (Preserved) ---
    if "quiz" in clean_msg or "test me" in clean_msg:
        print(f"🎯 Quiz Intent Detected for Lesson ID: {lesson_id}")
        quiz_data = await generate_personalized_quiz(user_id, db, lesson_id)
        
        if quiz_data.get("error"):
            return "I couldn't generate a quiz right now. Please try again later."
            
        return {
            "type": "quiz_widget",
            "message": "I've generated a personalized quiz based on this lesson and your learning history. Give it a try!",
            "data": quiz_data
        }

    if not genai:
        return "The AI service is not configured. Please check the API key."

    # --- 2. GET CURRENT LESSON CONTENT + RAG SEARCH ---
    # We get the lesson info directly from the DB
    sys_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not sys_lesson:
        return "I couldn't find information about this lesson. Please try again."
    
    current_lesson_title = sys_lesson.title
    current_lesson_content = sys_lesson.content or "No content available for this lesson."
    current_course_id = sys_lesson.course_id

    print(f"🚀 Processing message for lesson: {current_lesson_title}")

    # --- 3. PARALLEL EXECUTION (Sentiment + RAG) ---
    # NLP Task
    task_sentiment = analyze_sentiment(user_message)

    # RAG Logic - Search full library for related content
    kb_instance = get_kb()
    should_search_rag = (len(clean_msg) > 3) and (kb_instance is not None)

    if should_search_rag:
        # SEARCH THE FULL LIBRARY (Term 1 & Term 2) for additional context
        task_rag = asyncio.to_thread(kb_instance.search, user_message, current_course_id, 3)
    else:
        async def empty_rag(): return []
        task_rag = empty_rag()

    # Execution
    try:
        sentiment_result, rag_docs = await asyncio.gather(task_sentiment, task_rag)
    except Exception as e:
        print(f"⚠️ Pipeline Warning: {e}")
        sentiment_result = {"top_emotion": "neutral", "translated_text": user_message}
        rag_docs = []
    
    emotion = sentiment_result.get("top_emotion", "neutral")
    translated_text = sentiment_result.get("translated_text", user_message)
    
    print(f"✅ Processing Complete. Emotion: {emotion}, RAG Docs: {len(rag_docs)}")

    # --- 4. BACKGROUND MEMORY ---
    asyncio.create_task(save_memory_background(user_id, user_message, translated_text, emotion, db))

    # --- 5. CONTEXT PREP (CURRENT LESSON + LIBRARY) ---
    # Retrieve Student Info
    student = db.query(User).filter(User.id == user_id).first()
    student_name = student.name if student else "Student"
    
    notes = db.query(TeacherNote).filter(TeacherNote.student_id == user_id).order_by(TeacherNote.created_at.desc()).limit(3).all()
    notes_txt = "\n".join([f"- {n.note_content}" for n in notes]) if notes else "No specific notes."

    # RAG CONTEXT (Additional Reference Material)
    rag_context = ""
    if rag_docs:
        rag_context = "\n### ADDITIONAL REFERENCE MATERIAL (Other Lessons):\n"
        for doc in rag_docs:
            # Check if this is from a different lesson
            is_different_lesson = doc['title'] != current_lesson_title
            rag_context += f"--- REFERENCE: {doc['title']} {'(OUT OF CURRENT SCOPE)' if is_different_lesson else ''} ---\n{doc['text']}\n"

 # --- 6. PROMPT ENGINEERING (HYBRID APPROACH) ---
    
    # Dynamic Instruction based on Emotion
    pedagogical_strategy = "Be encouraging and clear."
    if emotion in ["annoyance", "anger", "frustration"]:
        pedagogical_strategy = "The student is FRUSTRATED. Validate their feelings first. Be extra patient. Break the explanation down into very small, simple steps."
    elif emotion in ["confusion", "nervousness"]:
        pedagogical_strategy = "The student is CONFUSED. Do not just give the answer; explain the 'Why' behind it using simple analogies."

    final_prompt = f"""
    You are 'IntelliStudy', an expert AI Math Tutor for the Egyptian National Curriculum.
    
    **STUDENT PROFILE:**
    - Name: {student_name}
    - Detected Emotion: {emotion}
    - Teacher Notes: {notes_txt}
    
    **CURRENT LESSON (PRIMARY FOCUS):**
    Title: {current_lesson_title}
    Content:
    {current_lesson_content}
    
    {rag_context}
    
    **USER MESSAGE:** "{user_message}"
    
    **CORE INSTRUCTIONS:**
    1. **PEDAGOGY:** {pedagogical_strategy}
    2. **LANGUAGE:** Match the student's language strictly. 
       - If they speak Egyptian Arabic (Masri), reply in friendly Masri mixed with English technical terms.
       - If they speak English, reply in English.
    
    **SCOPE MANAGEMENT RULES:**
    1. **PRIMARY FOCUS:** Always prioritize content from the CURRENT LESSON ({current_lesson_title}) when answering.
    
    2. **OUT-OF-SCOPE QUESTIONS:** If a question is about a topic NOT in the current lesson but IS found in the "ADDITIONAL REFERENCE MATERIAL":
       - You MAY answer it, BUT you MUST start with a clear disclaimer:
         "⚠️ **Note:** This topic is covered in [Lesson Name], not in our current lesson ({current_lesson_title}). Here's what you need to know:"
       - Then provide a helpful answer based on that reference material
       - Cite the source lesson clearly: [Term X LesY]
    
    3. **COMPLETELY UNKNOWN TOPICS:** If a question is about something NOT in the current lesson AND NOT in the reference material:
       - Politely decline: "That's a great question! However, I don't have information about that topic in our current curriculum. Let's focus on {current_lesson_title} for now, or feel free to ask about other lessons in the Math Grade 8 course."
    
    4. **VISUALS:** If explaining a geometric shape or complex concept, include an image tag: [Image of concept].
    
    **FORMATTING:**
    - Use LaTeX for ALL math equations: $x^2 + y^2 = z^2$.
    - Keep paragraphs short and readable.
    - Always cite lesson sources when using reference material
    
    Answer the student now:
    """

    print("🤖 Generating Final Response...")
    model = genai.GenerativeModel('gemini-2.5-flash') 
    response = await model.generate_content_async(final_prompt)
    
    # --- 6. ASYNC INTERCEPTOR (Preserved) ---
    final_text = await inject_real_images_async(response.text)
    
    return final_text