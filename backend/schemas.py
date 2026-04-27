from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime


# User schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = "default123"  # Default password for now
    role: str = "student"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    
    class Config:
        from_attributes = True
        populate_by_name = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# Course schemas
class LessonItem(BaseModel):
    id: int
    title: str
    duration: int
    completed: bool
    order: int
    
    class Config:
        from_attributes = True


class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    instructor: str
    duration: int
    thumbnail: Optional[str] = None


class CourseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    instructor: str
    duration: int
    enrolled: int = 0
    thumbnail: Optional[str] = None
    isEnrolled: Optional[bool] = False
    progress: Optional[float] = 0.0
    lessons: List[LessonItem] = []
    
    class Config:
        from_attributes = True


# Lesson schemas
class QuizQuestionItem(BaseModel):
    id: int
    question: str
    options: List[str]
    correctAnswer: int
    
    class Config:
        from_attributes = True


class QuizData(BaseModel):
    questions: List[QuizQuestionItem]


class LessonCreate(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None
    duration: int
    order: int = 0


class LessonResponse(BaseModel):
    id: int
    title: str
    videoUrl: Optional[str] = None
    description: Optional[str] = None
    courseId: int
    courseTitle: str
    nextLessonId: Optional[int] = None
    previousLessonId: Optional[int] = None
    quiz: Optional[QuizData] = None
    content: Optional[str] = None  # Legacy/default content
    content_en: Optional[str] = None  # English content
    content_ar: Optional[str] = None  # Arabic content
    
    class Config:
        from_attributes = True


# Dashboard schema
class CourseItem(BaseModel):
    id: int
    title: str
    instructor: str
    progress: float
    thumbnail: Optional[str] = None


class ActivityItem(BaseModel):
    description: str
    timestamp: str


class DashboardResponse(BaseModel):
    courses: List[CourseItem]
    progress: int
    upcomingLessons: List[Dict]
    recentActivity: List[ActivityItem]
    students: Optional[List[Dict]] = None


# Quiz schemas
class QuizSubmit(BaseModel):
    answers: Dict[str, int]


class QuizResponse(BaseModel):
    score: int
    correct: int
    total: int


# Chat schemas
class ChatMessage(BaseModel):
    lessonId: int
    message: str


class ChatResponse(BaseModel):
    message: str


# Student/Insights schemas
class StudentResponse(BaseModel):
    id: int
    name: str
    email: str
    progress: int
    attendance: int
    averageGrade: float
    coursesEnrolled: int


class PerformanceItem(BaseModel):
    date: str
    score: int


class AttendanceItem(BaseModel):
    date: str
    present: bool



class LessonBreakdown(BaseModel):
    title: str
    timeSpent: int

class GradeItem(BaseModel):
    course: str
    grade: int
    timeSpent: int = 0
    lessons: List[LessonBreakdown] = []


class StudentDetailResponse(BaseModel):
    id: int
    name: str
    performance: List[PerformanceItem]
    attendance: List[AttendanceItem]
    grades: List[GradeItem]
    notes: List[Dict]
    engagementScore: Optional[int] = 50
    totalActivities: Optional[int] = 0
    totalTimeSpent: Optional[int] = 0  # In minutes
    sentimentData: Optional[Dict] = None
    teacherNotes: Optional[List[Dict]] = []
    studentSentiments: Optional[List[Dict]] = []


