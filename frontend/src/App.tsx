import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider, useAuth } from "./context/AuthContext";

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
    return (
      <div style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#FEFCF8",
      }}>
        <div style={{ textAlign: "center", animation: "fadeInUp 0.4s ease-out both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "var(--gradient-brand)",
              display: "grid",
              placeItems: "center",
              color: "white",
              fontWeight: 900,
              fontSize: 24,
              fontFamily: "var(--font-display)",
              boxShadow: "0 3px 12px rgba(108, 60, 225, 0.4)"
            }}>a</div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, letterSpacing: "-.01em" }}>academia.io</span>
          </div>
          <div style={{
            width: 36, height: 36, margin: "0 auto",
            border: "3px solid #ECE6DC",
            borderTopColor: "#6C3CE1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <div style={{
            marginTop: 14, fontSize: 13, fontWeight: 700,
            color: "#908579",
          }}>
            Loading your workspace...
          </div>
        </div>
      </div>
    );
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
    streakDays: user.streakDays || [],
    lessonsCompleted: [],
    perfectQuizzes: 0,
    focusMinutes: 0,
    treesGrown: 0,
    badges: [],
    cosmetics: user.cosmetics || [],
    questsState: user.questsState || null,
    todayXP: {},
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
