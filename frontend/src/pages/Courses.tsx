import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// 1. Removed 'Play' from the import list
import { BookOpen, Clock, Users } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { api } from '@/utils/api';
import { t } from '@/utils/language';
import { useLanguage } from '@/contexts/LanguageContext';
import { fadeInUp, staggerContainer } from '@/utils/animations';

export const Courses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    loadCourses();
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

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAllCourses();
      // Normalize thumbnail URLs
      const normalizedCourses = (response.data || []).map((course: any) => ({
        ...course,
        thumbnail: normalizeImageUrl(course.thumbnail)
      }));
      setCourses(normalizedCourses);
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

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert type="error">{error}</Alert>
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
          // 2. Added 'as any'
          variants={staggerContainer as any}
          className="mb-8"
        >
          <motion.h1
            // 2. Added 'as any'
            variants={fadeInUp as any}
            className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
          >
            {t('courses', language)}
          </motion.h1>
          <motion.p
            variants={fadeInUp as any}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            {t('myCourses', language)}
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          // 2. Added 'as any'
          variants={staggerContainer as any}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              // 2. Added 'as any'
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
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {Math.floor(course.duration / 60)}h {course.duration % 60}m
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.enrolled}</span>
                    </div>
                  </div>
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
        </motion.div>
      </div>
    </Layout>
  );
};