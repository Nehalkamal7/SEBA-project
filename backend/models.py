from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Float, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


parent_student = Table('parent_student', Base.metadata,
    Column('parent_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('student_id', Integer, ForeignKey('users.id'), primary_key=True)
)

teacher_student = Table('teacher_student', Base.metadata,
    Column('teacher_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('student_id', Integer, ForeignKey('users.id'), primary_key=True)
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student")  # student, teacher, parent
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_deleted = Column(Boolean, default=False)  # Soft delete flag
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # When was the user deleted

    # Parent relationships
    children = relationship(
        "User", 
        secondary=parent_student,
        primaryjoin=id==parent_student.c.parent_id,
        secondaryjoin=id==parent_student.c.student_id,
        backref="parents"
    )

    # Teacher relationships
    students_taught = relationship(
        "User",
        secondary=teacher_student,
        primaryjoin=id==teacher_student.c.teacher_id,
        secondaryjoin=id==teacher_student.c.student_id,
        backref="teachers"
    )



class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    instructor = Column(String, nullable=False)
    duration = Column(Integer)  # in minutes
    thumbnail = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    term = Column(String, default="Term 1")
    
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    video_url = Column(String)
    duration = Column(Integer)  # in minutes
    order = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    content = Column(Text, nullable=True)  # Legacy/default content
    content_en = Column(Text, nullable=True)  # English content
    content_ar = Column(Text, nullable=True)  # Arabic content
    
    course = relationship("Course", back_populates="lessons")
    quiz = relationship("Quiz", back_populates="lesson", uselist=False, cascade="all, delete-orphan")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    lesson = relationship("Lesson", back_populates="quiz")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question = Column(Text, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=True)
    correct_answer = Column(Integer, nullable=False)  # 0, 1, 2, or 3
    order = Column(Integer, default=0)
    
    quiz = relationship("Quiz", back_populates="questions")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    current_lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)

    progress = Column(Float, default=0.0)  # 0-100
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    
    student = relationship("User")
    course = relationship("Course", back_populates="enrollments")
    current_lesson = relationship("Lesson", foreign_keys=[current_lesson_id])


class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("quiz_questions.id"), nullable=False)
    answer = Column(Integer, nullable=False)
    is_correct = Column(Boolean, default=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String, nullable=False)  # 'enrollment', 'lesson_completed', 'quiz_submitted', 'course_started'
    entity_type = Column(String, nullable=False)  # 'course', 'lesson', 'quiz'
    entity_id = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

class StudentSentiment(Base):
    __tablename__ = "student_sentiments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_message = Column(Text)
    translated_message = Column(Text)
    sentiment_label = Column(String) # e.g. "frustration"
    confidence_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User")

class TeacherNote(Base):
    __tablename__ = "teacher_notes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    note_content = Column(Text, nullable=False) # e.g. "Struggles with syntax"
    weight = Column(Float, default=1.0) # Importance of this note
    created_at = Column(DateTime(timezone=True), server_default=func.now())


    student = relationship("User")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    time_spent_seconds = Column(Integer, default=0)
    last_accessed = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User")
    lesson = relationship("Lesson")

