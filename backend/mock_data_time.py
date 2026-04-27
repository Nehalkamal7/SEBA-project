
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

print("[INFO] Injecting Lesson Progress (Time Spent)...")

# Get Lessons
cursor.execute("SELECT id, course_id FROM lessons")
lessons = cursor.fetchall()
# Group by course
course_lessons = {}
for lid, cid in lessons:
    if cid not in course_lessons: course_lessons[cid] = []
    course_lessons[cid].append(lid)

# Helper to add progress
def add_progress(uid, courses_limit, time_range_min, time_range_max):
    # Pick random courses
    course_ids = list(course_lessons.keys())
    selected_courses = random.sample(course_ids, min(len(course_ids), courses_limit))
    
    count = 0
    for cid in selected_courses:
        # Pick random lessons in this course to have progress
        c_lessons = course_lessons[cid]
        # 50-80% of lessons in the course have time
        num_lessons = max(1, int(len(c_lessons) * 0.7))
        selected_lessons = random.sample(c_lessons, num_lessons)
        
        for lid in selected_lessons:
            minutes = random.randint(time_range_min, time_range_max)
            seconds = minutes * 60
            
            # Check if exists
            cursor.execute("SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_id = ?", (uid, lid))
            exists = cursor.fetchone()
            
            if exists:
                cursor.execute("UPDATE lesson_progress SET time_spent_seconds = time_spent_seconds + ? WHERE id = ?", (seconds, exists[0]))
            else:
                cursor.execute("""
                    INSERT INTO lesson_progress (user_id, lesson_id, time_spent_seconds, last_accessed)
                    VALUES (?, ?, ?, datetime('now', '-1 day'))
                """, (uid, lid, seconds))
            count += 1
    return count

# Rahma: Moderate time (10-30 mins per lesson)
c1 = add_progress(rahma_id, 3, 5, 35)
print(f"Added progress for Rahma: {c1} lessons.")

# Ayman: High time (20-60 mins per lesson)
c2 = add_progress(ayman_id, 4, 15, 60)
print(f"Added progress for Ayman: {c2} lessons.")

conn.commit()
conn.close()
print("[SUCCESS] Time tracking data injected.")
