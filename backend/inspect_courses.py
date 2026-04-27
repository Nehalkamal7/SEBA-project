
import sqlite3

db_path = "learning_platform.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get courses
print("Courses Table:")
try:
    cursor.execute("SELECT * FROM Courses;")
    courses = cursor.fetchall()
    for c in courses:
        print(f"Course: {c[1]} (ID: {c[0]}) Term: {c[7]}")
        cursor.execute("SELECT title, `order` FROM Lessons WHERE course_id = ? ORDER BY `order` LIMIT 3", (c[0],))
        lessons = cursor.fetchall()
        print("  First 3 lessons:")
        for l in lessons:
            print(f"    - {l[0]}")
        cursor.execute("SELECT COUNT(*) FROM Lessons WHERE course_id = ?", (c[0],))
        count = cursor.fetchone()[0]
        print(f"  Total lessons: {count}")
        print("-" * 20)
except Exception as e:
    print(e)
    
conn.close()
