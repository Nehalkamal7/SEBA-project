
import sqlite3
import random
from datetime import datetime, timedelta

db_path = "learning_platform.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def get_user_id(email):
    cursor.execute("SELECT id FROM Users WHERE email = ?", (email,))
    res = cursor.fetchone()
    return res[0] if res else None

rahma_id = get_user_id("rahma@example.com")
ayman_id = get_user_id("ayman@example.com")

if not rahma_id or not ayman_id:
    print("[ERROR] Users not found.")
    exit()

print("[INFO] Injecting MASSIVE mock data (Quizzes & Sentiments)...")

# 1. Ayman: (Already done, commenting out to avoid duplicates)
# for i in range(12):
#    score = random.randint(88, 100)
#    ...

# 3. Rahma: Add VARIED Real Quizzes (Struggling but varied)
# She currently has 3 static 40% scores. Let's add 6 more with noise.
print("[INFO] Adding varied quizzes for Rahma...")
for i in range(6):
    score = random.randint(35, 58) # Low scores
    day_offset = random.randint(1, 25)
    lesson_num = random.randint(1, 20)
    cursor.execute("""
        INSERT INTO activities (user_id, activity_type, entity_type, entity_id, description, created_at)
        VALUES (?, 'quiz_submitted', 'quiz', 0, ?, datetime('now', ?))
    """, (rahma_id, f"Submitted quiz: Lesson {lesson_num} (Score: {score}%)", f"-{day_offset} days"))

# 2. Add Sentiments Helper
sentiments_pool = [
    ("neutral", ["Okay", "I understand", "Fine", "Next", "Ready"]),
    ("curiosity", ["Why?", "How does this work?", "Tell me more", "Interesting", "Can you explain?"]),
    ("gratitude", ["Thanks", "Thank you", "Great help", "Appreciate it"]),
    ("confusion", ["I am lost", "Not sure", "Hard to follow", "What?", "Confused"]), 
    ("joy", ["Wow!", "Awesome", "I did it!", "Solved it!", "Fun"]), 
]

def add_sentiments(uid, count, weights):
    choices = random.choices(sentiments_pool, weights=weights, k=count)
    for cls, msgs in choices:
        msg = random.choice(msgs)
        cursor.execute("""
            INSERT INTO student_sentiments (student_id, original_message, translated_message, sentiment_label, confidence_score, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now', ?))
        """, (uid, msg, msg, cls, random.uniform(0.7, 0.99), f"-{random.randint(1, 30)} days"))

# 4. Add MORE Sentiments (Generic)
# Let's add a few more "Frustration" for Rahma to match low scores
add_sentiments(rahma_id, 10, [0.1, 0.0, 0.0, 0.9, 0.0]) # Mostly confusion/frustration

conn.commit()
conn.close()
print("[SUCCESS] Added 6 varied quizzes for Rahma.")

