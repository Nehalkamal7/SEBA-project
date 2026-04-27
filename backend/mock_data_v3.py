
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
    print("❌ Users not found. Run mock_data_v2.py first.")
    exit()

print(f"Adding diverse activities for Rahma ({rahma_id}) & Ayman ({ayman_id})...")

# 1. Rahma: Struggling (Fail quizzes, just viewed lessons)
# Add NEGATIVE activities
for i in range(3):
    cursor.execute("""
        INSERT INTO activities (user_id, activity_type, entity_type, entity_id, description, created_at)
        VALUES (?, 'quiz_submitted', 'quiz', 0, 'Failed quiz: Algebra Basics (Score: 40%)', datetime('now', ?))
    """, (rahma_id, f"-{random.randint(1,5)} days"))

# Add NEUTRAL activities (Viewed but maybe not completed)
for i in range(5):
    cursor.execute("""
        INSERT INTO activities (user_id, activity_type, entity_type, entity_id, description, created_at)
        VALUES (?, 'lesson_viewed', 'lesson', 0, 'Started lesson: Quadratic Equations', datetime('now', ?))
    """, (rahma_id, f"-{random.randint(1,10)} days"))

# 2. Ayman: High Performer (mostly positive, some neutral)
# Add some NEUTRAL (Viewing resources)
for i in range(3):
    cursor.execute("""
        INSERT INTO activities (user_id, activity_type, entity_type, entity_id, description, created_at)
        VALUES (?, 'resource_viewed', 'resource', 0, 'Viewed supplementary material', datetime('now', ?))
    """, (ayman_id, f"-{random.randint(1,10)} days"))

conn.commit()
conn.close()
print("🎉 Added diverse activities! Refresh the dashboard.")
