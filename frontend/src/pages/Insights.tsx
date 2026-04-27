import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, BookOpen } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { api } from '@/utils/api';
import { t } from '@/utils/language';
import { useLanguage } from '@/contexts/LanguageContext';

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
  }[];
  notes: {
    id: string;
    content: string;
    timestamp: string;
  }[];
  studentSentiments: {
    id: string;
    message: string;
    sentiment_label: string;
    confidence: number;
    timestamp: string;
  }[];
  teacherNotes: {
    id: string;
    content: string;
    weight: number;
    timestamp: string;
  }[];
}

export const Insights = () => {
  const { studentId } = useParams<{ studentId?: string }>();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [note, setNote] = useState('');
  const { language } = useLanguage();

  useEffect(() => {
    if (studentId) {
      loadStudentDetail();
    } else {
      loadStudents();
    }
  }, [studentId]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const response = await api.getInsightsStudents();
      setStudents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('errorOccurred', language));
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentDetail = async () => {
    try {
      setIsLoading(true);
      const [studentResponse, notesResponse] = await Promise.all([
        api.getInsightsStudent(studentId!),
        api.getNotesStudent(studentId!),
      ]);
      setSelectedStudent({
        ...studentResponse.data,
        notes: notesResponse.data,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || t('errorOccurred', language));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !studentId) return;
    try {
      await api.addInsightComment(studentId, comment);
      setComment('');
      loadStudentDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || t('errorOccurred', language));
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

  // Student Detail View
  if (selectedStudent) {
    const attendanceRate =
      (selectedStudent.attendance.filter((a) => a.present).length /
        selectedStudent.attendance.length) *
      100;

    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => navigate('/insights')}
              className="text-sm text-blue-500 hover:underline mb-2"
            >
              ← {t('back', language)}
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedStudent.name}
            </h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('averageGrade', language)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedStudent.grades.length > 0
                      ? (
                        selectedStudent.grades.reduce((sum, g) => sum + g.grade, 0) /
                        selectedStudent.grades.length
                      ).toFixed(1)
                      : 'N/A'}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('attendance', language)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {attendanceRate.toFixed(0)}%
                  </p>
                </div>
                <Users className="h-10 w-10 text-green-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('courses', language)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedStudent.grades.length}
                  </p>
                </div>
                <BookOpen className="h-10 w-10 text-violet-500" />
              </div>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('performance', language)}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedStudent.performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Emotions Chart (New) */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Emotional Analysis (RoBERTa Model)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={(() => {
                  const counts: Record<string, number> = {};
                  selectedStudent.studentSentiments?.forEach(s => {
                    const label = s.sentiment_label || 'neutral';
                    counts[label] = (counts[label] || 0) + 1;
                  });
                  return Object.entries(counts).map(([name, count]) => ({ name, count }));
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>

            {/* Recent Expressions List */}
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Expressions:</h3>
              {selectedStudent.studentSentiments?.slice(0, 5).map(s => (
                <div key={s.id} className="text-sm border-l-2 border-pink-500 pl-3 py-1">
                  <p className="text-gray-800 dark:text-gray-200">"{s.message}"</p>
                  <p className="text-xs text-gray-500">
                    <span className="font-bold text-pink-600 uppercase">{s.sentiment_label}</span> •
                    Confidence: {(s.confidence * 100).toFixed(0)}% • {s.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Grades Chart */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('grades', language)}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={selectedStudent.grades}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="grade" fill="rgb(139, 92, 246)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Comments */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('comments', language)}
            </h2>
            <div className="space-y-3 mb-4">
              {/* Comments would be rendered here from API */}
            </div>
            <div className="flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('addComment', language)}
                className="flex-1"
              />
              <Button onClick={handleAddComment}>{t('addComment', language)}</Button>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('notes', language)}
            </h2>
            <div className="space-y-3 mb-4">
              {selectedStudent.notes.map((note) => (
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
            <div className="flex gap-2">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('addNote', language)}
                className="flex-1"
              />
              <Button onClick={() => setNote('')}>{t('addNote', language)}</Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Students List View
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('insights', language)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('students', language)} {t('performance', language)}
          </p>
        </div>

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
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {t('actions', language)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{student.name}</td>
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
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/insights/student/${student.id}`)}
                      >
                        {t('view', language)}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

