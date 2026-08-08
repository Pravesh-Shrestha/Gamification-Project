import React from "react";
import { motion } from "framer-motion";
import { Target, Trophy, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

function Login({ onLogin, onBack }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) { setError("Email and password are required"); return; }
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    const CodedexLoadingScreen = (window as any).CodedexLoadingScreen;
    if (CodedexLoadingScreen) {
      return <CodedexLoadingScreen message="Authenticating & entering your adventure..." />;
    }
  }

  return (
    <div className="login-wrapper">
      {/* Looping Background Video */}
      <div className="login-video-bg-wrap">
        <video
          src="https://drive.google.com/uc?export=download&id=1Og9sk1Ox-DlT49RVYbIJAdnrx6Glfcjj"
          autoPlay
          loop
          muted
          playsInline
          className="login-video-bg"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <div className="login-video-overlay" />
      </div>

      {/* Scattered background shapes */}
      <LoginShapes />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="login-card"
        style={{ background: "#131728", border: "1px solid #22273E", boxShadow: "0 20px 50px rgba(0,0,0,0.65)" }}
      >
        {/* ── Left: Branding Panel ─────────────────────── */}
        <div className="login-brand-panel" style={{ background: "linear-gradient(135deg, #1C0A35 0%, #35136B 50%, #15092B 100%)" }}>
          <LoginPanelShapes />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 36, display: "flex", alignItems: "center", gap: 10 }}>
              <div className="font-pixel" style={{ width: 36, height: 36, borderRadius: 8, background: "#FFC700", color: "#0B0D17", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 18 }}>a</div>
              <span className="font-pixel-sans" style={{ color: "#FFF", fontWeight: 800, fontSize: 22 }}>academia.io</span>
            </div>
            <h1 className="font-pixel-sans" style={{ fontSize: 32, lineHeight: 1.15, fontWeight: 900, marginBottom: 12, color: "#FAF7F2" }}>
              Unlock Your{" "}
              <span style={{ color: "#FFC700", textShadow: "0 0 12px rgba(255,199,0,0.4)" }}>
                Adventure.
              </span>
            </h1>
            <p style={{ color: "rgba(250,247,242,0.75)", fontSize: 14, fontWeight: 600, maxWidth: 340, lineHeight: 1.6, marginBottom: 0 }}>
              The interactive workspace for gamified learning, progress tracking, and achievement unlocking.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1, marginTop: 28 }}>
            <motion.div whileHover={{ scale: 1.02 }} className="login-feature-pill" style={{ background: "rgba(255, 199, 0, 0.1)", border: "1px solid rgba(255, 199, 0, 0.25)" }}>
              <div className="pill-icon" style={{ background: "rgba(255, 199, 0, 0.2)", color: "#FFC700" }}>
                <Target size={20} />
              </div>
              <div>
                <div className="pill-title font-pixel-sans" style={{ color: "#FFF" }}>Personalized Workspace Routing</div>
                <div className="pill-desc" style={{ color: "#9CA3AF" }}>Auto-redirects you to your student workspace, teacher panel, or admin console.</div>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="login-feature-pill" style={{ background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)" }}>
              <div className="pill-icon" style={{ background: "rgba(56, 189, 248, 0.2)", color: "#38BDF8" }}>
                <Trophy size={20} />
              </div>
              <div>
                <div className="pill-title font-pixel-sans" style={{ color: "#FFF" }}>Gamified Progress Tracking</div>
                <div className="pill-desc" style={{ color: "#9CA3AF" }}>Earn XP, unlock badges, and compete on leaderboards as you learn and grow.</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Right: Sign-in Form ──────────────────────── */}
        <div className="login-form-panel" style={{ background: "#131728" }}>
          <div>
            <h2 className="font-pixel-sans" style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: "#FFFFFF" }}>Welcome Back</h2>
            <p style={{ fontSize: 14, color: "#9CA3AF", fontWeight: 500, marginTop: 0, marginBottom: 28 }}>
              Sign in to continue exploring your personalized interactive learning space.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="login-input-group">
              <label style={{ color: "#D1D5DB" }}>Email Address</label>
              <span className="input-icon" style={{ color: "#9CA3AF" }}><Mail size={18} /></span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@school.edu"
                disabled={loading}
                autoComplete="email"
                style={{ background: "#1B2035", border: "1px solid #22273E", color: "#FFF" }}
              />
            </div>

            <div className="login-input-group" style={{ position: "relative" }}>
              <label style={{ color: "#D1D5DB" }}>Password</label>
              <span className="input-icon" style={{ color: "#9CA3AF" }}><Lock size={18} /></span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
                style={{ background: "#1B2035", border: "1px solid #22273E", color: "#FFF" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: 14, bottom: 12,
                  color: "#9CA3AF", fontWeight: 700,
                  background: "none", border: "none", cursor: "pointer",
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                style={{
                  color: "#EF4444", fontSize: 13, fontWeight: 700, marginBottom: 16,
                  padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className="pixel-btn"
              disabled={loading}
              style={{
                width: "100%",
                fontSize: 13,
                padding: "14px 24px",
                opacity: loading ? 0.6 : 1,
                justifyContent: "center"
              }}
            >
              {loading ? "Signing in..." : "Sign In 🎮"}
            </button>
          </form>

          {onBack && (
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <button
                onClick={onBack}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 700, color: "#FFC700",
                  background: "none", border: "none", cursor: "pointer",
                }}
              >
                <ArrowLeft size={16} /> Back to academia.io
              </button>
            </div>
          )}

          <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid #22273E" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", lineHeight: 1.65, textAlign: "center" }}>
              Accounts are created by school administrators. Contact your school admin for access. All data encrypted in transit and at rest.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Background shapes for the login wrapper ─────────────── */

function LoginShapes() {
  const items = [
    { type: "triangle", x: "6%", y: "15%", color: "#F59E0B", rotate: 20 },
    { type: "circle", x: "90%", y: "10%", color: "#EC4899", size: 10 },
    { type: "cross", x: "85%", y: "80%", color: "#A855F7" },
    { type: "star", x: "10%", y: "80%", color: "#10B981" },
    { type: "dot", x: "22%", y: "25%", color: "#3B82F6", size: 7 },
    { type: "triangle", x: "75%", y: "20%", color: "#EC4899", rotate: -30 },
    { type: "ring", x: "15%", y: "60%", color: "#F59E0B" },
    { type: "dot", x: "88%", y: "55%", color: "#10B981", size: 5 },
    { type: "star", x: "50%", y: "8%", color: "#F59E0B" },
    { type: "cross", x: "40%", y: "88%", color: "#3B82F6" },
    { type: "circle", x: "65%", y: "90%", color: "#A855F7", size: 8 },
    { type: "ring", x: "92%", y: "35%", color: "#EC4899" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {items.map((s, i) => {
        const base: React.CSSProperties = {
          position: "absolute", left: s.x, top: s.y,
          animation: `floatSlow ${3 + (i % 4)}s ${i * 0.3}s ease-in-out infinite`,
        };
        if (s.type === "triangle") return <div key={i} style={{ ...base, width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderBottom: `12px solid ${s.color}`, opacity: 0.3, transform: `rotate(${s.rotate || 0}deg)` }} />;
        if (s.type === "circle") return <div key={i} style={{ ...base, width: s.size || 10, height: s.size || 10, borderRadius: "50%", background: s.color, opacity: 0.25 }} />;
        if (s.type === "star") return <div key={i} style={{ ...base, fontSize: 13, color: s.color, opacity: 0.3 }}>✦</div>;
        if (s.type === "cross") return (
          <div key={i} style={{ ...base, width: 12, height: 12, opacity: 0.2 }}>
            <div style={{ position: "absolute", width: 2, height: "100%", left: "50%", transform: "translateX(-50%)", background: s.color }} />
            <div style={{ position: "absolute", height: 2, width: "100%", top: "50%", transform: "translateY(-50%)", background: s.color }} />
          </div>
        );
        if (s.type === "dot") return <div key={i} style={{ ...base, width: s.size || 6, height: s.size || 6, borderRadius: "50%", background: s.color, opacity: 0.2 }} />;
        if (s.type === "ring") return <div key={i} style={{ ...base, width: 14, height: 14, borderRadius: "50%", border: `2px solid ${s.color}`, opacity: 0.2 }} />;
        return null;
      })}
    </div>
  );
}

/* ── Shapes inside the dark brand panel ──────────────────── */

function LoginPanelShapes() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -50, top: -50, width: 200, height: 200, background: "radial-gradient(circle, rgba(236,72,153,0.2), transparent 70%)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", left: -30, bottom: -60, width: 180, height: 180, background: "radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", right: "30%", bottom: "20%", width: 120, height: 120, background: "radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)", borderRadius: "50%" }} />
      {/* Scattered decorative shapes on dark panel */}
      <div style={{ position: "absolute", left: "15%", top: "12%", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "10px solid rgba(245,158,11,0.25)", transform: "rotate(15deg)" }} />
      <div style={{ position: "absolute", right: "20%", top: "8%", fontSize: 10, color: "rgba(236,72,153,0.3)" }}>✦</div>
      <div style={{ position: "absolute", left: "10%", bottom: "25%", width: 8, height: 8, borderRadius: "50%", background: "rgba(16,185,129,0.2)" }} />
      <div style={{ position: "absolute", right: "12%", bottom: "40%", width: 10, height: 10, borderRadius: "50%", border: "2px solid rgba(245,158,11,0.15)" }} />
    </div>
  );
}

window.Login = Login;
