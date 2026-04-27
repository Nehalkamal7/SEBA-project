import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  mockDashboard,
  mockCourses,
  mockLessons,
  mockStudents,
  mockStudentDetail,
} from './mockData';

// ------------------------------------------------------------------
// 1. IMPORT YOUR NEW REGISTRY (The bridge to your JSON files)
// ------------------------------------------------------------------
import { lessonsData } from '@/data/lessons/Math';

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const MOCK_TOKEN = '0097';

// Utility to simulate network delay for mock data (300-800ms)
const sleep = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

class ApiClient {
  private client: AxiosInstance;
  private isMockMode: boolean;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Determine mock mode once on initialization
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    this.isMockMode = urlToken === MOCK_TOKEN;

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token') || urlToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          // Persist the specific mock token if found in URL
          if (token === MOCK_TOKEN) {
            localStorage.setItem('auth_token', token);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 && !this.isMockMode) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // --- Auth endpoints ---

  async login(email: string, password: string) {
    if (this.isMockMode) {
      await sleep();
      const mockResponse = { access_token: MOCK_TOKEN, user: { name: 'Mock User', email } };
      localStorage.setItem('auth_token', mockResponse.access_token);
      return mockResponse;
    }

    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    return response.data;
  }

  async register(data: { name: string; email: string; password: string; role: string }) {
    if (this.isMockMode) {
      await sleep();
      const mockResponse = { access_token: MOCK_TOKEN, user: { ...data } };
      localStorage.setItem('auth_token', mockResponse.access_token);
      return mockResponse;
    }

    const response = await this.client.post('/auth/register', data);
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    return response.data;
  }

  async logout() {
    if (this.isMockMode) {
      localStorage.removeItem('auth_token');
      return;
    }
    await this.client.post('/auth/logout');
    localStorage.removeItem('auth_token');
  }

  // --- Session endpoints ---

  async startSession(lessonId: string) {
    if (this.isMockMode) {
      return { data: { success: true, startTime: new Date().toISOString() } };
    }
    return this.client.post('/session/start', { lessonId });
  }

  async endSession(lessonId: string, duration: number) {
    if (this.isMockMode) {
      return { data: { success: true } };
    }
    return this.client.post('/session/end', { lessonId, duration });
  }

  // --- Dashboard ---

  async getDashboard() {
    if (this.isMockMode) {
      await sleep();
      return { data: mockDashboard };
    }
    return this.client.get('/dashboard');
  }

  // --- Profile ---

  async setGoal(goal: string) {
    if (this.isMockMode) return { data: { success: true, goal } };
    return this.client.post('/profile/goal', { goal });
  }

  async setPreference(preference: string, value: unknown) {
    if (this.isMockMode) return { data: { success: true, preference, value } };
    return this.client.post('/profile/preference', { preference, value });
  }

  // --- Courses ---

  async getAllCourses(signal?: AbortSignal) {
    if (this.isMockMode) {
      await sleep();
      return { data: mockCourses };
    }
    return this.client.get('/courses', { signal });
  }

  async getCourse(courseId: string) {
    if (this.isMockMode) {
      await sleep();
      const course = mockCourses.find(c => c.id === courseId);
      return { data: course || mockCourses[0] };
    }
    return this.client.get(`/courses/${courseId}`);
  }

  async enrollInCourse(courseId: string) {
    if (this.isMockMode) {
      await sleep();
      return { data: { message: "Enrolled successfully", enrolled: true } };
    }
    return this.client.post(`/courses/${courseId}/enroll`);
  }

  // ------------------------------------------------------------------
  // 2. UPDATED GET LESSON LOGIC
  // ------------------------------------------------------------------
  async getLesson(lessonId: string) {
    let responseData;

    // A. FETCH BASIC DATA (From Mock or Real DB)
    if (this.isMockMode) {
      await sleep();
      // In mock mode, we usually just return the JSON directly, 
      // but let's stick to the fallback logic for consistency
      responseData = mockLessons[lessonId as keyof typeof mockLessons] || mockLessons['1'];
    } else {
      // REAL MODE: Fetch from your Python Backend (ID: 4)
      const response = await this.client.get(`/lessons/${lessonId}`);
      responseData = response.data;
    }

    // B. THE MERGE STEP (The Magic)
    // Check if we have "Extra Content" (JSON) for this ID (4)
    const localData = lessonsData[lessonId];

    if (localData) {
      console.log(`[API] ⚡ Merging Local JSON content into Lesson ${lessonId}`);
      responseData = {
        ...responseData, // Keep DB Title, VideoUrl, Description
        content: responseData.content || localData.content,     // Inject Content from JSON only if DB doesn't have it
        quiz: responseData.quiz || localData.quiz,           // Inject Quiz from JSON only if DB doesn't have it
        diagramId: localData.diagramId  // Inject Diagram ID from JSON
      };
    } else {
      console.log(`[API] ⚠️ No local JSON found for Lesson ${lessonId} (Checked Registry)`);
    }

    return { data: responseData };
  }

  async trackLessonTime(lessonId: string, seconds: number) {
    if (this.isMockMode) return;
    return this.client.post(`/lessons/${lessonId}/track-time`, { seconds });
  }

  // --- Chat ---

  async sendChatMessage(lessonId: string, message: string) {
    if (this.isMockMode) {
      await sleep(1000); // Longer delay for AI simulation
      return {
        data: {
          message: `[MOCK AI]: I received your question about "${message}". In the live app, this would be processed by an LLM based on the lesson context.`,
          timestamp: new Date().toISOString()
        },
      };
    }
    return this.client.post('/chat', { lessonId: parseInt(lessonId), message });
  }

  // --- Quiz ---

  async submitQuiz(lessonId: string, answers: Record<string, string | number>, calculatedScore?: number) {

    // 1. LOOK IN YOUR LOCAL JSON FIRST
    // This grabs the file: src/data/lessons/Math/lesson-1.json
    const localData = lessonsData[lessonId];

    if (localData && localData.quiz) {
      console.log(`[API] ⚡ Grading Quiz Locally using JSON for Lesson ${lessonId}`);

      let correct = 0;
      let total = localData.quiz.questions.length;

      // Loop through the questions in the JSON
      localData.quiz.questions.forEach((q: any) => {
        // Compare User's Answer vs JSON Correct Answer
        if (answers[q.id] === q.correctAnswer) {
          correct++;
        }
      });

      const score = total > 0 ? Math.round((correct / total) * 100) : 0;

      // FIXED: Always send to backend with calculated score
      await this.client.post('/quiz/submit', {
        lessonId: parseInt(lessonId),
        answers,
        calculatedScore: calculatedScore || score
      });

      // Return the result to frontend
      return {
        data: {
          score,
          correct,
          total,
          passed: score >= 70
        }
      };
    }

    // 2. Fallback: If no local data found, call the backend
    // (This is what was causing the 404 error, but we skip it now)
    return this.client.post('/quiz/submit', {
      lessonId: parseInt(lessonId),
      answers,
      calculatedScore
    });
  }

  async requestQuiz(lessonId: string) {
    if (this.isMockMode) {
      await sleep();
      // Try Registry first
      const lesson = lessonsData[lessonId] || mockLessons[lessonId as keyof typeof mockLessons] || mockLessons['1'];
      return { data: lesson.quiz };
    }
    return this.client.post('/quiz/request', { lessonId });
  }
  async generateQuiz(lessonId: string) {
    // If we are in Mock Mode (offline)
    if (this.isMockMode) {
      await sleep(1500);
      return {
        data: {
          title: "Mock AI Quiz",
          difficulty: "MEDIUM",
          questions: [
            {
              id: 999,
              text: "This is a mock question to test the UI.",
              options: ["A", "B", "C", "D"],
              correct_option_index: 0
            }
          ]
        }
      };
    }

    return this.client.post('/quiz/generate', { lessonId: parseInt(lessonId) });
  }
  // --- Logs and Feedback ---

  async logLesson(lessonId: string, data: Record<string, any>) {
    if (this.isMockMode) return { data: { success: true } };
    return this.client.post('/log/lesson', { lessonId, ...data });
  }

  async feedbackLesson(lessonId: string, feedback: string, helpful: boolean) {
    if (this.isMockMode) return { data: { success: true } };
    return this.client.post('/feedback/lesson', { lessonId, feedback, helpful });
  }

  async feedbackChat(messageId: string, helpful: boolean) {
    if (this.isMockMode) return { data: { success: true } };
    return this.client.post('/feedback/chat', { messageId, helpful });
  }

  // --- Insights ---

  async getInsightsStudents() {
    if (this.isMockMode) {
      await sleep();
      return { data: mockStudents };
    }
    return this.client.get('/insights/students');
  }

  async getInsightsStudent(studentId: string) {
    if (this.isMockMode) {
      await sleep();
      return { data: mockStudentDetail };
    }
    return this.client.get(`/insights/student/${studentId}`);
  }

  async getNotesStudent(studentId: string) {
    if (this.isMockMode) {
      await sleep();
      return { data: mockStudentDetail.notes };
    }
    return this.client.get(`/notes/student/${studentId}`);
  }

  async addInsightComment(studentId: string, comment: string) {
    if (this.isMockMode) {
      return { data: { success: true, comment, createdAt: new Date().toISOString() } };
    }
    return this.client.post('/insights/comment', { studentId, comment });
  }

  // --- Notifications ---

  async updateNotificationSettings(settings: Record<string, boolean>) {
    if (this.isMockMode) {
      await sleep(300);
      return { data: { success: true, settings } };
    }
    return this.client.post('/notifications/settings', settings);
  }

  // --- Admin endpoints ---

  async getAdminCourses() {
    if (this.isMockMode) {
      await sleep();
      return { data: mockCourses };
    }
    return this.client.get('/admin/courses');
  }

  async getAdminLessons() {
    if (this.isMockMode) {
      await sleep();
      const allLessons = Object.values(mockLessons);
      return { data: allLessons };
    }
    return this.client.get('/admin/lessons');
  }

  async getAdminUsers() {
    if (this.isMockMode) {
      await sleep();
      return { data: mockStudents };
    }
    return this.client.get('/admin/users');
  }

  async uploadCourseImage(file: File, courseId?: number) {
    if (this.isMockMode) {
      await sleep();
      return { data: { url: 'https://placehold.co/600x400', filename: 'mock-image.jpg' } };
    }
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) {
      formData.append('course_id', courseId.toString());
    }
    return this.client.post('/upload/course-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async createCourse(data: { title: string; description: string; instructor: string; duration: number; thumbnail?: string }) {
    if (this.isMockMode) {
      await sleep();
      const newCourse = {
        id: `c_${Date.now()}`,
        ...data,
        lessons: 0,
        students: 0,
        rating: 0,
        image: data.thumbnail || 'https://placehold.co/600x400'
      };
      return { data: newCourse };
    }
    return this.client.post('/admin/courses', data);
  }

  async updateCourse(courseId: number | string, data: Partial<{ title: string; description: string; instructor: string; duration: number; thumbnail?: string }>) {
    if (this.isMockMode) {
      await sleep();
      return { data: { success: true, id: courseId, ...data } };
    }
    return this.client.put(`/admin/courses/${courseId}`, data);
  }

  async deleteCourse(courseId: number | string) {
    if (this.isMockMode) {
      await sleep();
      return { data: { success: true, deletedId: courseId } };
    }
    return this.client.delete(`/admin/courses/${courseId}`);
  }

  // --- Admin User Management ---
  async getUsersByRole(role?: string) {
    if (this.isMockMode) return { data: [] };
    return this.client.get('/admin/users', { params: { role } });
  }

  async linkParent(parentId: number | string, studentIds: (number | string)[]) {
    if (this.isMockMode) return { data: { success: true } };
    return this.client.post('/admin/link-parent', { parent_id: parentId, student_ids: studentIds });
  }

  async linkTeacher(teacherId: number | string, studentIds: (number | string)[]) {
    if (this.isMockMode) return { data: { success: true } };
    return this.client.post('/admin/link-teacher', { teacher_id: teacherId, student_ids: studentIds });
  }

  async deleteUser(userId: number | string) {
    if (this.isMockMode) {
      await sleep();
      return { data: { success: true, message: 'User deleted successfully' } };
    }
    return this.client.delete(`/admin/users/${userId}`);
  }
}

export const api = new ApiClient();