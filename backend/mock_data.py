
import sqlite3
import random
from datetime import datetime, timedelta

db_path = "learning_platform.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def get_or_create_user(name, email):
    cursor.execute("SELECT id FROM Users WHERE email = ?", (email,))
    res = cursor.fetchone()
    if res:
        return res[0]
    
    # Hash password '123456' (placeholder)
    # Using a simple string or just inserting dummy hash. The system likely uses bcrypt.
    # We'll just put a dummy string, they won't login with this script anyway.
    dummy_hash = "$2b$12$eGv.eA.M7C.u2x.9.e.2.u.2.u2.u2.u2.u2.u2.u2.u2.u2"
    cursor.execute("""
        INSERT INTO Users (name, email, hashed_password, role, created_at)
        VALUES (?, ?, ?, 'student', datetime('now', '-7 days'))
    """, (name, email, dummy_hash))
    return cursor.lastrowid

rahma_id = get_or_create_user("Rahma Omar", "rahma@example.com")
ayman_id = get_or_create_user("Ayman Elemam", "ayman@example.com")

print(f"✅ Users ready: Rahma (ID {rahma_id}), Ayman (ID {ayman_id})")

# --- EMOTIONS (RoBERTa labels) ---
# 28 labels: admiration, amusement, anger, annoyance, approval, caring, confusion, curiosity, desire, disappointment, disapproval, disgust, embarrassment, excitement, fear, gratitude, grief, joy, love, nervousness, optimism, pride, realization, relief, remorse, sadness, surprise, neutral

rahma_emotions = [
    ("confusion", "I don't understand how to simplify this root.", 0.85),
    ("nervousness", "I am worried about the quiz tomorrow.", 0.72),
    ("curiosity", "Why do we flip the fraction when dividing exponents?", 0.91),
    ("relief", "Oh, I get it now! Thanks.", 0.88),
    ("confusion", "Wait, is this applicable to negative numbers?", 0.65)
]

ayman_emotions = [
    ("excitement", "This is so cool! Math is fun.", 0.95),
    ("joy", "I solved it!", 0.92),
    ("curiosity", "Can we apply this to 3D shapes?", 0.89),
    ("pride", "I got full marks on the quiz.", 0.98),
    ("optimism", "I think I can do the advanced problems.", 0.75)
]

def add_emotions(user_id, emotions_list):
    base_time = datetime.now() - timedelta(days=5)
    for i, (label, text, score) in enumerate(emotions_list):
        ts = base_time + timedelta(days=i, hours=random.randint(9, 15))
        cursor.execute("""
            INSERT INTO student_sentiments (student_id, original_message, translated_message, sentiment_label, confidence_score, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, text, text, label, score, ts))
        print(f"  + Added emotion '{label}' for user {user_id}")

add_emotions(rahma_id, rahma_emotions)
add_emotions(ayman_id, ayman_emotions)

# --- TEACHER NOTES (Insights) ---
notes = [
    (rahma_id, "Struggles with radical simplification rules.", 1.5),
    (rahma_id, "Anxious about assessments, needs encouragement.", 1.2),
    (ayman_id, "Strong grasp of concepts, seeks enrichment.", 1.0),
    (ayman_id, "High engagement, potential peer tutor.", 1.0)
]

for uid, content, weight in notes:
    ts = datetime.now() - timedelta(days=random.randint(1, 3))
    cursor.execute("""
        INSERT INTO teacher_notes (student_id, note_content, weight, created_at)
        VALUES (?, ?, ?, ?)
    """, (uid, content, weight, ts))

conn.commit()
conn.close()
print("✅ Mock data populated successfully!")
