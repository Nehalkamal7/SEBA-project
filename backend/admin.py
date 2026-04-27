from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from database import SessionLocal, Base, engine
from models import User, Course, Lesson, Quiz, QuizQuestion, Enrollment
from schemas import CourseCreate, LessonCreate, CourseResponse, LessonResponse
from auth import get_current_user

admin_router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Check if user is admin (optional for now - no auth required)
def require_admin_optional():
    # For now, skip authentication - allow access to everyone
    return None

# Keep original for future use
def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# Admin Dashboard HTML
@admin_router.get("/", response_class=HTMLResponse)
async def admin_dashboard():
    html_content = """
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Panel - Learning Platform</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { font-family: 'Cairo', sans-serif; }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <!-- Header -->
            <nav class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <h1 class="text-2xl font-bold text-gray-900">Admin Panel</h1>
                        </div>
                        <div class="flex items-center gap-4">
                            <a href="/admin" class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">Dashboard</a>
                            <a href="/admin/courses" class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">Courses</a>
                            <a href="/admin/lessons" class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">Lessons</a>
                            <a href="/admin/users" class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">Users</a>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Main Content -->
            <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div id="content">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">Total Courses</h3>
                            <p class="text-3xl font-bold text-blue-600" id="total-courses">0</p>
                        </div>
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">Total Lessons</h3>
                            <p class="text-3xl font-bold text-green-600" id="total-lessons">0</p>
                        </div>
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
                            <p class="text-3xl font-bold text-purple-600" id="total-users">0</p>
                        </div>
                    </div>

                    <!-- Courses Section -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 class="text-xl font-semibold text-gray-900">Courses</h2>
                            <button onclick="showAddCourseModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Add Course
                            </button>
                        </div>
                        <div class="p-6">
                            <div id="courses-list" class="space-y-4"></div>
                        </div>
                    </div>
                </div>
            </main>

            <!-- Add Course Modal -->
            <div id="course-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 class="text-xl font-semibold mb-4">Add New Course</h3>
                    <form id="course-form" onsubmit="addCourse(event)">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input type="text" id="course-title" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea id="course-description" class="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3"></textarea>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                            <input type="text" id="course-instructor" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                            <input type="number" id="course-duration" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div class="flex gap-2">
                            <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Add Course
                            </button>
                            <button type="button" onclick="hideAddCourseModal()" class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <script>
                const API_BASE = '/api';
                let authToken = localStorage.getItem('auth_token') || '';

                async function loadStats() {
                    try {
                        const [coursesRes, lessonsRes, usersRes] = await Promise.all([
                            fetch(`${API_BASE}/admin/courses`, {
                                headers: { 'Authorization': `Bearer ${authToken}` }
                            }),
                            fetch(`${API_BASE}/admin/lessons`, {
                                headers: { 'Authorization': `Bearer ${authToken}` }
                            }),
                            fetch(`${API_BASE}/admin/users`, {
                                headers: { 'Authorization': `Bearer ${authToken}` }
                            })
                        ]);

                        const courses = await coursesRes.json();
                        const lessons = await lessonsRes.json();
                        const users = await usersRes.json();

                        document.getElementById('total-courses').textContent = courses.length || 0;
                        document.getElementById('total-lessons').textContent = lessons.length || 0;
                        document.getElementById('total-users').textContent = users.length || 0;
                    } catch (error) {
                        console.error('Error loading stats:', error);
                    }
                }

                async function loadCourses() {
                    try {
                        const response = await fetch(`${API_BASE}/admin/courses`, {
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        const courses = await response.json();
                        
                        const list = document.getElementById('courses-list');
                        list.innerHTML = courses.map(course => `
                            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <h4 class="text-lg font-semibold text-gray-900">${course.title}</h4>
                                        <p class="text-sm text-gray-600 mt-1">${course.instructor}</p>
                                        <p class="text-sm text-gray-500 mt-2">${course.description || 'No description'}</p>
                                    </div>
                                    <div class="flex gap-2 ml-4">
                                        <button onclick="editCourse(${course.id})" class="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                                            Edit
                                        </button>
                                        <button onclick="deleteCourse(${course.id})" class="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('');
                    } catch (error) {
                        console.error('Error loading courses:', error);
                    }
                }

                function showAddCourseModal() {
                    document.getElementById('course-modal').classList.remove('hidden');
                }

                function hideAddCourseModal() {
                    document.getElementById('course-modal').classList.add('hidden');
                    document.getElementById('course-form').reset();
                }

                async function addCourse(event) {
                    event.preventDefault();
                    const courseData = {
                        title: document.getElementById('course-title').value,
                        description: document.getElementById('course-description').value,
                        instructor: document.getElementById('course-instructor').value,
                        duration: parseInt(document.getElementById('course-duration').value)
                    };

                    try {
                        const response = await fetch(`${API_BASE}/admin/courses`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authToken}`
                            },
                            body: JSON.stringify(courseData)
                        });

                        if (response.ok) {
                            hideAddCourseModal();
                            loadCourses();
                            loadStats();
                        } else {
                            alert('Error creating course');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Error creating course');
                    }
                }

                async function deleteCourse(id) {
                    if (!confirm('Are you sure you want to delete this course?')) return;

                    try {
                        const response = await fetch(`${API_BASE}/admin/courses/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });

                        if (response.ok) {
                            loadCourses();
                            loadStats();
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }

                // Initialize
                loadStats();
                loadCourses();
            </script>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


# Admin API endpoints
@admin_router.get("/courses")
async def get_all_courses(
    db: Session = Depends(get_db)
):
    courses = db.query(Course).all()
    result = []
    for course in courses:
        enrollments = db.query(Enrollment).filter(Enrollment.course_id == course.id).all()
        lessons = db.query(Lesson).filter(Lesson.course_id == course.id).order_by(Lesson.order).all()
        result.append({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "instructor": course.instructor,
            "duration": course.duration,
            "enrolled": len(enrollments),
            "thumbnail": course.thumbnail,
            "lessons": [
                {
                    "id": lesson.id,
                    "title": lesson.title,
                    "duration": lesson.duration,
                    "completed": lesson.completed,
                    "order": lesson.order
                }
                for lesson in lessons
            ]
        })
    return result


@admin_router.post("/courses")
async def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db)
):
    db_course = Course(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return {
        "id": db_course.id,
        "title": db_course.title,
        "description": db_course.description,
        "instructor": db_course.instructor,
        "duration": db_course.duration,
        "enrolled": 0,
        "thumbnail": db_course.thumbnail,
        "lessons": []
    }


# Partial update model for courses
class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructor: Optional[str] = None
    duration: Optional[int] = None
    thumbnail: Optional[str] = None

@admin_router.put("/courses/{course_id}")
async def update_course(
    course_id: int,
    course: CourseUpdate,
    db: Session = Depends(get_db),
):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Only update fields that are explicitly provided (not None)
    course_data = course.model_dump(exclude_unset=True, exclude_none=True)
    
    for key, value in course_data.items():
        if key == 'thumbnail':
            # Handle thumbnail: empty string means clear it, any other value means set it
            if value == '':
                setattr(db_course, key, None)
            elif value is not None:
                setattr(db_course, key, value)
        else:
            setattr(db_course, key, value)
    
    db.commit()
    db.refresh(db_course)
    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order).all()
    return {
        "id": db_course.id,
        "title": db_course.title,
        "description": db_course.description,
        "instructor": db_course.instructor,
        "duration": db_course.duration,
        "enrolled": len(enrollments),
        "thumbnail": db_course.thumbnail,
        "lessons": [
            {
                "id": lesson.id,
                "title": lesson.title,
                "duration": lesson.duration,
                "completed": lesson.completed,
                "order": lesson.order
            }
            for lesson in lessons
        ]
    }


@admin_router.delete("/courses/{course_id}")
async def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db.delete(db_course)
    db.commit()
    return {"success": True}


@admin_router.get("/lessons")
async def get_all_lessons(
    db: Session = Depends(get_db),
):
    lessons = db.query(Lesson).all()
    result = []
    for lesson in lessons:
        course = lesson.course
        # Get next and previous lessons
        next_lesson = db.query(Lesson).filter(
            Lesson.course_id == course.id,
            Lesson.order > lesson.order
        ).order_by(Lesson.order).first()
        
        previous_lesson = db.query(Lesson).filter(
            Lesson.course_id == course.id,
            Lesson.order < lesson.order
        ).order_by(Lesson.order.desc()).first()
        
        lesson_data = {
            "id": lesson.id,
            "title": lesson.title,
            "videoUrl": lesson.video_url,
            "description": lesson.description,
            "courseId": course.id,
            "courseTitle": course.title,
            "nextLessonId": next_lesson.id if next_lesson else None,
            "previousLessonId": previous_lesson.id if previous_lesson else None,
            "quiz": None
        }
        
        # Load quiz if exists
        quiz = db.query(Quiz).filter(Quiz.lesson_id == lesson.id).first()
        if quiz:
            questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).order_by(QuizQuestion.order).all()
            lesson_data["quiz"] = {
                "questions": [
                    {
                        "id": q.id,
                        "question": q.question,
                        "options": [q.option_a, q.option_b, q.option_c, q.option_d] if q.option_d else [q.option_a, q.option_b, q.option_c],
                        "correctAnswer": q.correct_answer
                    }
                    for q in questions
                ]
            }
        
        result.append(lesson_data)
    
    return result


@admin_router.post("/lessons")
async def create_lesson(
    lesson: LessonCreate,
    db: Session = Depends(get_db),
):
    db_lesson = Lesson(**lesson.model_dump())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    
    course = db_lesson.course
    return {
        "id": db_lesson.id,
        "title": db_lesson.title,
        "videoUrl": db_lesson.video_url,
        "description": db_lesson.description,
        "courseId": course.id,
        "courseTitle": course.title,
        "nextLessonId": None,
        "previousLessonId": None,
        "quiz": None
    }


@admin_router.get("/users")
async def get_all_users(
    db: Session = Depends(get_db),
):
    # Filter out soft-deleted users
    users = db.query(User).filter(User.is_deleted == False).all()
    result = []
    for user in users:
        # Get enrollments for this user
        enrollments = db.query(Enrollment).filter(Enrollment.student_id == user.id).all()
        enrollment_data = []
        for enrollment in enrollments:
            course = db.query(Course).filter(Course.id == enrollment.course_id).first()
            if course:
                # Count completed lessons
                lessons = db.query(Lesson).filter(Lesson.course_id == course.id).all()
                completed_lessons = sum(1 for lesson in lessons if lesson.completed)
                total_lessons = len(lessons)
                
                enrollment_data.append({
                    "course_id": course.id,
                    "course_title": course.title,
                    "progress": enrollment.progress,
                    "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
                    "completed_lessons": completed_lessons,
                    "total_lessons": total_lessons
                })
        
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "enrollments": enrollment_data,
            "total_enrollments": len(enrollment_data)
        })
    return result


@admin_router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Soft delete a user - marks them as deleted but preserves all their data.
    This allows the user to re-register and maintain their history.
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Soft delete - set flags but don't actually delete
    db_user.is_deleted = True
    db_user.deleted_at = datetime.now()
    
    db.commit()
    return {"success": True, "message": "User soft deleted successfully"}

