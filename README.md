# Academia.io: A Gamified Digital Learning Platform

## Project Overview

Academia.io is a multi-tenant digital learning application developed as a thesis research project. The primary purpose of this platform is to investigate the effects of structural gamification on student engagement and academic performance. The system integrates game mechanics, such as experience points, streaks, badges, quests, and cosmetic customization, directly into a formal learning environment. Additionally, it provides teachers with a monitoring dashboard and administrators with analytics panels to observe system wide data trends.

The application is built on a monorepo structure, utilizing a decoupled TypeScript Express backend, a Vite React client, and a Python based analytics engine designed to process and model learning patterns.

## Research Objectives

1.  **Gamification Efficacy**: To evaluate how structural game elements influence user retention and session length.
2.  **Predictive Analytics**: To utilize student interaction logs to predict academic outcomes and identify disengagement early.
3.  **Adaptive Learning**: To measure the effectiveness of context aware tutoring interventions on quiz completion rates.

## Core Modules

### 1. Gamified Learning Environment (Student Interface)
*   **Structured Curriculum**: Interactive modules categorized by subject chapters, featuring sequential lesson timelines.
*   **Assessment and Reward System**: Lesson slides followed by multiple choice quizzes that distribute Experience Points (XP) based on accuracy.
*   **Focus Management**: A study timer with customizable soundscapes to measure dedicated study intervals.
*   **Progression Tracking**: A user profile displaying earned badges, login streaks, and a virtual storefront to unlock cosmetic avatar frames using earned currency.

### 2. Pedagogical Control Center (Teacher Interface)
*   **Performance Metrics**: Automated reports tracking completion rates, average assessment scores, active streaks, and overall class participation.
*   **Resource Management**: An interface permitting educators to upload and associate supplemental reading materials with specific learning modules.

### 3. Data Analytics and Machine Learning Engine
*   **Event Logging**: High resolution session trackers that log user quiz attempts, lesson page views, focus minutes, and login frequencies for offline research analysis.
*   **Impact Visualization**: Data panels tracking the statistical relationship between user engagement metrics and quiz outcomes.
*   **Intervention Tools**: Interfaces to inspect classroom distributions, score frequencies, and configure custom notification alerts for students requiring learning support.
*   **Predictive Services**: Background processes that analyze student interaction data to estimate engagement levels and model potential learning outcomes.

## System Architecture

### Backend API Layer
*   **Runtime Environment**: Node.js
*   **Language**: TypeScript
*   **Framework**: Express.js
*   **Database Management**: Prisma ORM (supports PostgreSQL / SQLite)
*   **Authentication**: JSON Web Tokens (JWT) and Bcryptjs
*   **Generative AI Integration**: Google Generative AI for contextual tutoring

### Machine Learning Layer
*   **Environment**: Python 3
*   **Function**: Processes student event logs and generates predictive models for engagement and performance.

### Frontend Client Layer
*   **Build Tool**: Vite
*   **Library**: React 18 and TypeScript
*   **Styling**: Tailwind CSS and custom variables
*   **Icons**: Lucide React
*   **Animations**: Framer Motion

## Project Structure

```text
Gamification-Project/
├── backend/                  # Express Gateway API
│   ├── ml_engine/            # Python scripts for data analysis and ML models
│   ├── prisma/               # Prisma Schema and local database
│   ├── src/                  # API source code (controllers, routes, services)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Vite SPA Client
│   ├── assets/               # Brand logos and static images
│   ├── css/                  # Styling files and design tokens
│   ├── src/                  # React application code (components, features, hooks)
│   ├── package.json
│   └── vite.config.ts
│
├── package.json              # Monorepo configuration
└── README.md                 # Project documentation
```

## Installation and Setup

### Prerequisites
*   Node.js (version 18 or above recommended)
*   Python (version 3.8 or above recommended for the ML engine)
*   npm or pnpm package manager

### 1. Clone the Repository
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

### 4. Setup Python ML Engine (Optional)
To run the analytics engine locally, install the required Python dependencies:
```bash
cd backend/ml_engine
pip install -r requirements.txt
cd ../..
```

### 5. Initialize the Database
Configure the Prisma client mapping and seed the initial academic content:
```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
cd ..
```

### 6. Run the Application Locally
You can run both the Express backend and Vite frontend concurrently using the root package runner:
```bash
# From the root folder:
npm run dev
```

*   **Backend Server**: Available at `http://localhost:5000`
*   **Frontend Client**: Available at `http://localhost:5173`

## Credentials for Development Testing
After running `npm run db:seed` in the backend, you can log in with the following default accounts to inspect different roles:

| Role | Username / Email | Password |
| --- | --- | --- |
| **Super Admin** | `superadmin@academia.io` | `admin123` |
| **School Admin** | `admin@school1.edu` | `admin123` |
| **Teacher** | `teacher@school1.edu` | `teacher123` |
| **Student** | `student@school1.edu` | `student123` |

## Assets Note

The background video (`banner.mp4`) used in the landing page and login screen is not included in this repository due to file size limits. Please download it from this Google Drive link:
https://drive.google.com/file/d/1Og9sk1Ox-DlT49RVYbIJAdnrx6Glfcjj/view?usp=sharing

Once downloaded, place the file in the `frontend/assets/` directory as `banner.mp4`.
