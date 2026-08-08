import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Trophy, BookOpen, Sparkles, BarChart, School, ShieldCheck,
  Target, TrendingUp, Zap, TreePine, CheckCircle2, ChevronDown,
  ArrowRight, User, Volume2, VolumeX
} from "lucide-react";

interface LandingProps {
  onGetStarted: () => void;
}

/* ── Web Audio Retro 8-Bit Chime Sound Generator ── */

function playRetro8BitSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(587.33, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch (err) {}
}

/* ── HTML5 Canvas Floating Pixel Star Particles Field ── */

function PixelParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = ["#FFC700", "#38BDF8", "#FFFFFF", "#C084FC"];
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() > 0.7 ? 3 : 2,
      speedY: -(0.15 + Math.random() * 0.35),
      speedX: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.7 + 0.2,
      fadeSpeed: 0.004 + Math.random() * 0.008
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += p.fadeSpeed;

        if (p.alpha >= 0.85 || p.alpha <= 0.15) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.85, p.alpha));
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
        width: "100%",
        height: "100%"
      }}
    />
  );
}

/* ── Decorative Scattered Pixel Shapes ── */

function ScatteredShapes() {
  const shapes = [
    { type: "triangle", x: "5%", y: "12%", color: "#FFC700", rotate: 15, delay: 0 },
    { type: "circle", x: "88%", y: "8%", color: "#38BDF8", size: 10, delay: 0.5 },
    { type: "star", x: "8%", y: "35%", color: "#10B981", delay: 1.5 },
    { type: "dot", x: "15%", y: "55%", color: "#38BDF8", size: 6, delay: 0.3 },
    { type: "triangle", x: "78%", y: "48%", color: "#FFC700", rotate: -20, delay: 0.8 },
    { type: "ring", x: "95%", y: "60%", color: "#FFC700", delay: 1.2 },
    { type: "star", x: "45%", y: "6%", color: "#FFC700", delay: 0.4 },
    { type: "dot", x: "70%", y: "15%", color: "#C084FC", size: 6, delay: 1.1 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {shapes.map((s, i) => {
        const base: React.CSSProperties = {
          position: "absolute",
          left: s.x,
          top: s.y,
          animation: `pixelFloat ${3.5 + (i % 3)}s ${s.delay}s ease-in-out infinite`,
        };

        if (s.type === "triangle") {
          return (
            <div key={i} style={{
              ...base,
              width: 0, height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: `12px solid ${s.color}`,
              opacity: 0.3,
              transform: `rotate(${s.rotate || 0}deg)`,
            }} />
          );
        }
        if (s.type === "circle") {
          return (
            <div key={i} style={{
              ...base,
              width: s.size || 8, height: s.size || 8,
              borderRadius: "50%",
              background: s.color,
              opacity: 0.25,
            }} />
          );
        }
        if (s.type === "star") {
          return (
            <div key={i} className="font-pixel" style={{ ...base, fontSize: 11, color: s.color, opacity: 0.4, lineHeight: 1 }}>
              ✦
            </div>
          );
        }
        if (s.type === "ring") {
          return (
            <div key={i} style={{
              ...base,
              width: 14, height: 14,
              borderRadius: "50%",
              border: `2px solid ${s.color}`,
              opacity: 0.25,
            }} />
          );
        }
        return null;
      })}
    </div>
  );
}

/* ── Original Feature Data ────────────────────────────────────── */

const FEATURES = [
  {
    icon: Trophy,
    title: "Gamified Rewards",
    desc: "XP points, level-ups, streaks, badges, daily quests, and lootbox surprises keep learners motivated every single day.",
    bg: "linear-gradient(135deg, #371b07, #5c2d0b)",
    color: "#FFC700"
  },
  {
    icon: BookOpen,
    title: "Interactive Lessons",
    desc: "Slide-based lessons with MCQ, true/false, and fill-in quizzes. A built-in focus timer grows a virtual tree as students concentrate.",
    bg: "linear-gradient(135deg, #0c3852, #03527e)",
    color: "#38BDF8"
  },
  {
    icon: Sparkles,
    title: "Interactive Study Companion",
    desc: "A smart assistant that answers questions, provides study tips, explains concepts, and summarises progress without doing the work.",
    bg: "linear-gradient(135deg, #063d2f, #045a42)",
    color: "#34D399"
  },
  {
    icon: BarChart,
    title: "Real-time Analytics",
    desc: "Activity heatmaps, weekly performance trends, class leaderboards, and school-wide dashboards for teachers and administrators.",
    bg: "linear-gradient(135deg, #2a0b4d, #4c1d95)",
    color: "#C084FC"
  },
  {
    icon: School,
    title: "Multi-School Management",
    desc: "Supports multiple schools, classes, and role hierarchies - from super admin to school admin, teacher, and student.",
    bg: "linear-gradient(135deg, #501332, #831843)",
    color: "#F472B6"
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "JWT authentication, bcrypt hashing, role-based access control, rate limiting, and encrypted data transmission at every layer.",
    bg: "linear-gradient(135deg, #103e23, #156534)",
    color: "#4ADE80"
  },
];

const STEPS = [
  { num: "1", icon: School, title: "Schools Onboard", desc: "Administrators register their school, create classes, and invite teachers and students to the platform.", bg: "linear-gradient(135deg, #1e1b4b, #312e81)" },
  { num: "2", icon: Target, title: "Learn & Earn", desc: "Students complete lessons, take quizzes, grow focus trees, and earn XP, badges, and streak rewards.", bg: "linear-gradient(135deg, #451a03, #78350f)" },
  { num: "3", icon: TrendingUp, title: "Track & Grow", desc: "Teachers and admins monitor progress with rich analytics, identify at-risk learners, and celebrate top performers.", bg: "linear-gradient(135deg, #31104b, #581c87)" },
];

const TESTIMONIALS = [
  {
    quote: "Our students' daily engagement went from sporadic to consistent within the first month. The streak system and daily quests gave them real reasons to come back every day.",
    name: "Anita Gurung",
    role: "School Administrator",
    school: "Galaxy Academy, Lalitpur",
    avatarBg: "#2e1065",
    iconColor: "#c084fc"
  },
  {
    quote: "I used to struggle getting students to complete homework. Now they actively compete on leaderboards and ask for more assignments. The virtual study companion handles most doubt-clearing for me.",
    name: "Prakash Adhikari",
    role: "Mathematics Teacher",
    school: "Galaxy Academy, Lalitpur",
    avatarBg: "#0c4a6e",
    iconColor: "#38bdf8"
  },
  {
    quote: "I love the badges and the focus tree! It makes studying feel like playing a game. I got a 15-day streak and my friends are trying to beat me now.",
    name: "Priya Sharma",
    role: "Grade 8 Student",
    school: "Galaxy Academy, Lalitpur",
    avatarBg: "#831843",
    iconColor: "#f472b6"
  },
];

const FAQS = [
  { question: "Is academia.io secure for students?", answer: "Yes. We use industry-standard encryption, JWT authentication, and strict role-based access control. Student data is private and only visible to authorized teachers and admins within your school." },
  { question: "How does the Interactive Study Companion work?", answer: "The Companion provides hints, study strategies, and concept explanations. It is strictly prompted to guide students to the answer without doing the work for them, encouraging critical thinking." },
  { question: "Can we integrate this with our existing curriculum?", answer: "Absolutely. Teachers can create custom chapters, slides, and quizzes directly in the platform to match your school's specific syllabus." }
];

/* ── Main Landing Component ──────────────────────────────────── */

export function Landing({ onGetStarted }: LandingProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleAction = () => {
    if (soundEnabled) playRetro8BitSound();
    onGetStarted();
  };

  return (
    <div className="codedex-landing" style={{ position: "relative" }}>

      {/* ── Nav ─────────────────────────────────────── */}
      <header className="codedex-header">
        <div className="codedex-header-inner">
          <div className="codedex-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="codedex-brand-logo font-pixel">a</div>
            <span className="codedex-brand-title font-pixel-sans">academia.io</span>
          </div>

          <div className="codedex-nav-links font-pixel-sans">
            <button
              onClick={() => document.getElementById("problem-solution")?.scrollIntoView({ behavior: "smooth" })}
              className="codedex-nav-link"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              Why Gamify?
            </button>
            <button
              onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })}
              className="codedex-nav-link"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              Features
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="codedex-btn-secondary"
              style={{ padding: "8px 12px" }}
              title={soundEnabled ? "Mute 8-bit SFX" : "Enable 8-bit SFX"}
            >
              {soundEnabled ? <Volume2 size={16} color="#FFC700" /> : <VolumeX size={16} color="#8A86A0" />}
            </button>

            <button onClick={handleAction} className="pixel-btn">
              Sign in 🎮
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero (Looping Assets Video Background + Canvas Particles + Eye-Friendly Dark Vignette) ────────────────────────────────────── */}
      <section className="codedex-hero-section">
        {/* Background Video Wrap */}
        <div className="codedex-hero-video-wrap">
          <video
            src="https://drive.google.com/uc?export=download&id=1Og9sk1Ox-DlT49RVYbIJAdnrx6Glfcjj"
            autoPlay
            loop
            muted
            playsInline
            className="codedex-hero-video"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="codedex-hero-video-overlay" />
        </div>

        {/* Floating Pixel Particles */}
        <PixelParticleCanvas />

        <div className="codedex-hero-content">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="pixel-badge animate-pixel-glow"
            style={{ marginBottom: 24 }}
          >
            <Sparkles size={14} color="#FFC700" /> NEW: Interactive Study Companion Active ⋆˙⟡
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="codedex-hero-title font-pixel-sans"
            style={{ fontSize: "clamp(32px, 5.5vw, 54px)", color: "#FFFFFF", textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}
          >
            Where Every Lesson{" "}
            <span style={{ color: "#FFC700", textShadow: "0 0 15px rgba(255, 199, 0, 0.4)" }} className="font-pixel-sans">
              Becomes an
            </span>{" "}
            Adventure
          </motion.h1>

          <motion.p 
            className="codedex-hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ color: "#E2E8F0", textShadow: "0 2px 10px rgba(0,0,0,0.9)", maxWidth: 720 }}
          >
            The gamified learning platform that turns classrooms into engaging, interactive
            experiences. XP, streaks, badges, companion support, and real-time analytics - built
            for schools that want their students to thrive.
          </motion.p>

          <motion.div 
            className="codedex-hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button 
              onClick={handleAction} 
              className="pixel-btn animate-pixel-pulse" 
              style={{ fontSize: 13, padding: "16px 36px" }}
            >
              Start Adventure <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })}
              className="codedex-btn-secondary"
              style={{ fontSize: 15, padding: "14px 32px", background: "rgba(19, 23, 40, 0.8)", backdropFilter: "blur(8px)" }}
            >
              Explore Features
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar (Pixel RPG Box Style) ───────────────────────────────── */}
      <section className="codedex-section" style={{ padding: "40px 24px" }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24, textAlign: "center" }}
        >
          {[
            { value: "120+", label: "Schools Onboard" },
            { value: "15,000+", label: "Active Students" },
            { value: "2M+", label: "XP Earned" },
            { value: "98%", label: "Engagement Rate" },
          ].map((stat, i) => (
            <div key={i} className="pixel-box" style={{ background: "var(--bg-card)", padding: 24, borderRadius: 12 }}>
              <div className="font-pixel" style={{ fontSize: 24, color: "var(--primary)", marginBottom: 8 }}>{stat.value}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-soft)" }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Problem vs Solution (Why Gamification?) ─────────────────────── */}
      <section id="problem-solution" className="codedex-section">
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <div className="codedex-section-tag font-pixel-sans">The Motivation Gap</div>
          <h2 className="codedex-section-title font-pixel-sans" style={{ marginBottom: 12 }}>Why Gamification?</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 16 }}>Traditional digital learning often leads to disengagement. We fix that by applying the same mechanics that make games irresistible.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
          {/* Traditional Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ padding: 32, background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: 16 }}
          >
            <h3 style={{ color: "#EF4444", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 800 }} className="font-pixel-sans">
              <span className="font-pixel" style={{ fontSize: 18 }}>✕</span> Traditional Learning
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ color: "#EF4444", marginTop: 2, fontWeight: 900 }}>✕</div>
                <div style={{ fontSize: 14, color: "var(--ink-soft)" }}><strong style={{ color: "#ffffff", display: "block" }}>Passive Consumption</strong> Students just read and click next, leading to boredom.</div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ color: "#EF4444", marginTop: 2, fontWeight: 900 }}>✕</div>
                <div style={{ fontSize: 14, color: "var(--ink-soft)" }}><strong style={{ color: "#ffffff", display: "block" }}>Delayed Feedback</strong> Waiting days for grades destroys intrinsic motivation.</div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ color: "#EF4444", marginTop: 2, fontWeight: 900 }}>✕</div>
                <div style={{ fontSize: 14, color: "var(--ink-soft)" }}><strong style={{ color: "#ffffff", display: "block" }}>Invisible Progress</strong> Hard to see day-to-day improvement or consistency.</div>
              </li>
            </ul>
          </motion.div>

          {/* academia.io Solution Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ padding: 32, background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 16 }}
          >
            <h3 style={{ color: "#10B981", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 800 }} className="font-pixel-sans">
              <CheckCircle2 size={24} /> The academia.io Way
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <CheckCircle2 color="#10B981" size={20} style={{ marginTop: 2 }} />
                <div style={{ fontSize: 14, color: "var(--ink-soft)" }}><strong style={{ color: "#ffffff", display: "block" }}>Active Engagement</strong> Interactive slides, quizzes, and focus timers.</div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <CheckCircle2 color="#10B981" size={20} style={{ marginTop: 2 }} />
                <div style={{ fontSize: 14, color: "var(--ink-soft)" }}><strong style={{ color: "#ffffff", display: "block" }}>Instant Rewards</strong> XP, level-ups, and lootboxes immediately reinforce effort.</div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <CheckCircle2 color="#10B981" size={20} style={{ marginTop: 2 }} />
                <div style={{ fontSize: 14, color: "var(--ink-soft)" }}><strong style={{ color: "#ffffff", display: "block" }}>Visible Streaks</strong> Daily goals and streaks build powerful learning habits.</div>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────── */}
      <section id="features-section" className="codedex-section">
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <div className="codedex-section-tag font-pixel-sans">Complete Learning Ecosystem</div>
          <h2 className="codedex-section-title font-pixel-sans" style={{ marginBottom: 12 }}>Built for Modern Education</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 16 }}>Everything students, teachers, and administrators need to turn learning into a habit.</p>
        </div>

        <div className="codedex-course-grid-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="codedex-journey-card"
              style={{ marginBottom: 0, border: "1px solid var(--line)" }}
            >
              <div style={{ background: f.bg, color: f.color, width: 50, height: 50, borderRadius: 12, display: "grid", placeItems: "center", marginBottom: 20, border: `1px solid ${f.color}40` }}>
                <f.icon size={24} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: "#ffffff", marginBottom: 10 }} className="font-pixel-sans">{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works (Steps) ────────────────────── */}
      <section className="codedex-section">
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <div className="codedex-section-tag font-pixel-sans">Simple 3-Step Setup</div>
          <h2 className="codedex-section-title font-pixel-sans" style={{ marginBottom: 12 }}>How academia.io Works</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 16 }}>From onboarding your school to tracking daily student growth.</p>
        </div>

        <div className="codedex-course-grid-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 16, padding: 32, position: "relative" }}
            >
              <div className="font-pixel" style={{ fontSize: 32, color: "var(--primary)", opacity: 0.35, position: "absolute", top: 20, right: 24 }}>
                0{step.num}
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: step.bg, color: "white", display: "grid", placeItems: "center", marginBottom: 20, border: "1px solid rgba(255,255,255,0.15)" }}>
                <step.icon size={24} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: "#ffffff", marginBottom: 10 }} className="font-pixel-sans">{step.title}</h3>
              <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Built for Every Role ────────────────────────────── */}
      <section className="codedex-section">
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <div className="codedex-section-tag font-pixel-sans">Role-Based Experience</div>
          <h2 className="codedex-section-title font-pixel-sans" style={{ marginBottom: 12 }}>Designed for Everyone in the School</h2>
        </div>

        <div className="codedex-course-grid-3">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 16, padding: 32 }}>
            <div style={{ background: "rgba(108, 60, 225, 0.15)", color: "#C084FC", width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center", marginBottom: 20, border: "1px solid rgba(192, 132, 252, 0.3)" }}>
              <Trophy size={24} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: "#ffffff" }} className="font-pixel-sans">For Students</h3>
            <p style={{ marginTop: 10, fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>Fun quests, streak tracking, virtual focus trees, badges, lootboxes, and instantaneous quiz feedback.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 16, padding: 32 }}>
            <div style={{ background: "rgba(59, 130, 246, 0.15)", color: "#38BDF8", width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center", marginBottom: 20, border: "1px solid rgba(56, 189, 248, 0.3)" }}>
              <BookOpen size={24} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: "#ffffff" }} className="font-pixel-sans">For Teachers</h3>
            <p style={{ marginTop: 10, fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>Classroom analytics, assignment tracking, automated student progress monitoring, and doubt assistance.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 16, padding: 32 }}>
            <div style={{ background: "rgba(245, 158, 11, 0.15)", color: "#FFC700", width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center", marginBottom: 20, border: "1px solid rgba(255, 199, 0, 0.3)" }}>
              <School size={24} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: "#ffffff" }} className="font-pixel-sans">For Admins</h3>
            <p style={{ marginTop: 10, fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>Manage multiple classes and teachers with ease. Secure, isolated data and high-level engagement analytics.</p>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────── */}
      <section className="codedex-section">
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <div className="codedex-section-tag font-pixel-sans">What People Say</div>
          <h2 className="codedex-section-title font-pixel-sans" style={{ marginBottom: 12 }}>Loved by Schools</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 16 }}>Hear from administrators, teachers, and students who use academia.io every day.</p>
        </div>

        <div className="codedex-course-grid-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div>
                <div className="font-pixel" style={{ fontSize: 36, lineHeight: 1, color: "var(--primary)", opacity: 0.35 }}>"</div>
                <div style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>{t.quote}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: t.avatarBg, color: t.iconColor, display: "grid", placeItems: "center", fontWeight: 800, flexShrink: 0, border: `1px solid ${t.iconColor}` }}>
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff" }} className="font-pixel-sans">{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)", fontWeight: 600 }}>{t.role} · {t.school}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
      <section className="codedex-section">
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 className="codedex-section-title font-pixel-sans">Frequently Asked Questions</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", fontWeight: 800, fontSize: 16, color: "#ffffff", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
                  className="font-pixel-sans"
                >
                  {faq.question}
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }}>
                    <ChevronDown size={20} color="var(--primary)" />
                  </motion.div>
                </button>
                <motion.div 
                  initial={false}
                  animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <p style={{ padding: "0 24px 20px", margin: 0, fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>{faq.answer}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="codedex-section" style={{ borderBottom: "none" }}>
        <div className="codedex-club-container">
          <div className="codedex-club-content">
            <h2 className="codedex-club-title font-pixel-sans">Ready to Transform Your Classroom?</h2>
            <p className="codedex-club-subtitle">
              Join hundreds of schools already using academia.io to make learning engaging, measurable, and fun.
            </p>

            <button onClick={handleAction} className="pixel-btn animate-pixel-pulse">
              Get Started Now <ArrowRight size={18} />
            </button>
          </div>

          <div style={{ width: 180, height: 180, borderRadius: "50%", backgroundColor: "#1e1035", border: "3px solid #FFC700", display: "grid", placeItems: "center", boxShadow: "0 0 32px rgba(255, 199, 0, 0.35)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 4 }}>🧙‍♂️</div>
              <div className="font-pixel" style={{ fontSize: 9, color: "#FFC700", textTransform: "uppercase", letterSpacing: 1.5, background: "#3b1d73", padding: "4px 10px", borderRadius: 999 }}>
                academia.io
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="codedex-footer">
        <div className="codedex-footer-inner">
          <div className="codedex-footer-grid">
            <div>
              <div className="codedex-brand" style={{ marginBottom: 16 }}>
                <div className="codedex-brand-logo font-pixel">a</div>
                <span className="codedex-brand-title font-pixel-sans">academia.io</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", maxWidth: 280, lineHeight: 1.6 }}>
                The gamified learning platform that turns every classroom into an engaging adventure for students and teachers alike.
              </p>
            </div>
            <div>
              <div className="codedex-footer-col-title font-pixel-sans">Product</div>
              <ul className="codedex-footer-links">
                <li><a href="#features-section" className="codedex-footer-link">Features</a></li>
                <li><a href="#problem-solution" className="codedex-footer-link">For Schools</a></li>
                <li><a href="#problem-solution" className="codedex-footer-link">For Teachers</a></li>
              </ul>
            </div>
            <div>
              <div className="codedex-footer-col-title font-pixel-sans">Company</div>
              <ul className="codedex-footer-links">
                <li><a href="#about" className="codedex-footer-link">About</a></li>
                <li><a href="#blog" className="codedex-footer-link">Blog</a></li>
                <li><a href="#contact" className="codedex-footer-link">Contact</a></li>
              </ul>
            </div>
            <div>
              <div className="codedex-footer-col-title font-pixel-sans">Legal</div>
              <ul className="codedex-footer-links">
                <li><a href="#privacy" className="codedex-footer-link">Privacy Policy</a></li>
                <li><a href="#terms" className="codedex-footer-link">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="codedex-footer-bottom">
            <span>© {new Date().getFullYear()} academia.io - All rights reserved.</span>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ cursor: "pointer" }}>Twitter</span>
              <span style={{ cursor: "pointer" }}>LinkedIn</span>
              <span style={{ cursor: "pointer" }}>Instagram</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

(window as any).Landing = Landing;
export default Landing;
