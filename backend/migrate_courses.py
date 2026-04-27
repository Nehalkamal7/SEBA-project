
import sqlite3
import datetime

rag_db_path = "rag_content.db"
app_db_path = "learning_platform.db"

def migrate():
    print("Starting migration...")
    
    # Connect to RAG DB
    rag_conn = sqlite3.connect(rag_db_path)
    rag_cursor = rag_conn.cursor()
    
    # Fetch all lessons from RAG DB
    rag_cursor.execute("SELECT title, description, video_url, duration, `order`, content FROM Lessons")
    rag_lessons = rag_cursor.fetchall()
    print(f"Fetched {len(rag_lessons)} lessons from RAG DB.")
    rag_conn.close()
    
    # Connect to App DB
    app_conn = sqlite3.connect(app_db_path)
    app_cursor = app_conn.cursor()
    
    # 1. Clear existing generic 'Math 101' course and its lessons if needed
    # First, let's just delete all courses and lessons to be clean, 
    # OR we can keep other courses if they exist. 
    # Given the user context "change this to make there is 2 courses", I'll assume strictly these 2.
    # But to be safe, I will just add the new ones. 
    # Actually, if I don't delete the old one, the user will see 3 courses.
    # I'll delete the course named "Math 101" if it exists.
    
    app_cursor.execute("SELECT id FROM Courses WHERE title = 'Math 101'")
    old_course = app_cursor.fetchone()
    if old_course:
        old_id = old_course[0]
        print(f"Deleting old course 'Math 101' (ID: {old_id})...")
        app_cursor.execute("DELETE FROM Lessons WHERE course_id = ?", (old_id,))
        app_cursor.execute("DELETE FROM Courses WHERE id = ?", (old_id,))
        app_conn.commit()
    
    # 2. Create new courses
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    course_1_title = "Math Grade 8 1st term"
    course_2_title = "Math Grade 8 2nd term"
    
    # Check if they already exist to avoid duplicates
    app_cursor.execute("SELECT id FROM Courses WHERE title = ?", (course_1_title,))
    existing_c1 = app_cursor.fetchone()
    if existing_c1:
        c1_id = existing_c1[0]
        print(f"Course '{course_1_title}' already exists (ID: {c1_id}). Clearing its lessons.")
        app_cursor.execute("DELETE FROM Lessons WHERE course_id = ?", (c1_id,))
    else:
        app_cursor.execute("""
            INSERT INTO Courses (title, description, instructor, duration, created_at, term)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (course_1_title, "First term mathematics for Grade 8", "AI Teacher", 0, now, "Term 1"))
        c1_id = app_cursor.lastrowid
        print(f"Created course '{course_1_title}' (ID: {c1_id})")

    app_cursor.execute("SELECT id FROM Courses WHERE title = ?", (course_2_title,))
    existing_c2 = app_cursor.fetchone()
    if existing_c2:
        c2_id = existing_c2[0]
        print(f"Course '{course_2_title}' already exists (ID: {c2_id}). Clearing its lessons.")
        app_cursor.execute("DELETE FROM Lessons WHERE course_id = ?", (c2_id,))
    else:
        app_cursor.execute("""
            INSERT INTO Courses (title, description, instructor, duration, created_at, term)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (course_2_title, "Second term mathematics for Grade 8", "AI Teacher", 0, now, "Term 2"))
        c2_id = app_cursor.lastrowid
        print(f"Created course '{course_2_title}' (ID: {c2_id})")
    
    app_conn.commit()
    
    # 3. Insert lessons
    count_c1 = 0
    count_c2 = 0
    
    for lesson in rag_lessons:
        title, description, video_url, duration, order, content = lesson
        
        target_course_id = None
        
        # Determine course based on title
        # RAG DB titles are like "Term 1 Les1", "Term 2 Les 1"
        if "Term 1" in title:
            target_course_id = c1_id
            count_c1 += 1
        elif "Term 2" in title:
            target_course_id = c2_id
            count_c2 += 1
        else:
            print(f"Skipping lesson with title: {title} (Matches neither Term 1 nor Term 2)")
            continue
            
        app_cursor.execute("""
            INSERT INTO Lessons (course_id, title, description, video_url, duration, "order", content, completed, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (target_course_id, title, description, video_url, duration, order, content, False, now))
        
    app_conn.commit()
    app_conn.close()
    
    print(f"Migration complete.")
    print(f"Inserted {count_c1} lessons into '{course_1_title}'.")
    print(f"Inserted {count_c2} lessons into '{course_2_title}'.")

if __name__ == "__main__":
    migrate()
