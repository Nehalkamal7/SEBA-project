import { motion } from 'framer-motion';
import { X, TrendingUp, Users, Clock, GraduationCap, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { t } from '@/utils/language';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

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

interface StudentInsightsModalProps {
    studentDetail: StudentDetail | null;
    isLoading: boolean;
    onClose: () => void;
}

export const StudentInsightsModal = ({ studentDetail, isLoading, onClose }: StudentInsightsModalProps) => {
    const { language } = useLanguage();

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                {isLoading ? (
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
                                onClick={onClose}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-6 h-6" />
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
                                                            return Object.entries(counts)
                                                                .map(([name, count]) => ({ name, count }))
                                                                .sort((a, b) => b.count - a.count)
                                                                .slice(0, 8);
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
                                                        <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20} />
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
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                        {note.content}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <span className="font-semibold">Priority:</span>
                                                            <span className={`px-2 py-0.5 rounded ${note.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                                note.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {note.priority}
                                                            </span>
                                                        </span>
                                                        <span>Weight: {note.weight}</span>
                                                        <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Student Sentiments Details */}
                        {studentDetail.studentSentiments && studentDetail.studentSentiments.length > 0 && (
                            <Card className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    AI-Detected Student Messages
                                    <span className="group relative inline-block">
                                        <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span className="invisible group-hover:visible absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                                            Student messages analyzed by AI for emotional states
                                            <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                                        </span>
                                    </span>
                                </h3>
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                    {studentDetail.studentSentiments.map((sentiment) => (
                                        <div
                                            key={sentiment.id}
                                            className={`p-4 rounded-lg border-l-4 ${sentiment.sentiment_label === 'positive' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                                                sentiment.sentiment_label === 'negative' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                                                    'bg-gray-50 dark:bg-gray-700/20 border-gray-400'
                                                }`}
                                        >
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 italic">
                                                "{sentiment.message}"
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                <span className={`px-2 py-0.5 rounded font-semibold ${sentiment.sentiment_label === 'positive' ? 'bg-green-100 text-green-700' :
                                                    sentiment.sentiment_label === 'negative' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {sentiment.sentiment_label}
                                                </span>
                                                <span>Confidence: {Math.round(sentiment.confidence * 100)}%</span>
                                                <span>{new Date(sentiment.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        No student details available
                    </div>
                )}
            </motion.div>
        </div>
    );
};
