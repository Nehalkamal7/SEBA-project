# Learning Platform - UI/UX Design Documentation

## Overview
This document provides wireframes, design specifications, and UI/UX guidelines for the online learning platform supporting Students, Parents, and Teachers with bilingual (English/Arabic) support.

## Design System

### Color Palette
All colors are controlled from `src/styles/globals.css` using CSS variables:

**Light Theme:**
- Primary: Blue (#3B82F6)
- Secondary: Violet (#8B5CF6)
- Accent: Pink (#EC4899)
- Success: Green (#22C55E)
- Warning: Yellow (#EAB308)
- Error: Red (#EF4444)
- Background: White/Gray scale
- Text: Gray-900 to Gray-400

**Dark Theme:**
- Primary: Blue-400 (#60A5FA)
- Secondary: Violet-400 (#A78BFA)
- Accent: Pink-400 (#F472B6)
- Success: Green-400 (#4ADE80)
- Warning: Yellow-400 (#FACC21)
- Error: Red-400 (#F87171)
- Background: Gray-900 to Gray-700
- Text: Gray-50 to Gray-400

### Typography
- Font Family: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', etc.)
- Headings: Bold, varying sizes (text-3xl, text-2xl, text-xl)
- Body: Regular weight, text-base
- Small text: text-sm

### Spacing
- Consistent spacing scale: xs (0.25rem), sm (0.5rem), md (1rem), lg (1.5rem), xl (2rem), 2xl (3rem)

### Border Radius
- Small: 0.375rem
- Medium: 0.5rem
- Large: 0.75rem
- Extra Large: 1rem
- Full: 9999px

## Wireframes

### 1. Login Page (`/login`)
```
┌─────────────────────────────────────┐
│                                     │
│         [Logo Icon]                 │
│         Login                       │
│    Don't have an account? Register  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Email                        │  │
│  │ [________________________]    │  │
│  │                              │  │
│  │ Password                     │  │
│  │ [________________________]    │  │
│  │                              │  │
│  │ [✓] Remember Me  Forgot?     │  │
│  │                              │  │
│  │    [    Login Button    ]    │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Centered card layout
- Email and password inputs
- Remember me checkbox
- Forgot password link
- Link to register page
- Theme toggle (light/dark)
- Language toggle (EN/AR)

### 2. Register Page (`/register`)
```
┌─────────────────────────────────────┐
│                                     │
│         [Logo Icon]                 │
│         Create Account              │
│    Already have an account? Login   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Name                         │  │
│  │ [________________________]    │  │
│  │                              │  │
│  │ Email                        │  │
│  │ [________________________]    │  │
│  │                              │  │
│  │ Role: [Student ▼]            │  │
│  │                              │  │
│  │ Password                     │  │
│  │ [________________________]    │  │
│  │                              │  │
│  │ Confirm Password             │  │
│  │ [________________________]    │  │
│  │                              │  │
│  │    [ Create Account Button ] │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 3. Dashboard (`/dashboard`)
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Learning Platform    Dashboard Courses Insights  │
│                                    [🌙] [🌐] [Logout]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Dashboard                                              │
│  Continue Learning                                      │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ My       │  │ Progress │  │ Upcoming │            │
│  │ Courses  │  │   75%    │  │ Lessons  │            │
│  │    5     │  │          │  │    3     │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
│  Continue Learning                    [View All →]     │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ [Image]  │  │ [Image]  │  │ [Image]  │            │
│  │ Course 1 │  │ Course 2 │  │ Course 3 │            │
│  │ Teacher  │  │ Teacher  │  │ Teacher  │            │
│  │ [====]75%│  │ [==]50%  │  │ [===]60% │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
│  Recent Activity                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │ ▶ Completed Lesson 1                            │  │
│  │ ▶ Started Course 2                              │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4. Course Detail (`/courses/:id`)
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Learning Platform    Dashboard Courses Insights  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  Course Title                        │
│  │              │  Description text...                 │
│  │   [Image]    │  👤 Instructor                       │
│  │              │  ⏱ Duration                          │
│  │              │  👥 Enrolled                          │
│  └──────────────┘  Progress: [==========] 75%          │
│                     [▶ Continue Course]                 │
│                                                         │
│  Lessons                                                │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 1  Lesson 1 Title                    ✓ 15 min │  │
│  │ 2  Lesson 2 Title                    20 min   │  │
│  │ 3  Lesson 3 Title                    25 min   │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 5. Lesson Page (`/lessons/:id`)
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Learning Platform    Dashboard Courses Insights  │
├─────────────────────────────────────────────────────────┤
│ ← Course Title                                          │
│ Lesson Title                                            │
│                                                         │
│ [Video] [Quiz] [Study Assistant]                        │
│                                                         │
│ ┌──────────────────────────┐  ┌──────────────────┐    │
│ │                          │  │ Lesson Navigation│    │
│ │                          │  │                  │    │
│ │      [Video Player]      │  │ ← Previous      │    │
│ │                          │  │ → Next          │    │
│ │                          │  └──────────────────┘    │
│ │ Description text...      │                          │
│ │                          │                          │
│ │ [✓ Complete Lesson]      │                          │
│ └──────────────────────────┘                          │
│                                                         │
│ When Quiz tab active:                                   │
│ ┌──────────────────────────┐                          │
│ │ Quiz                     │                          │
│ │ 1. Question text?        │                          │
│ │ ○ Option A               │                          │
│ │ ○ Option B               │                          │
│ │ ○ Option C               │                          │
│ │                          │                          │
│ │ [Submit Quiz]            │                          │
│ └──────────────────────────┘                          │
│                                                         │
│ When Chat tab active:                                   │
│ ┌──────────────────────────┐                          │
│ │ Study Assistant          │                          │
│ │                          │                          │
│ │        [User message]    │                          │
│ │ [Assistant response]     │                          │
│ │        [👍] [👎]         │                          │
│ │                          │                          │
│ │ [Ask a question...] [→]  │                          │
│ └──────────────────────────┘                          │
└─────────────────────────────────────────────────────────┘
```

### 6. Insights Page (`/insights`)
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Learning Platform    Dashboard Courses Insights  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Insights                                               │
│  Students Performance                                   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Name    Progress Attendance Grade Courses Action │  │
│  │ Student1 [==]50%   85%      85     3    [View] │  │
│  │ Student2 [===]60%  90%      88     4    [View] │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  When viewing student detail:                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Average  │  │Attendance│  │ Courses  │            │
│  │ Grade    │  │   85%    │  │    3     │            │
│  │   85     │  │          │  │          │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Performance Chart (Line Chart)                  │  │
│  │ [Line graph showing scores over time]          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Grades Chart (Bar Chart)                       │  │
│  │ [Bar chart showing grades per course]          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Comments                                               │
│  ┌─────────────────────────────────────────────────┐  │
│  │ [Add comment input] [Add Comment]               │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Notes                                                  │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Note 1 - Date                                  │  │
│  │ Note 2 - Date                                  │  │
│  │ [Add note input] [Add Note]                     │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Mobile Responsive Design

### Breakpoints
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md)
- Desktop: > 1024px (lg)

### Mobile Adaptations
1. **Navigation**: Hamburger menu on mobile, full menu on desktop
2. **Grid Layouts**: Single column on mobile, multi-column on desktop
3. **Cards**: Full width on mobile, constrained on desktop
4. **Tables**: Horizontal scroll on mobile, full table on desktop
5. **Video Player**: Full width responsive
6. **Charts**: Responsive container, adjusts to screen size

## RTL (Right-to-Left) Support

### Arabic Layout
- All text aligns right in RTL mode
- Icons and buttons mirror positions
- Navigation menu flips
- Form inputs align right
- Charts and tables adapt to RTL

### Implementation
- `dir="rtl"` attribute on HTML element
- CSS logical properties where applicable
- Flexbox with `flex-row-reverse` for RTL
- Text alignment: `text-right` in RTL mode

## Component States

### Loading States
- Full-screen loader for page loads
- Inline spinners for button actions
- Skeleton screens for content loading

### Error States
- Alert banners with error messages
- Inline error messages for forms
- Retry buttons where applicable

### Success States
- Success alerts
- Confirmation messages
- Visual feedback (checkmarks, animations)

## Accessibility Features

1. **Keyboard Navigation**
   - Tab order follows visual flow
   - Focus indicators on all interactive elements
   - Escape key closes modals/dropdowns
   - Enter/Space activates buttons

2. **Screen Readers**
   - ARIA labels on icons and buttons
   - Semantic HTML (nav, main, article, etc.)
   - Alt text for images
   - Role attributes where needed

3. **Color Contrast**
   - WCAG AA compliant contrast ratios
   - Not relying solely on color for information

4. **Focus Management**
   - Visible focus indicators
   - Focus trap in modals
   - Focus restoration after actions

## API Integration Mapping

### Authentication
- `POST /api/auth/login` → Login form submission
- `POST /api/auth/register` → Register form submission
- `POST /api/auth/logout` → Logout button click

### Session Management
- `POST /api/session/start` → Lesson page load
- `POST /api/session/end` → Lesson page unload

### Dashboard
- `GET /api/dashboard` → Dashboard page load

### Profile
- `POST /api/profile/goal` → Goals settings
- `POST /api/profile/preference` → Preferences settings

### Courses & Lessons
- `GET /api/courses/:id` → Course detail page
- `GET /api/lessons/:id` → Lesson page load

### Chat & Quiz
- `POST /api/chat` → Send chat message
- `POST /api/quiz/submit` → Submit quiz answers
- `POST /api/quiz/request` → Request quiz (if needed)

### Logging & Feedback
- `POST /api/log/lesson` → Lesson completion
- `POST /api/feedback/lesson` → Lesson feedback
- `POST /api/feedback/chat` → Chat message feedback

### Insights
- `GET /api/insights/students` → Insights list page
- `GET /api/insights/student/:studentId` → Student detail page
- `GET /api/notes/student/:studentId` → Student notes
- `POST /api/insights/comment` → Add comment

### Notifications
- `POST /api/notifications/settings` → Notification settings

## Interactive Elements

### Buttons
- Primary: Blue background, white text
- Secondary: Violet background, white text
- Outline: Transparent with border
- Ghost: Transparent, text only
- Danger: Red background for destructive actions

### Inputs
- Rounded borders
- Focus ring on focus
- Error state with red border
- Placeholder text

### Cards
- White/dark background
- Rounded corners
- Shadow for elevation
- Hover effects on interactive cards

### Charts
- Responsive containers
- Interactive tooltips
- Legend for multiple series
- Accessible color schemes

## Animation & Transitions

- Smooth transitions on theme/language change (200ms)
- Hover effects on interactive elements
- Loading spinner animations
- Page transition animations (optional)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- RTL support in all supported browsers

