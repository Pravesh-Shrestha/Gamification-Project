# Academia.io: A Gamified Digital Learning Platform with Adaptive AI Assistance and Analytics

Academia.io is a multi-tenant digital learning application designed as a thesis research project. The platform integrates structural gamification (experience points, streaks, badges, quests, and cosmetic customization) with a focused student learning experience, a teacher monitoring classroom dashboard, and administrative analytic panels displaying system-wide data patterns. 

The application utilizes a monorepo structure containing a decoupled TypeScript Express backend server using Prisma ORM and a Vite-based React client styled with modern Tailwind CSS.

---

## Key Core Features

### 1. Multi-Tenant Academic Structure
*   **Schools & Classes**: Distinct tenant database boundaries for multiple schools, each containing dynamic grade classes (Grade 1 to 10).
*   **Role-Based Dashboards**: Tailored work environments for **Students**, **Teachers**, **Admins**, and **Super-Admins**.

### 2. Gamified Student Workspace
*   **Learn Hub**: Interactive modules grouped by subject chapters (Math, Science, English) with lesson timelines.
*   **Lesson Player**: In-lesson slides followed by adaptive multiple-choice quizzes that reward Experience Points (XP).
*   **Focus Mode**: A built-in distraction-free Pomodoro study timer with configurable soundscapes.
*   **Achievements & Shop**: A user profile showcasing earned badges, current login streaks, and a shop to unlock cosmetic avatar frames using earned XP.

### 3. Teacher Control & Analytics Workspace
*   **Class Metrics**: Detailed reports tracking completion rates, average quiz scores, active streaks, and overall class participation.
*   **Content Management**: Interface for teachers to upload and link custom reading materials (PDFs, images) to specific modules.

### 4. Adaptive AI Tutor & ML Log Logger
*   **Google Gemini Chatbot**: An on-demand tutoring assistant context-aware of the student's learning state.
*   **Interaction Logging**: High-fidelity session trackers logging user quiz attempts, lesson page views, focus minutes, and login frequencies, preparing clean dataset outputs for offline Machine Learning (ML) research.

### 5. Research Analytics Dashboard (Admin View)
*   **Impact Panels**: Data visualizations tracking the relationship between user engagement (XP, streaks) and quiz outcomes.
*   **Intervention Cockpit**: Tools to inspect classroom distributions, score frequencies, and configure custom notification alerts for students requiring learning support.

---

## Technology Stack

### Backend API
*   **Runtime**: Node.js
*   **Language**: TypeScript
*   **Framework**: Express.js
*   **Database ORM**: Prisma ORM (supports PostgreSQL / SQLite)
*   **Auth**: JSON Web Tokens (JWT) & Bcryptjs password hashing
*   **AI Integration**: Google Generative AI (@google/generative-ai)

### Frontend Client
*   **Tooling**: Vite
*   **Library**: React 18 & TypeScript
*   **Styling**: Tailwind CSS & CSS custom variables
*   **Icons**: Lucide React
*   **Animations**: Framer Motion

---

## Project Structure

```text
Gamification-Project/
├── backend/                  # Express Gateway API
│   ├── prisma/               # Prisma Schema & local SQLite DB (dev.db)
│   ├── src/
│   │   ├── config/           # App settings and environment checking
│   │   ├── controllers/      # Route controllers handling business actions
│   │   ├── middleware/       # JWT verification & payload schemas
│   │   ├── routes/           # REST API endpoint definitions
│   │   ├── services/         # Database queries (Auth, AI, Analytics)
│   │   ├── types/            # TypeScript helper interfaces
│   │   └── index.ts          # Main Express gateway startup
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Vite SPA Client
│   ├── assets/               # Brand logos and static images
│   ├── css/                  # Styling files and design tokens
│   ├── src/
│   │   ├── components/       # Shared UI buttons, dialogs, and panels
│   │   ├── context/          # Global User Authentication provider
│   │   ├── features/         # Features split into admin, auth, student, teacher
│   │   ├── hooks/            # Custom React hooks (useDashboard, useChatbot)
│   │   ├── logic/            # Math math engines and game loop scoring calculations
│   │   ├── services/         # API fetching handlers
│   │   ├── App.tsx           # Role-based router configuration
│   │   └── main.tsx          # React application entry point
│   ├── package.json
│   └── vite.config.ts
│
├── package.json              # Monorepo configuration
└── README.md                 # Project documentation
```

---

## Installation & Setup

### Prerequisites
*   Node.js (version 18 or above recommended)
*   npm or pnpm package manager

### 1. Clone the Project
Navigate into your local directory containing the codebase:
```bash
cd Gamification-Project
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` folder following the structure of `backend/.env.example`:
```text
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret_token_key_here"
GEMINI_API_KEY="your_google_gemini_api_key"
```

### 3. Install Monorepo Dependencies
From the root directory, install all packages for both the backend and frontend:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 4. Initialize the Database
Configure Prisma client mapping and seed initial academic content (subjects, chapters, lessons, questions, and master badges):
```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
cd ..
```

### 5. Running the Application Locally
You can run both the Express backend and Vite frontend concurrently using the root package runner:
```bash
# From the root folder:
npm run dev
```

*   **Backend Server**: Available at `http://localhost:5000`
*   **Frontend Client**: Available at `http://localhost:5173` (or `http://localhost:3000` based on terminal output)

---

## Credentials for Development Testing
After running `npm run db:seed` in the backend, you can log in with the following default accounts to inspect different roles:

| Role | Username / Email | Password |
| --- | --- | --- |
| **Super Admin** | `superadmin@academia.io` | `admin123` |
| **School Admin** | `admin@school1.edu` | `admin123` |
| **Teacher** | `teacher@school1.edu` | `teacher123` |
| **Student** | `student@school1.edu` | `student123` |