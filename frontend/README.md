# Learning Platform - React Application

A modern, responsive online learning platform with bilingual (English/Arabic) support for Students, Parents, and Teachers.

## Features

- 🔐 **Authentication**: Login and registration with role-based access
- 📊 **Dashboard**: Student dashboard with progress tracking and course overview
- 📚 **Courses & Lessons**: Course browsing, lesson viewing with video player
- 🎯 **Quizzes**: Interactive quizzes with scoring
- 🤖 **AI Study Assistant**: Chat-based study assistant integrated in lessons
- 📈 **Insights**: Performance analytics for parents and teachers with charts
- 🌓 **Dark/Light Theme**: Full theme support with smooth transitions
- 🌍 **Bilingual Support**: English and Arabic with RTL layout support
- ♿ **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- 📱 **Responsive Design**: Mobile-first design that works on all devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for routing
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Player** for video playback
- **Axios** for API calls
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open your browser to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Card, etc.)
│   └── layout/         # Layout components (Navbar, Layout)
├── contexts/           # React contexts (Theme, Language)
├── pages/              # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── CourseDetail.tsx
│   ├── Lesson.tsx
│   └── Insights.tsx
├── styles/             # Global styles
│   └── globals.css     # CSS variables and global styles
├── utils/              # Utility functions
│   ├── api.ts         # API client
│   ├── theme.ts       # Theme management
│   └── language.ts    # Language/translation management
├── App.tsx            # Main app component with routing
└── main.tsx           # Entry point
```

## API Endpoints

The application is designed to work with the following API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Session Management
- `POST /api/session/start` - Start learning session
- `POST /api/session/end` - End learning session

### Dashboard
- `GET /api/dashboard` - Get dashboard data

### Profile
- `POST /api/profile/goal` - Set learning goal
- `POST /api/profile/preference` - Set user preference

### Courses & Lessons
- `GET /api/courses/:id` - Get course details
- `GET /api/lessons/:id` - Get lesson details

### Chat & Quiz
- `POST /api/chat` - Send chat message to AI assistant
- `POST /api/quiz/submit` - Submit quiz answers
- `POST /api/quiz/request` - Request quiz

### Logging & Feedback
- `POST /api/log/lesson` - Log lesson activity
- `POST /api/feedback/lesson` - Submit lesson feedback
- `POST /api/feedback/chat` - Submit chat feedback

### Insights
- `GET /api/insights/students` - Get all students (for teachers/parents)
- `GET /api/insights/student/:studentId` - Get student details
- `GET /api/notes/student/:studentId` - Get student notes
- `POST /api/insights/comment` - Add comment on student

### Notifications
- `POST /api/notifications/settings` - Update notification settings

## Design System

All colors, spacing, and design tokens are controlled from `src/styles/globals.css` using CSS variables. This ensures consistent theming across light and dark modes.

### Color Variables
- Primary colors (blue)
- Secondary colors (violet)
- Accent colors (pink)
- Status colors (success, warning, error)
- Background colors
- Text colors
- Border colors

### Theme Support
The application supports both light and dark themes. Users can toggle between themes using the theme toggle in the navigation bar.

### RTL Support
Full right-to-left (RTL) support for Arabic language. The layout automatically adjusts when Arabic is selected.

## Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist/` directory.

## Design Documentation

See `DESIGN.md` for detailed wireframes, design specifications, and UI/UX guidelines.

## Accessibility

The application follows WCAG 2.1 AA guidelines:
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels
- Focus management
- Color contrast compliance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

