export interface Lesson {
  id: string;
  title: string;
  duration: number; // in minutes
  completed: boolean;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // total minutes
  enrolled: number;
  thumbnail: string | null;
  progress: number; // 0-100
  lessons: Lesson[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
}

export interface LessonDetail {
  id: string;
  title: string;
  videoUrl: string;
  description: string;
  content: string; // Markdown content for the lesson
  courseId: string;
  courseTitle: string;
  nextLessonId: string | null;
  previousLessonId: string | null;
  quiz?: {
    questions: Question[];
  };
}

export interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  attendance: number;
  averageGrade: number;
  coursesEnrolled: number;
}

// --- Mock Data ---

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners.',
    instructor: 'Sarah Johnson',
    duration: 120,
    enrolled: 1250,
    thumbnail: 'https://placehold.co/600x400/2563eb/ffffff?text=Web+Dev',
    progress: 65,
    lessons: [
      { id: '1', title: 'HTML Basics', duration: 15, completed: true, order: 1 },
      { id: '2', title: 'CSS Styling', duration: 20, completed: true, order: 2 },
      { id: '3', title: 'JavaScript Fundamentals', duration: 25, completed: false, order: 3 },
      { id: '4', title: 'Building Your First Website', duration: 30, completed: false, order: 4 },
    ],
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    description: 'Master advanced React patterns, hooks, and state management.',
    instructor: 'Michael Chen',
    duration: 180,
    enrolled: 890,
    thumbnail: 'https://placehold.co/600x400/61dafb/000000?text=React',
    progress: 40,
    lessons: [
      { id: '5', title: 'Custom Hooks', duration: 20, completed: true, order: 1 },
      { id: '6', title: 'Context API Deep Dive', duration: 25, completed: false, order: 2 },
      { id: '7', title: 'Performance Optimization', duration: 30, completed: false, order: 3 },
    ],
  },
  {
    id: '3',
    title: 'Data Science with Python',
    description: 'Learn data analysis, visualization, and machine learning with Python.',
    instructor: 'Dr. Emily Rodriguez',
    duration: 240,
    enrolled: 2100,
    thumbnail: 'https://placehold.co/600x400/fbbf24/000000?text=Python',
    progress: 80,
    lessons: [
      { id: '8', title: 'Python Basics', duration: 30, completed: true, order: 1 },
      { id: '9', title: 'Data Analysis with Pandas', duration: 40, completed: true, order: 2 },
      { id: '10', title: 'Data Visualization', duration: 35, completed: true, order: 3 },
      { id: '11', title: 'Introduction to Machine Learning', duration: 45, completed: false, order: 4 },
    ],
  },
];

// We use a helper to generate generic content for lessons not explicitly defined
const getGenericLesson = (id: string): LessonDetail => ({
  id,
  title: `Lesson ${id}`,
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  description: 'This is a placeholder description for lessons that do not have specific mock data yet.',
  content: `## Generic Lesson Content\n\nThis is the content for lesson ID: ${id}. It is generated automatically for testing purposes.`,
  courseId: '1',
  courseTitle: 'Generic Course',
  nextLessonId: null,
  previousLessonId: null,
  quiz: {
    questions: [
      {
        id: `q${id}_1`,
        question: 'Is this a placeholder?',
        options: ['Yes', 'No'],
        correctAnswer: 0
      }
    ]
  }
});

export const mockLessons: Record<string, LessonDetail> = {
  '1': {
    id: '1',
    title: 'HTML Basics',
    videoUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg', // Embed URL preferred for IFrames
    description: 'Learn the fundamentals of HTML including tags, attributes, and document structure.',
    content: `
# HTML Basics

HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser.

## Key Concepts
1. **Tags**: The building blocks of HTML (e.g., \`<h1>\`, \`<div>\`).
2. **Attributes**: Provide additional information about elements (e.g., \`class="container"\`).
3. **Structure**: The hierarchy of the DOM tree.

\`\`\`html
<!DOCTYPE html>
<html>
<body>
  <h1>My First Heading</h1>
  <p>My first paragraph.</p>
</body>
</html>
\`\`\`
    `,
    courseId: '1',
    courseTitle: 'Introduction to Web Development',
    nextLessonId: '2',
    previousLessonId: null,
    quiz: {
      questions: [
        {
          id: 'q1',
          question: 'What does HTML stand for?',
          options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
          correctAnswer: 0,
        },
        {
          id: 'q2',
          question: 'Which tag is used to create a paragraph?',
          options: ['<para>', '<p>', '<paragraph>', '<text>'],
          correctAnswer: 1,
        },
        {
          id: 'q3',
          question: 'What is the correct HTML element for the largest heading?',
          options: ['<heading>', '<h6>', '<h1>', '<head>'],
          correctAnswer: 2,
        },
      ],
    },
  },
  '2': {
    id: '2',
    title: 'CSS Styling',
    videoUrl: 'https://www.youtube.com/embed/1Rs2ND1ryYc',
    description: 'Master CSS styling techniques including selectors, properties, and layout.',
    content: `
# CSS Styling

CSS (Cascading Style Sheets) describes how HTML elements are to be displayed on screen.

## Selectors
* **Element Selector**: \`p { color: red; }\`
* **Class Selector**: \`.center { text-align: center; }\`
* **ID Selector**: \`#header { background: blue; }\`
    `,
    courseId: '1',
    courseTitle: 'Introduction to Web Development',
    nextLessonId: '3',
    previousLessonId: '1',
    quiz: {
      questions: [
        {
          id: 'q4',
          question: 'Which property is used to change the text color?',
          options: ['font-color', 'text-color', 'color', 'text-style'],
          correctAnswer: 2,
        },
        {
          id: 'q5',
          question: 'How do you add a background color?',
          options: ['background-color', 'bgcolor', 'color-background', 'background'],
          correctAnswer: 0,
        },
      ],
    },
  },
  '3': {
    id: '3',
    title: 'JavaScript Fundamentals',
    videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
    description: 'Introduction to JavaScript programming. Learn variables, functions, and control structures.',
    content: `
# JavaScript Fundamentals

JavaScript is the programming language of the Web.

## Variables
\`\`\`javascript
let x = 5;
const y = 10;
var z = x + y;
\`\`\`
    `,
    courseId: '1',
    courseTitle: 'Introduction to Web Development',
    nextLessonId: '4',
    previousLessonId: '2',
    quiz: {
      questions: [
        {
          id: 'q6',
          question: 'Which of the following is a valid JavaScript variable name?',
          options: ['2variable', '_variable', 'var', 'variable-name'],
          correctAnswer: 1,
        },
      ],
    },
  },
  // Generic fillers for other IDs so the app doesn't crash
  '4': getGenericLesson('4'),
  '5': getGenericLesson('5'),
  '6': getGenericLesson('6'),
  '7': getGenericLesson('7'),
  '8': getGenericLesson('8'),
  '9': getGenericLesson('9'),
  '10': getGenericLesson('10'),
  '11': getGenericLesson('11'),
};

export const mockDashboard = {
  courses: mockCourses,
  progress: 62,
  upcomingLessons: [
    { id: '3', title: 'JavaScript Fundamentals', course: 'Introduction to Web Development', date: '2025-01-15' },
    { id: '6', title: 'Context API Deep Dive', course: 'Advanced React Patterns', date: '2025-01-16' },
  ],
  recentActivity: [
    { description: 'Completed lesson: CSS Styling', timestamp: '2 hours ago' },
    { description: 'Started course: Advanced React Patterns', timestamp: '1 day ago' },
    { description: 'Completed quiz: HTML Basics', timestamp: '2 days ago' },
  ],
};

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Ahmed Ali',
    email: 'ahmed.ali@example.com',
    progress: 75,
    attendance: 92,
    averageGrade: 88.5,
    coursesEnrolled: 3,
  },
  {
    id: '2',
    name: 'Fatima Hassan',
    email: 'fatima.hassan@example.com',
    progress: 90,
    attendance: 98,
    averageGrade: 94.2,
    coursesEnrolled: 4,
  },
  {
    id: '3',
    name: 'Mohammed Ibrahim',
    email: 'mohammed.ibrahim@example.com',
    progress: 65,
    attendance: 85,
    averageGrade: 78.3,
    coursesEnrolled: 2,
  },
  {
    id: '4',
    name: 'Sara Ahmed',
    email: 'sara.ahmed@example.com',
    progress: 88,
    attendance: 95,
    averageGrade: 91.7,
    coursesEnrolled: 5,
  },
];

export const mockStudentDetail = {
  id: '1',
  name: 'Ahmed Ali',
  email: 'ahmed.ali@example.com',
  performance: [
    { date: '2025-01-01', score: 75 },
    { date: '2025-01-08', score: 82 },
    { date: '2025-01-15', score: 88 },
    { date: '2025-01-22', score: 90 },
    { date: '2025-01-29', score: 92 },
  ],
  attendance: [
    { date: '2025-01-15', present: true },
    { date: '2025-01-16', present: true },
    { date: '2025-01-17', present: false },
    { date: '2025-01-18', present: true },
    { date: '2025-01-19', present: true },
  ],
  grades: [
    { course: 'Introduction to Web Development', grade: 90 },
    { course: 'Advanced React Patterns', grade: 85 },
    { course: 'Data Science with Python', grade: 92 },
  ],
  notes: [
    { id: '1', content: 'Excellent progress in web development course. Shows strong understanding of concepts.', timestamp: '2025-01-20' },
    { id: '2', content: 'Needs more practice with React hooks. Recommend additional exercises.', timestamp: '2025-01-18' },
  ],
};

export const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'student',
};