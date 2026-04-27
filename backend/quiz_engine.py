import os
import json
import google.generativeai as genai
from sqlalchemy.orm import Session
from sqlalchemy import desc

# Import your models
from models import User, Lesson, Course, StudentSentiment

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

def get_model():
    return genai.GenerativeModel('gemini-2.5-flash')

async def generate_personalized_quiz(user_id: int, db: Session, target_lesson_id: int):
    """
    Generates a quiz covering the TARGET lesson AND reviewing PREVIOUS lessons.
    Adjusts difficulty based on student sentiment.
    """
    
    # --- 1. GET CONTEXT (Current & Past) ---
    # Get the specific lesson the user is on
    current_lesson = db.query(Lesson).filter(Lesson.id == target_lesson_id).first()
    if not current_lesson:
        return {"error": True, "message": "Lesson not found."}

    # Get the student profile
    student = db.query(User).filter(User.id == user_id).first()
    student_name = student.name if student else "Student"

    # Get previous lessons in this course (for review questions)
    # We assume 'id' indicates order. If you have an 'order' column, use that instead.
    past_lessons = db.query(Lesson).filter(
        Lesson.course_id == current_lesson.course_id,
        Lesson.id < current_lesson.id,  # Less than current ID = Previous
        Lesson.content != None          # Only lessons that have content
    ).limit(3).all()                    # Limit to last 3 to save context window

    # Prepare Context Strings
    current_topic_content = current_lesson.content or "No content available."
    
    review_topics_str = "No previous topics."
    if past_lessons:
        review_topics_str = "\n".join([
            f"- Lesson '{p.title}': {p.content[:300]}..." # Take first 300 chars as summary
            for p in past_lessons
        ])

    print(f"🧠 Quiz Engine: Generating quiz for {student_name} on {current_lesson.title} + Review...")

    # --- 2. DETECT EMOTION (The Sentiment Part) ---
    # Fetch the last sentiment record
    latest_sentiment = db.query(StudentSentiment).filter(
        StudentSentiment.student_id == user_id
    ).order_by(desc(StudentSentiment.created_at)).first()
    
    emotion = latest_sentiment.sentiment_label if latest_sentiment else "neutral"
    
    # Adjust Difficulty & Tone based on Emotion
    if emotion in ["annoyance", "anger", "frustration", "nervousness", "confusion"]:
        difficulty = "EASY"
        tone_instruction = f"The student is feeling {emotion}. Be very encouraging. Use simpler language. Focus on building confidence."
    elif emotion in ["boredom"]:
        difficulty = "HARD"
        tone_instruction = "The student is bored. Challenge them with an interesting or tricky application problem."
    elif emotion in ["joy", "excitement", "curiosity"]:
        difficulty = "MEDIUM-HARD"
        tone_instruction = "The student is excited! Keep the momentum high with interesting questions."
    else:
        difficulty = "MEDIUM" # Standard
        tone_instruction = "Standard academic tone."

    # --- 3. CONSTRUCT THE PROMPT ---
    prompt = f"""
    You are an expert tutor creating a personalized quiz for {student_name}.
    
    **GOAL:** Create a 5-question quiz.
    - **Question 1 & 2:** Must be about the CURRENT LESSON.
    - **Question 3:** Must be a REVIEW question from PREVIOUS LESSONS (Spaced Repetition).

    **CONTEXT:**
    1. CURRENT LESSON: "{current_lesson.title}"
       Content: {current_topic_content}
    
    2. PREVIOUS LESSONS (For Review):
       {review_topics_str}

    **PERSONALIZATION SETTINGS:**
    - Student Emotion: {emotion}
    - Quiz Difficulty: {difficulty}
    - Tone Strategy: {tone_instruction}

    **OUTPUT FORMAT:**
    Return strictly valid JSON with this structure:
    {{
      "title": "A fun title based on the emotion (e.g., 'Confidence Booster Quiz')",
      "difficulty": "{difficulty}",
      "questions": [
        {{
          "id": 1,
          "text": "The question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_option_index": 0 
        }}
      ]
    }}
    """

    # --- 4. GENERATE & RETURN ---
    try:
        model = get_model()
        response = await model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        return json.loads(response.text)

    except Exception as e:
        print(f"❌ Quiz Generation Error: {e}")
        return {
            "error": True, 
            "message": "AI failed to generate quiz. Please try again."
        }