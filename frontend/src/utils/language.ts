export type Language = 'en' | 'ar';

const LANGUAGE_KEY = 'seba-language';

export const getLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';

  const stored = localStorage.getItem(LANGUAGE_KEY) as Language | null;
  return stored || 'en';
};

export const setLanguage = (lang: Language): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(LANGUAGE_KEY, lang);
  const html = document.documentElement;
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  html.setAttribute('lang', lang);
};

// Initialize language on load
if (typeof window !== 'undefined') {
  setLanguage(getLanguage());
}

// Translations
export const translations = {
  en: {
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name',
    role: 'Role',
    student: 'Student',
    parent: 'Parent',
    teacher: 'Teacher',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember Me',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",

    // Dashboard
    dashboard: 'Dashboard',
    myCourses: 'My Courses',
    progress: 'Progress',
    upcomingLessons: 'Upcoming Lessons',
    recentActivity: 'Recent Activity',
    continueLearning: 'Continue Learning',
    viewAll: 'View All',

    // Courses
    courses: 'Courses',
    course: 'Course',
    lessons: 'Lessons',
    lesson: 'Lesson',
    instructor: 'Instructor',
    duration: 'Duration',
    enrolled: 'Enrolled',
    enroll: 'Enroll in Course',
    startCourse: 'Start Course',
    continueCourse: 'Continue Course',

    // Lessons
    video: 'Video',
    quiz: 'Quiz',
    studyAssistant: 'Study Assistant',
    nextLesson: 'Next Lesson',
    previousLesson: 'Previous Lesson',
    completeLesson: 'Complete Lesson',
    lessonCompleted: 'Lesson Completed',
    submitQuiz: 'Submit Quiz',
    yourScore: 'Your Score',
    questions: 'Questions',
    correct: 'Correct',
    incorrect: 'Incorrect',
    navigation: 'Navigation',
    completed: 'Completed',

    // Chat
    askQuestion: 'Ask a question...',
    send: 'Send',
    thinking: 'Thinking...',
    errorOccurred: 'An error occurred',
    feedback: 'Feedback',
    helpful: 'Helpful',
    notHelpful: 'Not Helpful',

    // Insights
    insights: 'Insights',
    students: 'Students',
    performance: 'Performance',
    attendance: 'Attendance',
    grades: 'Grades',
    comments: 'Comments',
    addComment: 'Add Comment',
    notes: 'Notes',
    addNote: 'Add Note',
    averageGrade: 'Average Grade',
    actions: 'Actions',
    view: 'View',

    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    settings: 'Settings',
    profile: 'Profile',
    notifications: 'Notifications',
    goals: 'Goals',
    preferences: 'Preferences',

    // Admin Panel
    adminPanel: 'Admin Panel',
    manageCoursesLessonsUsers: 'Manage courses, lessons, and users',
    totalCourses: 'Total Courses',
    totalLessons: 'Total Lessons',
    totalUsers: 'Total Users',
    addCourse: 'Add Course',
    editCourse: 'Edit Course',
    addNewCourse: 'Add New Course',
    title: 'Title',
    description: 'Description',
    instructor: 'Instructor',
    durationMinutes: 'Duration (minutes)',
    create: 'Create',
    update: 'Update',
    users: 'Users',
    noEnrollmentsYet: 'No enrollments yet',
    enrollments: 'Enrollments',
    enrolledDate: 'Enrolled',
    areYouSureDeleteCourse: 'Are you sure you want to delete this course?',
  },
  ar: {
    // Auth
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    name: 'الاسم',
    role: 'الدور',
    student: 'طالب',
    parent: 'ولي أمر',
    teacher: 'معلم',
    forgotPassword: 'نسيت كلمة المرور؟',
    rememberMe: 'تذكرني',
    createAccount: 'إنشاء حساب',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',

    // Dashboard
    dashboard: 'لوحة التحكم',
    myCourses: 'دوراتي',
    progress: 'التقدم',
    upcomingLessons: 'الدروس القادمة',
    recentActivity: 'النشاط الأخير',
    continueLearning: 'متابعة التعلم',
    viewAll: 'عرض الكل',

    // Courses
    courses: 'الدورات',
    course: 'دورة',
    lessons: 'دروس',
    lesson: 'درس',
    instructor: 'المدرب',
    duration: 'المدة',
    enrolled: 'مسجل',
    enroll: 'التسجيل في الدورة',
    startCourse: 'بدء الدورة',
    continueCourse: 'متابعة الدورة',

    // Lessons
    video: 'فيديو',
    quiz: 'اختبار',
    studyAssistant: 'مساعد الدراسة',
    nextLesson: 'الدرس التالي',
    previousLesson: 'الدرس السابق',
    completeLesson: 'إكمال الدرس',
    lessonCompleted: 'تم إكمال الدرس',
    submitQuiz: 'إرسال الاختبار',
    yourScore: 'نقاطك',
    questions: 'أسئلة',
    correct: 'صحيح',
    incorrect: 'غير صحيح',
    navigation: 'التنقل',
    completed: 'مكتمل',

    // Chat
    askQuestion: 'اطرح سؤالاً...',
    send: 'إرسال',
    thinking: 'جاري التفكير...',
    errorOccurred: 'حدث خطأ',
    feedback: 'التقييم',
    helpful: 'مفيد',
    notHelpful: 'غير مفيد',

    // Insights
    insights: 'الرؤى',
    students: 'الطلاب',
    performance: 'الأداء',
    attendance: 'الحضور',
    grades: 'الدرجات',
    comments: 'تعليقات',
    addComment: 'إضافة تعليق',
    notes: 'ملاحظات',
    addNote: 'إضافة ملاحظة',
    averageGrade: 'المتوسط',
    actions: 'الإجراءات',
    view: 'عرض',

    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    close: 'إغلاق',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    search: 'بحث',
    filter: 'تصفية',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    notifications: 'الإشعارات',
    goals: 'الأهداف',
    preferences: 'التفضيلات',

    // Admin Panel
    adminPanel: 'لوحة الإدارة',
    manageCoursesLessonsUsers: 'إدارة الدورات والدروس والمستخدمين',
    totalCourses: 'إجمالي الدورات',
    totalLessons: 'إجمالي الدروس',
    totalUsers: 'إجمالي المستخدمين',
    addCourse: 'إضافة دورة',
    editCourse: 'تعديل الدورة',
    addNewCourse: 'إضافة دورة جديدة',
    title: 'العنوان',
    description: 'الوصف',
    instructor: 'المدرب',
    durationMinutes: 'المدة (بالدقائق)',
    create: 'إنشاء',
    update: 'تحديث',
    users: 'المستخدمون',
    noEnrollmentsYet: 'لا توجد تسجيلات بعد',
    enrollments: 'التسجيلات',
    enrolledDate: 'تاريخ التسجيل',
    areYouSureDeleteCourse: 'هل أنت متأكد من حذف هذه الدورة؟',
  },
};

export const t = (key: keyof typeof translations.en, lang: Language = getLanguage()): string => {
  return translations[lang][key] || key;
};

