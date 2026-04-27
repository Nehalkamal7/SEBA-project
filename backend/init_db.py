"""
Initialize database with sample data
"""
from database import SessionLocal, engine, Base
from models import User, Course, Lesson, Quiz, QuizQuestion, Enrollment
from auth import get_password_hash

# Create all tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Create admin user
    admin = User(
        name="Admin User",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role="teacher"
    )
    db.add(admin)
    
    # Create sample student
    student = User(
        name="John Doe",
        email="student@example.com",
        hashed_password=get_password_hash("student123"),
        role="student"
    )
    db.add(student)
    
    # Create sample course
    course1 = Course(
        title="Introduction to Web Development",
        description="Learn the fundamentals of web development including HTML, CSS, and JavaScript.",
        instructor="Sarah Johnson",
        duration=120
    )
    db.add(course1)
    db.flush()
    
    # Create lessons for course1
    lesson1 = Lesson(
        course_id=course1.id,
        title="HTML Basics",
        description="Learn the fundamentals of HTML including tags, attributes, and document structure.",
        video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration=15,
        order=1,
        completed=True
    )
    db.add(lesson1)
    
    lesson2 = Lesson(
        course_id=course1.id,
        title="CSS Styling",
        description="Master CSS styling techniques including selectors, properties, and layout.",
        video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration=20,
        order=2,
        completed=True
    )
    db.add(lesson2)
    
    lesson3 = Lesson(
        course_id=course1.id,
        title="JavaScript Fundamentals",
        description="Introduction to JavaScript programming. Learn variables, functions, and control structures.",
        video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration=25,
        order=3,
        completed=False
    )
    db.add(lesson3)
    db.flush()
    
    # Create quiz for lesson1
    quiz1 = Quiz(lesson_id=lesson1.id)
    db.add(quiz1)
    db.flush()
    
    question1 = QuizQuestion(
        quiz_id=quiz1.id,
        question="What does HTML stand for?",
        option_a="HyperText Markup Language",
        option_b="High Tech Modern Language",
        option_c="Home Tool Markup Language",
        option_d="Hyperlink and Text Markup Language",
        correct_answer=0,
        order=1
    )
    db.add(question1)
    
    question2 = QuizQuestion(
        quiz_id=quiz1.id,
        question="Which tag is used to create a paragraph?",
        option_a="<para>",
        option_b="<p>",
        option_c="<paragraph>",
        option_d="<text>",
        correct_answer=1,
        order=2
    )
    db.add(question2)
    
    # Create enrollment
    enrollment = Enrollment(
        student_id=student.id,
        course_id=course1.id,
        progress=66.67
    )
    db.add(enrollment)
    
    db.commit()
    print("Database initialized with sample data!")
    print("Admin: admin@example.com / admin123")
    print("Student: student@example.com / student123")
    
except Exception as e:
    db.rollback()
    print(f"Error: {e}")
finally:
    db.close()

