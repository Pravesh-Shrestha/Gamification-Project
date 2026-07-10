// ── API Layer (must come first) ─────────────────────────────
import "./services/api";

// ── Logic Engine (client-side fallbacks) ────────────────────
import "./logic/index";

// ── Auth Context ────────────────────────────────────────────
export { AuthProvider, useAuth } from "./context/AuthContext";

// ── UI Components (Feature & Shared Organized) ─────────────
import "./components/shared/TweaksPanel";
import "./components/shared/Components";
import "./components/shared/RoleShell";
import "./components/shared/Notifications";

import "./features/auth/Onboarding";
import "./features/auth/Landing";
import "./features/auth/Login";

import "./features/student/Dashboard";
import "./features/student/LearnHub";
import "./features/student/LessonPlayer";
import "./features/student/FocusMode";
import "./features/student/Profile";
import "./features/student/StudentHome";
import "./features/student/StudentApp";

import "./features/teacher/TeacherApp";

import "./features/admin/AdminApp";
import "./features/admin/SuperAdminApp";

import "./features/analytics/Analytics";
import "./features/analytics/StudentStats";

import "./features/chatbot/ChatBot";

import "./App";
