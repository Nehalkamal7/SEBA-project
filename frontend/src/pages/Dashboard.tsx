import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, TrendingUp, Play, ChevronRight, X, Users, GraduationCap, Award, Activity, Brain, MessageSquare, Calendar, Target, TrendingDown, Info, ChevronDown } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { api } from '@/utils/api';
import { t } from '@/utils/language';
import { useLanguage } from '@/contexts/LanguageContext';
import { fadeInUp, staggerContainer } from '@/utils/animations';
import { StudentInsightsModal } from '@/components/admin/StudentInsightsModal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

interface Course {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  thumbnail?: string;
}

interface StudentSummary {
  id: number;
  name: string;
  email: string;
  totalTimeSpent: number;
  averageGrade: number;
  coursesCount: number;
}

interface DashboardData {
  courses: Course[];
  progress: number;
  upcomingLessons: any[];
  recentActivity: any[];
  students?: StudentSummary[];
}

interface StudentDetail {
  id: number;
  name: string;
  performance: { date: string; score: number }[];
  attendance: { date: string; present: boolean }[];
  grades: {
    course: string;
    grade: number;
    timeSpent: number;
    lessons: { title: string; timeSpent: number; }[];
  }[];
  notes: any[];
  engagementScore?: number;
  totalActivities?: number;
  totalTimeSpent?: number;
  sentimentData?: any;
  teacherNotes?: {
    id: string;
    content: string;
    priority: string;
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

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    loadDashboard();
  }, []);

  // Helper function to normalize image URLs
  const normalizeImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    // If it's already a full URL, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If it starts with /uploads, construct the full URL
    if (url.startsWith('/uploads')) {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const baseUrl = API_BASE_URL.replace('/api', '') || window.location.origin;
      return baseUrl + url;
    }
    return url;
  };

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDashboard();
      const dashboardData = response.data;
      // Normalize thumbnail URLs for courses
      if (dashboardData?.courses) {
        dashboardData.courses = dashboardData.courses.map((course: any) => ({
          ...course,
          thumbnail: normalizeImageUrl(course.thumbnail)
        }));
      }
      setData(dashboardData);
    } catch (err: any) {
      setError(err.response?.data?.message || t('errorOccurred', language));
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentDetail = async (studentId: number) => {
    try {
      setIsLoadingDetail(true);
      setSelectedStudentId(String(studentId));
      const response = await api.getInsightsStudent(String(studentId));
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

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert type="error">{error}</Alert>
        </div>
      </Layout>
    );
  }

  // Parent/Teacher View
  if (data?.students && data.students.length > 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer as any}
            className="mb-8"
          >
            <motion.h1
              variants={fadeInUp as any}
              className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
            >
              {t('dashboard', language)}
            </motion.h1>
            <motion.p
              variants={fadeInUp as any}
              className="text-lg text- gray-600 dark:text-gray-400"
            >
              Your Students Overview
            </motion.p>
          </motion.div>

          {/* Student List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.students.map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => loadStudentDetail(student.id)}
                className="cursor-pointer"
              >
                <Card className="hover:shadow-xl transition-all bg-white dark:bg-gray-800 border-l-4 border-blue-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">{student.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{student.email}</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400" />
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Avg Grade
                      </span>
                      <span className={`font-bold text-lg ${student.averageGrade >= 80 ? 'text-green-600 dark:text-green-400' : student.averageGrade >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                        {student.averageGrade}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-900/30 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time Spent
                      </span>
                      <span className="font-bold text-lg text-violet-600 dark:text-violet-400">{student.totalTimeSpent}m</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Enrolled Courses
                      </span>
                      <span className="font-bold text-lg text-green-600 dark:text-green-400">{student.coursesCount}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>


          {/* Student Detail Modal - Using Reusable Component */}
          <AnimatePresence>
            {selectedStudentId && (
              <StudentInsightsModal
                studentDetail={studentDetail}
                isLoading={isLoadingDetail}
                onClose={closeStudentDetail}
              />
            )}
          </AnimatePresence>
        </div>
      </Layout>
    );
  }

  // Student View (Regular Dashboard)
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer as any}
          className="mb-8"
        >
          <motion.h1
            variants={fadeInUp as any}
            className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
          >
            {t('dashboard', language)}
          </motion.h1>
          <motion.p
            variants={fadeInUp as any}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            {t('continueLearning', language)}
          </motion.p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer as any}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: t('myCourses', language), value: data?.courses.length || 0 },
            { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: t('progress', language), value: `${Math.round(data?.progress || 0)}%` },
            { icon: Clock, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30', label: t('upcomingLessons', language), value: data?.upcomingLessons.length || 0 },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={index} variants={fadeInUp as any}>
                <Card hover className="relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 dark:to-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {stat.label}
                      </p>
                      <motion.p
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                        className="text-3xl font-bold text-gray-900 dark:text-white"
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`w-14 h-14 ${stat.bg} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className={`h-7 w-7 ${stat.color}`} />
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Continue Learning */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer as any}
          className="mb-8"
        >
          <motion.div
            variants={fadeInUp as any}
            className="flex items-center justify-between mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('continueLearning', language)}
            </h2>
            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/courses"
                className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
              >
                {t('viewAll', language)}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.courses.slice(0, 3).map((course, index) => (
              <motion.div
                key={course.id}
                variants={fadeInUp as any}
                whileHover={{ y: -8 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/courses/${course.id}`}>
                  <Card hover className="cursor-pointer h-full overflow-hidden group">
                    <div className="aspect-video bg-gradient-to-br from-blue-400 to-violet-500 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                      {course.thumbnail ? (
                        <motion.img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover rounded-lg"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-white" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {course.instructor}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: "easeOut" }}
                          className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {Math.round(course.progress)}%
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        {data?.recentActivity && data.recentActivity.length > 0 && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('recentActivity', language)}
            </h2>
            <div className="space-y-3">
              {data.recentActivity.map((activity: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <Play className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};
