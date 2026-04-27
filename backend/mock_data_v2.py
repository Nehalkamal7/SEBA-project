
import sqlite3
import random
from datetime import datetime, timedelta

db_path = "learning_platform.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("🌱 Seeding realistic mock data...")

# 1. Get User IDs (or create if missing)
def get_or_create_user(name, email):
    cursor.execute("SELECT id FROM Users WHERE email = ?", (email,))
    res = cursor.fetchone()
    if res:
        return res[0]
    dummy_hash = "$2b$12$dummyhash............"
    cursor.execute("""
        INSERT INTO Users (name, email, hashed_password, role, created_at)
        VALUES (?, ?, ?, 'student', datetime('now', '-30 days'))
    """, (name, email, dummy_hash))
    return cursor.lastrowid

rahma_id = get_or_create_user("Rahma Omar", "rahma@example.com")
ayman_id = get_or_create_user("Ayman Elemam", "ayman@example.com")

# 2. Get Courses
cursor.execute("SELECT id FROM Courses")
courses = [r[0] for r in cursor.fetchall()]

# 3. Enroll Students
print("📚 Enrolling students...")
for uid in [rahma_id, ayman_id]:
    # Enroll in 1 or 2 courses
    courses_to_enroll = random.sample(courses, min(len(courses), 2))
    for cid in courses_to_enroll:
        # Check if enrolled
        cursor.execute("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?", (uid, cid))
        if not cursor.fetchone():
            cursor.execute("INSERT INTO enrollments (student_id, course_id, enrolled_at) VALUES (?, ?, datetime('now', '-20 days'))", (uid, cid))
            print(f"  + Enrolled user {uid} in course {cid}")
            
            # Log Enrollment Activity
            cursor.execute("""
                INSERT INTO activities (user_id, activity_type, entity_type, entity_id, description, created_at)
                VALUES (?, 'enrollment', 'course', ?, 'Enrolled in course', datetime('now', '-20 days'))
            """, (uid, cid))

# 4. Mark Lessons as Completed (for Progress)
print("✅ Marking lessons complete...")
for uid in [rahma_id, ayman_id]:
    # Fetch enrolled courses
    cursor.execute("SELECT course_id FROM enrollments WHERE student_id = ?", (uid,))
    my_courses = [r[0] for r in cursor.fetchall()]
    
    for cid in my_courses:
        cursor.execute("SELECT id, title FROM Lessons WHERE course_id = ?", (cid,))
        lessons = cursor.fetchall()
        
        # Random completion rate
        completion_rate = 0.4 if uid == rahma_id else 0.85 # Rahma 40%, Ayman 85%
        completed_count = int(len(lessons) * completion_rate)
        
        for i in range(completed_count):
            lid, ltitle = lessons[i]
            # Check/Update lesson completion? 
            # Actually Lessons table `completed` column is global? No, that's bad design in models.py if true.
            # Checking models.py: `completed = Column(Boolean, default=False)`. Yes, it's global! 
            # That means if one student completes it, it's done for everyone. 
            # This is a schema flaw. But for now, we rely on `Activities` to track progress per user?
            # Or maybe `get_dashboard` looks at `Activity` log?
            # Let's populate `Activity` log for "lesson_completed".
            
            cursor.execute("""
                INSERT INTO activities (user_id, activity_type, entity_type, entity_id, description, created_at)
                VALUES (?, 'lesson_completed', 'lesson', ?, ?, datetime('now', ?))
            """, (uid, lid, f"Completed lesson: {ltitle}", f"-{random.randint(1,15)} days"))
            print(f"  + User {uid} completed {ltitle}")

conn.commit()
conn.close()
print("🎉 Mock data updated (Courses & Activities added)!")
