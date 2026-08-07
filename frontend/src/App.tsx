import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./features/auth/Landing";
import CodedexLoadingScreen from "./components/shared/LoadingScreen";

const Login = (props: any) => React.createElement((window as any).Login || "div", props);
const StudentApp = (props: any) => React.createElement((window as any).StudentApp || "div", props);
const TeacherApp = (props: any) => React.createElement((window as any).TeacherApp || "div", props);
const AdminApp = (props: any) => React.createElement((window as any).AdminApp || "div", props);
const SuperAdminApp = (props: any) => React.createElement((window as any).SuperAdminApp || "div", props);

function AppShell() {
  const { user, login, logout, loading } = useAuth();

  React.useEffect(() => {
    if (user) {
      import("./services/api").then(({ curriculum }) => {
        curriculum.getAll()
          .then((data) => {
            const formatted = data.map((subj) => ({
              id: subj.id,
              name: subj.name,
              color: subj.color,
              accent: subj.color + "1A",
              icon: subj.icon,
              blurb: subj.blurb,
              chapters: (subj.chapters || []).map((ch) => ({
                id: ch.id,
                title: ch.title,
                order: ch.order,
                lessons: (ch.lessons || []).map((le) => {
                  let slides = [];
                  let quiz = [];
                  try { slides = typeof le.slides === "string" ? JSON.parse(le.slides) : (le.slides || []); } catch {}
                  try { quiz = typeof le.quiz === "string" ? JSON.parse(le.quiz) : (le.quiz || []); } catch {}
                  return {
                    id: le.id,
                    title: le.title,
                    mins: le.mins,
                    order: le.order,
                    slides,
                    quiz,
                  };
                }),
              })),
            }));
            window.CURRICULUM = formatted;
            window.dispatchEvent(new Event("curriculum_loaded"));
          })
          .catch((err) => console.error("Failed to load curriculum:", err));
      });
    }
  }, [user]);

  const [showLogin, setShowLogin] = React.useState(false);

  if (loading) {
    return <CodedexLoadingScreen message="Loading your workspace... ✦" />;
  }

  if (!user && !showLogin) {
    return <Landing onGetStarted={() => setShowLogin(true)} />;
  }

  if (!user && showLogin) {
    return (
      <Login
        onLogin={(email, password) => login(email, password)}
        onBack={() => setShowLogin(false)}
      />
    );
  }

  // Backend stores streakDays / todayXp / questsState / cosmetics as JSON
  // strings. Parse them back into arrays/objects so the engine (which calls
  // .push/.includes on streakDays and indexes questsState[today]) and the
  // gamification UI don't crash or show stale progress.
  const parseJson = (val, fallback) => {
    if (val == null || val === "") return fallback;
    if (typeof val !== "string") return val;
    try { return JSON.parse(val); } catch { return fallback; }
  };

  const appUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || "panda",
    schoolId: user.schoolId,
    grade: user.grade,
    xp: user.xp || 0,
    streak: user.streak || 0,
    streakDays: parseJson(user.streakDays, []),
    lastActiveDay: user.lastActiveDate || user.lastActiveDay || null,
    lessonsCompleted: [],
    perfectQuizzes: 0,
    focusMinutes: 0,
    treesGrown: 0,
    badges: [],
    cosmetics: parseJson(user.cosmetics, []),
    questsState: parseJson(user.questsState, null),
    todayXP: parseJson(user.todayXp, {}),
    todayXp: user.todayXp || 0,
    dailyGoal: 50,
  };

  if (user.role === "super_admin") return <SuperAdminApp user={appUser} onLogout={logout} />;
  if (user.role === "admin") return <AdminApp user={appUser} onLogout={logout} />;
  if (user.role === "teacher") return <TeacherApp user={appUser} onLogout={logout} />;
  if (user.role === "student") return <StudentApp user={appUser} onLogout={logout} />;
  return <div className="app-shell"><h1>Unknown role.</h1></div>;
}

function Root() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
