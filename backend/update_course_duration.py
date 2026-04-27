
import sqlite3

db_path = "learning_platform.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Recalculating course durations...")

# Get Course IDs
cursor.execute("SELECT id, title FROM Courses")
courses = cursor.fetchall()

for course in courses:
    c_id, title = course
    
    # Sum duration of all lessons in this course
    cursor.execute("SELECT SUM(duration) FROM Lessons WHERE course_id = ?", (c_id,))
    total_minutes = cursor.fetchone()[0] or 0
    
    # Update Course Duration
    cursor.execute("UPDATE Courses SET duration = ? WHERE id = ?", (total_minutes, c_id))
    
    # Convert to Hours:Minutes for display log
    hours = total_minutes // 60
    minutes = total_minutes % 60
    
    print(f"✅ Updated '{title}': {total_minutes} min ({hours}h {minutes}m)")

conn.commit()
conn.close()
print("\n🎉 Course durations updated!")
