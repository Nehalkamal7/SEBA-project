import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, BookOpen, Users, GraduationCap, ChevronDown, ChevronUp, Mail, Calendar, TrendingUp, Clock, Upload, X } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Layout } from '@/components/layout/Layout';
import { RelationshipManager } from '@/components/admin/RelationshipManager';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { api } from '@/utils/api';
import { t } from '@/utils/language';
import { useLanguage } from '@/contexts/LanguageContext';
import { fadeInUp, staggerContainer } from '@/utils/animations';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: number;
  enrolled: number;
  thumbnail?: string;
  lessons: any[];
}

interface Lesson {
  id: number;
  title: string;
  courseId: number;
  courseTitle: string;
  duration: number;
}

interface UserEnrollment {
  course_id: number;
  course_title: string;
  progress: number;
  enrolled_at: string | null;
  completed_lessons: number;
  total_lessons: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string | null;
  enrollments: UserEnrollment[];
  total_enrollments: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  attendance: number;
  averageGrade: number;
  coursesEnrolled: number;
}

interface StudentDetail {
  id: string;
  name: string;
  performance: {
    date: string;
    score: number;
  }[];
  attendance: {
    date: string;
    present: boolean;
  }[];
  grades: {
    course: string;
    grade: number;
    timeSpent: number;
    lessons: { title: string; timeSpent: number; }[];
  }[];
  notes: {
    id: string;
    content: string;
    timestamp: string;
  }[];
  engagementScore?: number;
  totalActivities?: number;
  totalTimeSpent?: number;
  sentimentData?: {
    positive: number;
    negative: number;
    neutral: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
    engagementLevel: string;
    quiz_activities: number;
    lesson_activities: number;
    enrollment_activities: number;
  };
  teacherNotes?: {
    id: string;
    content: string;
    weight: number;
    timestamp: string;
  }[];
  studentSentiments?: {
    id: string;
    message: string;
    sentiment_label: string;
    confidence: number;
    timestamp: string;
  }[];
}

export const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'admin' | 'insights' | 'relationships'>('admin');
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: 0,
    thumbnail: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, lessonsRes, usersRes, studentsRes] = await Promise.all([
        api.getAdminCourses(),
        api.getAdminLessons(),
        api.getAdminUsers(),
        api.getInsightsStudents().catch(() => ({ data: [] })), // Optional - if not available
      ]);
      setCourses(coursesRes.data);
      setLessons(lessonsRes.data);
      setUsers(usersRes.data);
      setStudents(studentsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('errorOccurred', language));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      // Pass course_id if editing an existing course to ensure unique filename
      const courseId = editingCourse?.id;
      const response = await api.uploadCourseImage(file, courseId);
      let imageUrl = response.data.url;
      // The backend returns /uploads/filename, which FastAPI serves directly
      // We need to construct the full URL for preview
      if (imageUrl.startsWith('/uploads')) {
        // For preview, use the full URL
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
        const baseUrl = API_BASE_URL.replace('/api', '') || window.location.origin;
        imageUrl = baseUrl + imageUrl;
      }
      // Store the relative path in the form (backend expects /uploads/filename)
      const relativeUrl = response.data.url;
      setCourseForm({ ...courseForm, thumbnail: relativeUrl });
      setImagePreview(imageUrl);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('errorOccurred', language));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      handleImageUpload(file);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        // When editing, only send fields that changed
        const courseData: any = {
          title: courseForm.title,
          description: courseForm.description || null,
          instructor: courseForm.instructor,
          duration: courseForm.duration,
        };

        // Only include thumbnail if it was explicitly changed
        const originalThumbnail = editingCourse.thumbnail || '';
        const newThumbnail = courseForm.thumbnail || '';

        if (newThumbnail !== originalThumbnail) {
          // Thumbnail was changed - include it in the update
          courseData.thumbnail = newThumbnail.trim() !== '' ? newThumbnail : '';
        }
        // If thumbnail wasn't changed, don't include it - backend will preserve existing value

        await api.updateCourse(editingCourse.id, courseData);
      } else {
        // When creating, include all fields
        const courseData: any = {
          title: courseForm.title,
          description: courseForm.description || null,
          instructor: courseForm.instructor,
          duration: courseForm.duration,
        };

        // Include thumbnail if provided
        if (courseForm.thumbnail && courseForm.thumbnail.trim() !== '') {
          courseData.thumbnail = courseForm.thumbnail;
        }

        await api.createCourse(courseData);
      }
      setShowCourseModal(false);
      setEditingCourse(null);
      setCourseForm({ title: '', description: '', instructor: '', duration: 0, thumbnail: '' });
      setImagePreview(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('errorOccurred', language));
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm(t('areYouSureDeleteCourse', language))) return;
    try {
      await api.deleteCourse(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('errorOccurred', language));
    }
  };

  const toggleUserExpanded = (userId: number) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? Their data will be preserved but they will be hidden from the system.')) return;
    try {
      await api.deleteUser(userId);
      loadData(); // Refresh the user list
    } catch (err: any) {
      setError(err.response?.data?.detail || t('errorOccurred', language));
    }
  };

  const loadStudentDetail = async (studentId: string) => {
    try {
      setIsLoadingDetail(true);
      setSelectedStudentId(studentId);
      const response = await api.getInsightsStudent(studentId);
      setStudentDetail(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('errorOccurred', language));
      setSelectedStudentId(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeStudentDetail = () => {
    setSelectedStudentId(null);
    setStudentDetail(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loading fullScreen text={t('loading', language)} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial="initial"
          animate="animate"
          // 2. Added 'as any' to fix the strict type error
          variants={staggerContainer as any}
          className="mb-8"
        >
          <motion.h1
            // 2. Added 'as any' here too
            variants={fadeInUp as any}
            className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
          >
            {t('adminPanel', language)}
          </motion.h1>
          <motion.p variants={fadeInUp as any} className="text-lg text-gray-600 dark:text-gray-400">
            {t('manageCoursesLessonsUsers', language)}
          </motion.p>
        </motion.div>

        {error && (
          // 3. This className works ONLY if you updated Alert.tsx. 
          // If you get an error here, remove className="mb-6".
          <Alert type="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'admin'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            {t('adminPanel', language)}
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'insights'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            {t('insights', language)}
          </button>
          <button
            onClick={() => setActiveTab('relationships')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'relationships'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            Role Management
          </button>
        </div>

        {/* Relationships Tab */}
        {activeTab === 'relationships' && (
          <RelationshipManager />
        )}

        {/* Admin Tab Content */}
        {activeTab === 'admin' && (
          <>
            {/* Stats */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer as any}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {[
                { icon: BookOpen, label: t('totalCourses', language), value: courses.length, color: 'text-blue-500' },
                { icon: GraduationCap, label: t('totalLessons', language), value: lessons.length, color: 'text-green-500' },
                { icon: Users, label: t('totalUsers', language), value: users.length, color: 'text-purple-500' },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={index} variants={fadeInUp as any}>
                    <Card hover>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                        <Icon className={`h-10 w-10 ${stat.color}`} />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Courses Section */}
            <Card className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('courses', language)}</h2>
                <Button onClick={() => setShowCourseModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addCourse', language)}
                </Button>
              </div>

              <div className="space-y-4">
                {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {course.instructor} • {course.duration} {t('duration', language)} • {course.enrolled} {t('enrolled', language)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{course.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCourse(course);
                            setCourseForm({
                              title: course.title,
                              description: course.description || '',
                              instructor: course.instructor,
                              duration: course.duration,
                              thumbnail: course.thumbnail || '',
                            });
                            // Construct full URL for preview if thumbnail exists
                            const thumbnailUrl = course.thumbnail
                              ? (course.thumbnail.startsWith('http')
                                ? course.thumbnail
                                : (import.meta.env.VITE_API_BASE_URL || '').replace('/api', '') + course.thumbnail)
                              : null;
                            setImagePreview(thumbnailUrl);
                            setShowCourseModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Users Section */}
            <Card className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('users', language)}</h2>
              </div>

              <div className="space-y-4">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => toggleUserExpanded(user.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user.name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{user.email}</span>
                                </div>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                                  {user.role}
                                </span>
                                {user.created_at && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 ml-12">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{user.total_enrollments} {user.total_enrollments === 1 ? t('course', language) : t('courses', language)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {expandedUsers.has(user.id) ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedUsers.has(user.id) && (
                      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                        {user.enrollments.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            {t('noEnrollmentsYet', language)}
                          </p>
                        ) : (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              {t('enrollments', language)}:
                            </h4>
                            {user.enrollments.map((enrollment) => (
                              <div
                                key={enrollment.course_id}
                                className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                                      {enrollment.course_title}
                                    </h5>
                                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                      {enrollment.enrolled_at && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>{t('enrolledDate', language)}: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <GraduationCap className="h-3 w-3" />
                                        <span>
                                          {enrollment.completed_lessons}/{enrollment.total_lessons} {t('lessons', language)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="ml-4 text-right">
                                    <div className="flex items-center gap-2 mb-1">
                                      <TrendingUp className="h-4 w-4 text-blue-500" />
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {Math.round(enrollment.progress)}%
                                      </span>
                                    </div>
                                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                      <div
                                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                                        style={{ width: `${Math.min(100, Math.max(0, enrollment.progress))}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>

          </>
        )}

        {/* Insights Tab Content */}
        {activeTab === 'insights' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {t('name', language)}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {t('progress', language)}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {t('attendance', language)}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {t('averageGrade', language)}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {t('courses', language)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => loadStudentDetail(student.id)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline text-left"
                        >
                          {student.name}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {Math.round(student.progress)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {student.attendance}%
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {student.averageGrade.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {student.coursesEnrolled}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Course Modal */}
        {showCourseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {editingCourse ? t('editCourse', language) : t('addNewCourse', language)}
              </h3>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                {/* Course Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Course Image
                  </label>
                  <div className="space-y-2">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Course preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setCourseForm({ ...courseForm, thumbnail: '' });
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUploadingImage}
                      className="hidden"
                      id="course-image-upload"
                    />
                    <label
                      htmlFor="course-image-upload"
                      className={`block w-full px-4 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isUploadingImage ? 'Uploading...' : imagePreview ? 'Change Image' : 'Select Image'}
                    </label>
                  </div>
                </div>
                <Input
                  label={t('title', language)}
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('description', language)}
                  </label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <Input
                  label={t('instructor', language)}
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  required
                />
                <Input
                  label={t('durationMinutes', language)}
                  type="number"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: parseInt(e.target.value) })}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isUploadingImage}>
                    {editingCourse ? t('update', language) : t('create', language)}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCourseModal(false);
                      setEditingCourse(null);
                      setCourseForm({ title: '', description: '', instructor: '', duration: 0, thumbnail: '' });
                      setImagePreview(null);
                    }}
                    className="flex-1"
                  >
                    {t('cancel', language)}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Student Detail Modal */}
        {selectedStudentId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto"
            >
              {isLoadingDetail ? (
                <div className="text-center py-12">
                  <Loading text={t('loading', language)} />
                </div>
              ) : studentDetail ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {studentDetail.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Student Insights
                      </p>
                    </div>
                    <button
                      onClick={closeStudentDetail}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Engagement Score */}
                    <Card className="text-center">
                      <div className="mb-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center justify-center gap-1">
                          Engagement Score
                          <div className="group relative">
                            <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                              Weighted Score: Positive actions (100%), Neutral (50%), Negative (0%).
                              Formula: ((Positive×2 + Neutral) ÷ (Total×2)) × 100
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                        <div className="relative w-32 h-32 mx-auto">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-gray-200 dark:text-gray-700"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 56}`}
                              strokeDashoffset={`${2 * Math.PI * 56 * (1 - (studentDetail.engagementScore || 50) / 100)}`}
                              className={`${(studentDetail.engagementScore || 50) >= 75 ? 'text-green-500' :
                                (studentDetail.engagementScore || 50) >= 50 ? 'text-blue-500' :
                                  (studentDetail.engagementScore || 50) >= 25 ? 'text-yellow-500' : 'text-red-500'
                                }`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              {studentDetail.engagementScore || 50}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Total Activities */}
                    <Card>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                            Total Activities
                            <span className="group relative inline-block">
                              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <span className="invisible group-hover:visible absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                                Total learning activities: quizzes, lessons, enrollments
                                <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                              </span>
                            </span>
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {studentDetail.totalActivities || 0}
                          </p>
                        </div>
                        <TrendingUp className="h-10 w-10 text-blue-500" />
                      </div>
                    </Card>

                    {/* Active Days */}
                    <Card>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                            Active Days (30d)
                            <span className="group relative inline-block">
                              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <span className="invisible group-hover:visible absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                                Days with at least one activity in last 30 days
                                <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                              </span>
                            </span>
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {studentDetail.attendance.filter(a => a.present).length}
                          </p>
                        </div>
                        <Users className="h-10 w-10 text-green-500" />
                      </div>
                    </Card>

                    {/* Learning Time */}
                    <Card>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                            Learning Time
                            <span className="group relative inline-block">
                              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <span className="invisible group-hover:visible absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                                Total active time spent on lessons
                                <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                              </span>
                            </span>
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {studentDetail.totalTimeSpent ?
                              (studentDetail.totalTimeSpent > 60
                                ? `${Math.floor(studentDetail.totalTimeSpent / 60)}h ${studentDetail.totalTimeSpent % 60}m`
                                : `${studentDetail.totalTimeSpent}m`)
                              : '0m'}
                          </p>
                        </div>
                        <Clock className="h-10 w-10 text-purple-500" />
                      </div>
                    </Card>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance Trend Chart */}
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        Performance Trend
                        <span className="group relative inline-block">
                          <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span className="invisible group-hover:visible absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                            Quiz scores over time showing learning progress
                            <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                          </span>
                        </span>
                      </h3>
                      {studentDetail.performance.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={studentDetail.performance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="rgb(59, 130, 246)"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              name="Score"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-gray-500 py-12">
                          No performance data available
                        </p>
                      )}
                    </Card>

                    {/* Course Progress Chart */}
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        Course Progress & Breakdown
                        <span className="group relative inline-block">
                          <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span className="invisible group-hover:visible absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                            Detailed breakdown of grades and learning time per course and lesson
                            <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                          </span>
                        </span>
                      </h3>
                      {studentDetail.grades.length > 0 ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {studentDetail.grades.map((course, idx) => (
                            <details key={idx} className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                              <summary className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none transition-colors">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{course.course}</span>
                                  <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                                      <GraduationCap className="w-3 h-3" /> Grade: {course.grade}%
                                    </span>
                                    <span className="flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
                                      <Clock className="w-3 h-3" /> Time: {course.timeSpent}m
                                    </span>
                                  </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                              </summary>
                              <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                                {course.lessons && course.lessons.length > 0 ? (
                                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {course.lessons.map((l, i) => (
                                      <div key={i} className="flex justify-between items-center p-2 pl-4 pr-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">{l.title}</span>
                                        <span className="text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                          {l.timeSpent}m
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-3 text-xs text-center text-gray-400 italic">
                                    No lesson activity details recorded yet.
                                  </div>
                                )}
                              </div>
                            </details>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-12">
                          No course data available
                        </p>
                      )}
                    </Card>
                  </div>

                  {/* Detailed Sentiment Analysis Section */}
                  {studentDetail.sentimentData && (
                    <>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                        Detailed Sentiment Analysis
                      </h3>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Sentiment Breakdown Bar Chart (Detailed) */}
                        <Card>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            Detailed Emotional Distribution
                            <span className="group relative inline-block">
                              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <span className="invisible group-hover:visible absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                                Distribution of specific emotions detected by AI
                                <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                              </span>
                            </span>
                          </h4>
                          {studentDetail.studentSentiments && studentDetail.studentSentiments.length > 0 ? (
                            <>
                              <ResponsiveContainer width="100%" height={250}>
                                <BarChart
                                  data={(() => {
                                    const counts: Record<string, number> = {};
                                    studentDetail.studentSentiments?.forEach(s => {
                                      const label = s.sentiment_label || 'neutral';
                                      counts[label] = (counts[label] || 0) + 1;
                                    });
                                    // Sort by count desc
                                    return Object.entries(counts)
                                      .map(([name, count]) => ({ name, count }))
                                      .sort((a, b) => b.count - a.count)
                                      .slice(0, 8); // Top 8
                                  })()}
                                  layout="vertical"
                                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                  <XAxis type="number" hide />
                                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                  <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                  />
                                  <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20}>
                                    {
                                      // Optional: Different colors for different sentiments? 
                                      // Kept simple pink for now as per user request for "detailed classes"
                                    }
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                              <p className="text-xs text-gray-500 text-center mt-2">Top 8 detected emotions</p>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                              <p>No emotional data recorded yet</p>
                            </div>
                          )}
                        </Card>

                        {/* Activity Type Breakdown Pie Chart */}
                        <Card>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            Activity Type Distribution
                            <span className="group relative inline-block">
                              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <span className="invisible group-hover:visible absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                                Distribution of quizzes, lessons, and enrollments
                                <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                              </span>
                            </span>
                          </h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Quizzes', value: studentDetail.sentimentData.quiz_activities },
                                  { name: 'Lessons', value: studentDetail.sentimentData.lesson_activities },
                                  { name: 'Enrollments', value: studentDetail.sentimentData.enrollment_activities },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                <Cell fill="#3b82f6" />
                                <Cell fill="#8b5cf6" />
                                <Cell fill="#ec4899" />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                Quizzes Submitted
                              </span>
                              <span className="font-semibold">{studentDetail.sentimentData.quiz_activities}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-violet-500"></span>
                                Lessons Completed
                              </span>
                              <span className="font-semibold">{studentDetail.sentimentData.lesson_activities}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                                Course Enrollments
                              </span>
                              <span className="font-semibold">{studentDetail.sentimentData.enrollment_activities}</span>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Engagement Level Badge */}
                      <Card className="mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              Current Engagement Level
                            </h4>
                            <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${studentDetail.sentimentData.engagementLevel === 'Highly Engaged' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              studentDetail.sentimentData.engagementLevel === 'Engaged' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                studentDetail.sentimentData.engagementLevel === 'Moderately Engaged' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                              {studentDetail.sentimentData.engagementLevel}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Score</p>
                            <p className="text-4xl font-bold text-blue-500">{studentDetail.engagementScore}%</p>
                          </div>
                        </div>
                      </Card>
                    </>
                  )}

                  {/* Teacher Notes Section */}
                  {studentDetail.teacherNotes && studentDetail.teacherNotes.length > 0 && (
                    <Card className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        Teacher Notes
                        <span className="group relative inline-block">
                          <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span className="invisible group-hover:visible absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                            Observations from teachers. Higher weight = more important
                            <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                          </span>
                        </span>
                      </h3>
                      <div className="space-y-3">
                        {studentDetail.teacherNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">{note.content}</p>
                              <div className="ml-3 flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${note.weight >= 0.8 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                  note.weight >= 0.5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  }`}>
                                  {note.weight >= 0.8 ? 'High Priority' : note.weight >= 0.5 ? 'Medium' : 'Low'}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {note.timestamp}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Student Sentiments Section */}
                  {studentDetail.studentSentiments && studentDetail.studentSentiments.length > 0 && (
                    <Card className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        Student Emotional State History
                        <span className="group relative inline-block">
                          <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span className="invisible group-hover:visible absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                            AI-detected emotional states from student messages
                            <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                          </span>
                        </span>
                      </h3>
                      <div className="space-y-4">
                        {(() => {
                          const grouped = studentDetail.studentSentiments.reduce((acc, curr) => {
                            const label = curr.sentiment_label || 'Unknown';
                            if (!acc[label]) acc[label] = [];
                            acc[label].push(curr);
                            return acc;
                          }, {} as Record<string, typeof studentDetail.studentSentiments>);

                          return Object.entries(grouped)
                            .sort(([, a], [, b]) => b.length - a.length)
                            .map(([label, items]) => (
                              <details key={label} className="group bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                                  <div className="flex items-center gap-3">
                                    <span className={`w-3 h-3 rounded-full ${label.toLowerCase().includes('frustrat') || label.toLowerCase().includes('struggle') ? 'bg-red-500' :
                                      label.toLowerCase().includes('confus') ? 'bg-yellow-500' :
                                        label.toLowerCase().includes('joy') || label.toLowerCase().includes('excit') ? 'bg-green-500' :
                                          'bg-blue-500'
                                      }`}></span>
                                    <span className="font-semibold text-gray-900 dark:text-white capitalize">
                                      {label}
                                    </span>
                                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                      {items.length}
                                    </span>
                                  </div>
                                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3 bg-white dark:bg-gray-800">
                                  {items.map((sentiment) => (
                                    <div key={sentiment.id} className="text-sm">
                                      <div className="flex justify-between items-start mb-1">
                                        <p className="text-gray-800 dark:text-gray-200 italic">"{sentiment.message}"</p>
                                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{sentiment.timestamp}</span>
                                      </div>
                                      <p className="text-xs text-gray-500">Confidence: {(sentiment.confidence * 100).toFixed(0)}%</p>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            ));
                        })()}
                      </div>
                    </Card>
                  )}

                  {/* Activity Insights */}
                  {studentDetail.notes.length > 0 && (
                    <Card className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Activity Insights
                      </h3>
                      <div className="space-y-3">
                        {studentDetail.notes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {note.timestamp}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-500 py-12">
                  No data available
                </p>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};