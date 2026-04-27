import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Users, BookOpen, Play, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { api } from '@/utils/api';
import { t } from '@/utils/language';
import { useLanguage } from '@/contexts/LanguageContext';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  order: number;
  term?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number;
  enrolled: number;
  thumbnail?: string;
  isEnrolled?: boolean;
  progress?: number;
  lessons: Lesson[];
}

export const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

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

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const response = await api.getCourse(id!);
      const courseData = response.data;
      // Normalize thumbnail URL
      if (courseData.thumbnail) {
        courseData.thumbnail = normalizeImageUrl(courseData.thumbnail);
      }
      setCourse(courseData);
    } catch (err: any) {
      setError(err.response?.data?.message || t('errorOccurred', language));
    } finally {
      setIsLoading(false);
    }
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

  if (error || !course) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert type="error">{error || 'Course not found'}</Alert>
        </div>
      </Layout>
    );
  }

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);
      await api.enrollInCourse(id!);
      await loadCourse(); // Reload to update enrollment status
    } catch (err: any) {
      setError(err.response?.data?.detail || t('errorOccurred', language));
    } finally {
      setIsEnrolling(false);
    }
  };

  const nextLesson = course.lessons.find((l) => !l.completed);
  const completedCount = course.lessons.filter((l) => l.completed).length;
  const progress = course.progress !== undefined
    ? course.progress
    : (course.lessons.length > 0 ? (completedCount / course.lessons.length) * 100 : 0);
  const isCompleted = progress >= 100 && course.lessons.length > 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {course.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    {Math.floor(course.duration / 60)}h {course.duration % 60}m
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{course.enrolled} {t('enrolled', language)}</span>
                </div>
              </div>
              {course.isEnrolled && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('progress', language)}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {isNaN(progress) ? 0 : Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${isNaN(progress) ? 0 : Math.min(100, Math.max(0, progress))}%` }}
                    />
                  </div>
                </div>
              )}
              {!course.isEnrolled ? (
                <Button onClick={handleEnroll} isLoading={isEnrolling}>
                  <Play className="h-4 w-4 mr-2" />
                  {t('enroll', language)}
                </Button>
              ) : nextLesson ? (
                <Link to={`/lessons/${nextLesson.id}`}>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    {t('continueCourse', language)}
                  </Button>
                </Link>
              ) : isCompleted ? (
                <Button disabled>{t('course', language)} {t('completed', language)}</Button>
              ) : (
                <Link to={`/lessons/${course.lessons[0]?.id}`}>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    {t('startCourse', language) || 'Start Course'}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('lessons', language)}
          </h2>
          {Object.entries(
            course.lessons.reduce((groups, lesson) => {
              const term = lesson.term || 'General';
              if (!groups[term]) groups[term] = [];
              groups[term].push(lesson);
              return groups;
            }, {} as Record<string, Lesson[]>)
          ).sort().map(([term, lessons]) => (
            <div key={term} className="mb-8 last:mb-0">
              {term !== 'General' && (
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                  {term}
                </h3>
              )}
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    to={`/lessons/${lesson.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                        {lesson.order}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.completed && (
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                          {t('completed', language)}
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </Layout>
  );
};
