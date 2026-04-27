
import sqlite3

db_path = "learning_platform.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get table info
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables:", tables)

courses_table = next((t[0] for t in tables if t[0] == 'Courses'), None)
if courses_table:
    print("\nCourses Table Found!")
    cursor.execute("SELECT * FROM Courses;")
    courses = cursor.fetchall()
    print("Courses Data:")
    for c in courses:
        print(c)
else:
    print("\nNo Courses table found.")

# Get schema of Lessons table
cursor.execute("PRAGMA table_info(Lessons);")
schema = cursor.fetchall()
print("\nLessons Schema:")
for col in schema:
    print(col)

# Get first 10 rows of Lessons (id, course_id, title, order)
cursor.execute("SELECT id, course_id, title, `order` FROM Lessons LIMIT 50;")
rows = cursor.fetchall()
print("\nLessons Data Sample (id, course_id, title, order):")
for row in rows:
    try:
        print(str(row).encode('utf-8', errors='ignore').decode('utf-8'))
    except:
        print(f"Row {row[0]}: Error printing")

conn.close()
