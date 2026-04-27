import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  BookOpen, // Icon for Content Tab
  Play,     // Icon for Video Tab
  HelpCircle, // Icon for Quiz Tab
  MessageSquare, // Icon for Chat Tab
  Sparkles,
  RefreshCw
} from 'lucide-react';
import ReactPlayer from 'react-player';

// --- FOR MARKDOWN & MATH ---
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { api } from '@/utils/api';
import { t } from '@/utils/language';
import { useLanguage } from '@/contexts/LanguageContext';

import { DIAGRAM_REGISTRY } from '@/components/lessons/diagrams';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  helpful?: boolean;
  type?: 'text' | 'quiz_widget';
  data?: any;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}
interface QuizData {
  title?: string;
  difficulty?: string;
  questions: QuizQuestion[];
}

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  description: string; // Short description for Video Tab
  content?: string;    // Long content for Content Tab (legacy)
  content_en?: string; // English content
  content_ar?: string; // Arabic content
  diagramId?: string;  // ID to lookup in Registry
  courseId: string;
  courseTitle: string;
  nextLessonId?: string;
  previousLessonId?: string;
  quiz?: {
    questions: QuizQuestion[];
  };
}

export const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TABS: Added 'content' to the list
  const [activeTab, setActiveTab] = useState<'video' | 'content' | 'quiz' | 'chat'>('video');

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Track session time every 10 seconds
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      api.trackLessonTime(id, 10).catch(err => console.error("Tracking failed", err));
    }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (id) {
      loadLesson();
      startSession();
    }
    return () => {
      if (sessionStarted && id) {
        endSession();
      }
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadLesson = async () => {
    try {
      setIsLoading(true);
      const response = await api.getLesson(id!);
      setLesson(response.data);
      if (response.data.quiz) {
        setActiveQuiz({
          title: "Standard Quiz",
          questions: response.data.quiz.questions
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('errorOccurred', language));
    } finally {
      setIsLoading(false);
    }
  };
  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    setQuizSubmitted(false);
    setQuizAnswers({});
    setQuizScore(null);
    setActiveTab('quiz');

    try {
      const response = await api.generateQuiz(id!);
      const backendQuiz = response.data;

      const formattedQuiz: QuizData = {
        title: backendQuiz.title,
        difficulty: backendQuiz.difficulty,
        questions: backendQuiz.questions.map((q: any) => ({
          id: q.id.toString(),
          question: q.text,
          options: q.options,
          correctAnswer: q.correct_option_index
        }))
      };

      setActiveQuiz(formattedQuiz);
    } catch (err) {
      console.error("Failed to generate quiz", err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };
  const startSession = async () => {
    try {
      await api.startSession(id!);
      setSessionStarted(true);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const endSession = async () => {
    try {
      await api.endSession(id!, Math.floor(videoProgress));
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading || !lesson) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await api.sendChatMessage(lesson.id, chatInput);
      const responseData = response.data;
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseData.message || "",
        timestamp: new Date(),
        type: responseData.type || 'text',
        data: responseData.data || null
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err.response?.data?.message || t('errorOccurred', language),
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!activeQuiz) return;
    let correctCount = 0;
    const totalQuestions = activeQuiz.questions.length;

    activeQuiz.questions.forEach((question) => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    const calculatedScore = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;
    setQuizScore(calculatedScore);
    setQuizSubmitted(true);

    try {
      // FIXED: Always submit quiz results with calculated score
      await api.submitQuiz(id!, quizAnswers, calculatedScore);
    } catch (err) {
      console.log("Background sync failed, but user saw score so it's fine.");
    }
  };

  const handleFeedback = async (messageId: string, helpful: boolean) => {
    try {
      await api.feedbackChat(messageId, helpful);
      setChatMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, helpful } : msg))
      );
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const handleCompleteLesson = async () => {
    try {
      await api.logLesson(id!, { completed: true });
      await api.feedbackLesson(id!, '', true);
      if (lesson?.nextLessonId) {
        navigate(`/lessons/${lesson.nextLessonId}`);
      } else {
        navigate(`/courses/${lesson?.courseId}`);
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err);
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

  if (error || !lesson) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert type="error">{error || 'Lesson not found'}</Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/courses/${lesson.courseId}`}
            className="text-sm text-blue-500 hover:underline mb-2 inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            {lesson.courseTitle}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {lesson.title}
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">

          {/* 1. Video Tab */}
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'video'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Play className="w-4 h-4" />
            {t('video', language)}
          </button>

          {/* 2. Content Tab (Only if content exists) */}
          {(lesson.content || lesson.content_en || lesson.content_ar) && (
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'content'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <BookOpen className="w-4 h-4" />
              {t('lessonContent' as any, language) || 'Notes'}
            </button>
          )}


          {/* 3. Quiz Tab - Always Visible */}
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'quiz'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <HelpCircle className="w-4 h-4" />
            {t('quiz', language)}
          </button>


          {/* 4. Chat Tab */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'chat'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            {t('studyAssistant' as any, language)}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">

            {/* ========================================================= */}
            {/* TAB 1: VIDEO (Video + Description only) */}
            {/* ========================================================= */}
            {activeTab === 'video' && (
              <Card padding="none" className="overflow-hidden">
                <div className="aspect-video bg-black">
                  <ReactPlayer
                    url={lesson.videoUrl}
                    width="100%"
                    height="100%"
                    controls
                    onProgress={(state) => setVideoProgress(state.playedSeconds)}
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {t('video', language)}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {lesson.description}
                  </p>

                  <Button onClick={handleCompleteLesson} className="w-full">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t('completeLesson', language)}
                  </Button>
                </div>
              </Card>
            )}

            {/* ========================================================= */}
            {/* TAB 2: CONTENT (JSON Text + Registry Diagram) */}
            {/* ========================================================= */}
            {activeTab === 'content' && (lesson.content || lesson.content_en || lesson.content_ar) && (
              <Card>
                <div className="p-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b-2 border-blue-500">
                    {t('lessonContent' as any, language) || 'Lecture Notes'}
                  </h2>

                  <div className="prose prose-lg dark:prose-invert max-w-none 
                    prose-headings:text-gray-900 dark:prose-headings:text-white
                    prose-headings:font-bold prose-headings:border-b prose-headings:border-gray-200 dark:prose-headings:border-gray-700 prose-headings:pb-2 prose-headings:mb-4
                    prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-800
                    prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                    prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                    prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                    prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-2
                    prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                    prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:my-8
                  ">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {(() => {
                        // Language-aware content selection
                        if (language === 'ar' && lesson.content_ar) {
                          return lesson.content_ar;
                        } else if (language === 'en' && lesson.content_en) {
                          return lesson.content_en;
                        } else if (lesson.content_en) {
                          return lesson.content_en;
                        } else if (lesson.content) {
                          return lesson.content;
                        } else {
                          return lesson.content_ar || "No content available.";
                        }
                      })()}
                    </ReactMarkdown>
                  </div>

                  {/* The Diagram (Rendered from Registry if ID exists) */}
                  {lesson.diagramId && DIAGRAM_REGISTRY[lesson.diagramId] && (
                    <div className="mt-8 border-t-2 border-gray-100 dark:border-gray-700 pt-8">
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-8 bg-blue-500 rounded"></span>
                        {t('visualAid' as any, language) || 'Visual Aid'}
                      </h3>
                      {(() => {
                        const DiagramComponent = DIAGRAM_REGISTRY[lesson.diagramId!];
                        return <DiagramComponent />;
                      })()}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* ========================================================= */}
            {/* TAB 3: QUIZ (Updated for AI)                              */}
            {/* ========================================================= */}
            {activeTab === 'quiz' && (
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {activeQuiz?.title || t('quiz', language)}
                    </h2>
                    {activeQuiz?.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded-full ${activeQuiz.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                        activeQuiz.difficulty === 'HARD' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                        {activeQuiz.difficulty}
                      </span>
                    )}
                  </div>

                  {/* THE MAGIC BUTTON */}
                  <Button
                    variant="outline"
                    onClick={handleGenerateQuiz}
                    disabled={isGeneratingQuiz}
                    className="flex items-center gap-2"
                  >
                    {isGeneratingQuiz ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-purple-500" />
                    )}
                    {t('generateNewQuiz' as any, language) || 'Generate AI Quiz'}
                  </Button>
                </div>

                {/* LOAD STATE */}
                {isGeneratingQuiz && (
                  <div className="py-12 text-center">
                    <Loading text="Analyzing your progress and generating questions..." />
                  </div>
                )}

                {/* QUIZ CONTENT (Using activeQuiz state instead of lesson.quiz) */}
                {!isGeneratingQuiz && activeQuiz && (
                  <>
                    {quizSubmitted && quizScore !== null ? (
                      // ... (Keep existing Score UI, just update text) ...
                      <div className="text-center py-8">
                        <div className="text-4xl font-bold text-blue-500 mb-2">{quizScore}%</div>
                        <Button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>
                          Retry This Quiz
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {activeQuiz.questions.map((question, index) => (
                          <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                              {index + 1}. {question.question}
                            </h3>
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <label key={optIndex} className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value={optIndex}
                                    checked={quizAnswers[question.id] === optIndex}
                                    onChange={() => setQuizAnswers({ ...quizAnswers, [question.id]: optIndex })}
                                    className="mr-3"
                                  />
                                  <span className="text-gray-700 dark:text-gray-300">{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                        <Button onClick={handleQuizSubmit} className="w-full mt-4">
                          {t('submitQuiz', language)}
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* EMPTY STATE (If no quiz exists) */}
                {!isGeneratingQuiz && !activeQuiz && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No standard quiz available for this lesson.</p>
                    <Button onClick={handleGenerateQuiz}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Personalized Quiz
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* ========================================================= */}
            {/* TAB 4: CHAT (Assistant) */}
            {/* ========================================================= */}
            {activeTab === 'chat' && (
              <Card padding="none" className="flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('studyAssistant' as any, language)}
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      {t('askQuestion', language)}
                    </div>
                  )}
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>

                        <div className={`prose max-w-none text-sm ${message.role === 'user'
                          ? 'prose-invert text-white' // Force white text on blue background
                          : 'prose-gray dark:prose-invert text-gray-900 dark:text-white' // Standard for gray bubbles
                          }`}>
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              // Fix Table Styling
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700" {...props} />
                                </div>
                              ),
                              th: ({ node, ...props }) => (
                                <th className="px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left text-gray-900 dark:text-white" {...props} />
                              ),
                              td: ({ node, ...props }) => (
                                <td className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300" {...props} />
                              ),
                              // Fix Image Handling - Catches ![Alt text] even without URL
                              img: ({ node, ...props }) => {
                                // If we have a real URL from the backend, show the actual image!
                                if (props.src) {
                                  return (
                                    <div className="my-6 flex flex-col items-center">
                                      <img
                                        {...props}
                                        className="rounded-xl shadow-lg max-w-full h-auto border-2 border-gray-100 dark:border-gray-800 transition-all hover:scale-[1.01]"
                                        loading="lazy"
                                        referrerPolicy="no-referrer" // Helps bypass some hotlink protections
                                      />
                                      {props.alt && (
                                        <p className="mt-2 text-xs text-gray-500 italic bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                                          🔍 {props.alt}
                                        </p>
                                      )}
                                    </div>
                                  );
                                }

                                // Only show this if there is NO URL found
                                return (
                                  <div className="my-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-3">
                                    <span className="text-xl">🖼️</span>
                                    <span className="text-sm italic">Finding diagram for: {props.alt}</span>
                                  </div>
                                );
                              },
                              p: ({ node, ...props }) => {
                                // This ensures that if the AI sends text [Image of...] without standard Markdown formatting, 
                                // we still don't show the raw text as a "Diagram:" box, but let it be handled by the backend.
                                return <p className="mb-4 last:mb-0 leading-relaxed" {...props} />;
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>


                        {message.type === 'quiz_widget' && message.data && (
                          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-900 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="h-5 w-5 text-purple-500" />
                              <span className="font-semibold text-purple-700 dark:text-purple-400">Personalized Quiz Ready</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                              {message.data.title} ({message.data.difficulty})
                            </p>
                            <Button
                              size="sm"
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => {
                                // Load the data into the Quiz Tab and switch tabs
                                const backendQuiz = message.data;
                                const formattedQuiz: QuizData = {
                                  title: backendQuiz.title,
                                  difficulty: backendQuiz.difficulty,
                                  questions: backendQuiz.questions.map((q: any) => ({
                                    id: q.id.toString(),
                                    question: q.text,
                                    options: q.options,
                                    correctAnswer: q.correct_option_index
                                  }))
                                };
                                setActiveQuiz(formattedQuiz);
                                setQuizSubmitted(false);
                                setQuizAnswers({});
                                setQuizScore(null);
                                setActiveTab('quiz');
                              }}
                            >
                              Take Quiz Now
                            </Button>
                          </div>
                        )}
                        {message.role === 'assistant' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleFeedback(message.id, true)}
                              className={`p-1 rounded ${message.helpful === true
                                ? 'bg-green-500 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, false)}
                              className={`p-1 rounded ${message.helpful === false
                                ? 'bg-red-500 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-gray-600 dark:text-gray-400">
                          {t('thinking', language)}...
                        </p>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={t('askQuestion', language)}
                      disabled={isChatLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isChatLoading || !chatInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('lesson', language)} {t('navigation', language)}
              </h3>
              <div className="space-y-2">
                {lesson.previousLessonId && (
                  <Link
                    to={`/lessons/${lesson.previousLessonId}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('previousLesson', language)}
                    </span>
                    <ChevronLeft className="h-4 w-4 text-gray-400" />
                  </Link>
                )}
                {lesson.nextLessonId && (
                  <Link
                    to={`/lessons/${lesson.nextLessonId}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('nextLesson', language)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};