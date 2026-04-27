# Learning Platform Backend API

FastAPI backend with SQLite database for the Learning Platform.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 3000
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Dashboard
- `GET /api/dashboard` - Get dashboard data

### Courses
- `GET /api/courses/{course_id}` - Get course details

### Lessons
- `GET /api/lessons/{lesson_id}` - Get lesson details

### Chat & Quiz
- `POST /api/chat` - Send chat message
- `POST /api/quiz/submit` - Submit quiz
- `POST /api/quiz/request` - Request quiz

### Insights
- `GET /api/insights/students` - Get all students (teachers/parents)
- `GET /api/insights/student/{student_id}` - Get student details
- `GET /api/notes/student/{student_id}` - Get student notes
- `POST /api/insights/comment` - Add comment

### Admin Panel
- `GET /admin` - Admin dashboard (HTML)
- `GET /admin/courses` - List all courses
- `POST /admin/courses` - Create course
- `PUT /admin/courses/{course_id}` - Update course
- `DELETE /admin/courses/{course_id}` - Delete course
- `GET /admin/lessons` - List all lessons
- `POST /admin/lessons` - Create lesson
- `GET /admin/users` - List all users

## Database

SQLite database file: `learning_platform.db`

Tables:
- `users` - User accounts
- `courses` - Courses
- `lessons` - Lessons
- `quizzes` - Quizzes
- `quiz_questions` - Quiz questions
- `enrollments` - Student course enrollments
- `quiz_answers` - Student quiz answers

## Admin Access

To access the admin panel:
1. Create a user with role "teacher" or "admin"
2. Login to get an access token
3. Visit `http://localhost:3000/admin` with the token in localStorage or as Bearer token

## Initialize Database with Sample Data

To populate the database with sample courses, lessons, and users:

```bash
python init_db.py
```

This will create:
- Admin user: `admin@example.com` / `admin123`
- Student user: `student@example.com` / `student123`
- Sample course with lessons and quizzes

## Development

The database is automatically created on first run. To reset:
```bash
rm learning_platform.db
python init_db.py
python main.py
```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/docs`
- ReDoc: `http://localhost:3000/redoc`

