import React from "react";
import { motion } from "framer-motion";
import { 
  Trophy, BookOpen, Sparkles, BarChart, School, ShieldCheck, 
  Target, TrendingUp, Zap, TreePine, CheckCircle2, ChevronDown,
  ArrowRight, User
} from "lucide-react";

/* ── Decorative scattered shapes layer ───────────────────────── */

function ScatteredShapes() {
  const shapes = [
    { type: "triangle", x: "5%", y: "12%", color: "#F59E0B", rotate: 15, delay: 0 },
    { type: "circle", x: "88%", y: "8%", color: "#EC4899", size: 12, delay: 0.5 },
    { type: "cross", x: "92%", y: "25%", color: "#A855F7", delay: 1 },
    { type: "star", x: "8%", y: "35%", color: "#10B981", delay: 1.5 },
    { type: "dot", x: "15%", y: "55%", color: "#3B82F6", size: 8, delay: 0.3 },
    { type: "triangle", x: "78%", y: "48%", color: "#EC4899", rotate: -20, delay: 0.8 },
    { type: "ring", x: "95%", y: "60%", color: "#F59E0B", delay: 1.2 },
    { type: "cross", x: "3%", y: "75%", color: "#10B981", delay: 0.6 },
    { type: "circle", x: "82%", y: "72%", color: "#6C3CE1", size: 8, delay: 1.8 },
    { type: "star", x: "45%", y: "6%", color: "#F59E0B", delay: 0.4 },
    { type: "dot", x: "70%", y: "15%", color: "#A855F7", size: 6, delay: 1.1 },
    { type: "triangle", x: "55%", y: "85%", color: "#10B981", rotate: 45, delay: 0.7 },
    { type: "ring", x: "20%", y: "90%", color: "#EC4899", delay: 1.4 },
    { type: "cross", x: "65%", y: "92%", color: "#3B82F6", delay: 0.9 },
    { type: "dot", x: "35%", y: "40%", color: "#F59E0B", size: 5, delay: 2 },
    { type: "circle", x: "50%", y: "65%", color: "#EC4899", size: 7, delay: 1.6 },
  ];

  return (
    <div className="scattered-shapes">
      {shapes.map((s, i) => {
        const base: React.CSSProperties = {
          position: "absolute",
          left: s.x,
          top: s.y,
          animation: `floatSlow ${3 + (i % 3)}s ${s.delay}s ease-in-out infinite`,
        };

        if (s.type === "triangle") {
          return (
            <div key={i} style={{
              ...base,
              width: 0, height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: `14px solid ${s.color}`,
              opacity: 0.3,
              transform: `rotate(${s.rotate || 0}deg)`,
            }} />
          );
        }
        if (s.type === "circle") {
          return (
            <div key={i} style={{
              ...base,
              width: s.size || 10, height: s.size || 10,
              borderRadius: "50%",
              background: s.color,
              opacity: 0.25,
            }} />
          );
        }
        if (s.type === "star") {
          return (
            <div key={i} style={{ ...base, fontSize: 14, color: s.color, opacity: 0.3, lineHeight: 1 }}>
              ✦
            </div>
          );
        }
        if (s.type === "cross") {
          return (
            <div key={i} style={{ ...base, width: 14, height: 14, opacity: 0.2 }}>
              <div style={{ position: "absolute", width: 2, height: "100%", left: "50%", transform: "translateX(-50%)", background: s.color }} />
              <div style={{ position: "absolute", height: 2, width: "100%", top: "50%", transform: "translateY(-50%)", background: s.color }} />
            </div>
          );
        }
        if (s.type === "dot") {
          return (
            <div key={i} style={{
              ...base,
              width: s.size || 6, height: s.size || 6,
              borderRadius: "50%",
              background: s.color,
              opacity: 0.2,
            }} />
          );
        }
        if (s.type === "ring") {
          return (
            <div key={i} style={{
              ...base,
              width: 16, height: 16,
              borderRadius: "50%",
              border: `2px solid ${s.color}`,
              opacity: 0.2,
            }} />
          );
        }
        return null;
      })}
    </div>
  );
}

/* ── Feature data ────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Trophy,
    title: "Gamified Rewards",
    desc: "XP points, level-ups, streaks, badges, daily quests, and lootbox surprises keep learners motivated every single day.",
    bg: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
    color: "#D97706"
  },
  {
    icon: BookOpen,
    title: "Interactive Lessons",
    desc: "Slide-based lessons with MCQ, true/false, and fill-in quizzes. A built-in focus timer grows a virtual tree as students concentrate.",
    bg: "linear-gradient(135deg, #DBEAFE, #BFDBFE)",
    color: "#2563EB"
  },
  {
    icon: Sparkles,
    title: "Interactive Study Companion",
    desc: "A smart assistant that answers questions, provides study tips, explains concepts, and summarises progress without doing the work.",
    bg: "linear-gradient(135deg, #D1FAE5, #A7F3D0)",
    color: "#059669"
  },
  {
    icon: BarChart,
    title: "Real-time Analytics",
    desc: "Activity heatmaps, weekly performance trends, class leaderboards, and school-wide dashboards for teachers and administrators.",
    bg: "linear-gradient(135deg, #EDE9FE, #DDD6FE)",
    color: "#7C3AED"
  },
  {
    icon: School,
    title: "Multi-School Management",
    desc: "Supports multiple schools, classes, and role hierarchies — from super admin to school admin, teacher, and student.",
    bg: "linear-gradient(135deg, #FCE7F3, #FBCFE8)",
    color: "#DB2777"
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "JWT authentication, bcrypt hashing, role-based access control, rate limiting, and encrypted data transmission at every layer.",
    bg: "linear-gradient(135deg, #F0FDEF, #BBF7D0)",
    color: "#16A34A"
  },
];

const STEPS = [
  { num: "1", icon: School, title: "Schools Onboard", desc: "Administrators register their school, create classes, and invite teachers and students to the platform.", bg: "var(--gradient-brand)" },
  { num: "2", icon: Target, title: "Learn & Earn", desc: "Students complete lessons, take quizzes, grow focus trees, and earn XP, badges, and streak rewards.", bg: "var(--gradient-cta)" },
  { num: "3", icon: TrendingUp, title: "Track & Grow", desc: "Teachers and admins monitor progress with rich analytics, identify at-risk learners, and celebrate top performers.", bg: "var(--gradient-warm)" },
];

const TESTIMONIALS = [
  {
    quote: "Our students' daily engagement went from sporadic to consistent within the first month. The streak system and daily quests gave them real reasons to come back every day.",
    name: "Anita Gurung",
    role: "School Administrator",
    school: "Galaxy Academy, Lalitpur",
    avatarBg: "#EDE9FE",
    iconColor: "#7C3AED"
  },
  {
    quote: "I used to struggle getting students to complete homework. Now they actively compete on leaderboards and ask for more assignments. The virtual study companion handles most doubt-clearing for me.",
    name: "Prakash Adhikari",
    role: "Mathematics Teacher",
    school: "Galaxy Academy, Lalitpur",
    avatarBg: "#DBEAFE",
    iconColor: "#2563EB"
  },
  {
    quote: "I love the badges and the focus tree! It makes studying feel like playing a game. I got a 15-day streak and my friends are trying to beat me now.",
    name: "Priya Sharma",
    role: "Grade 8 Student",
    school: "Galaxy Academy, Lalitpur",
    avatarBg: "#FCE7F3",
    iconColor: "#DB2777"
  },
];

const FAQS = [
  { question: "Is academia.io secure for students?", answer: "Yes. We use industry-standard encryption, JWT authentication, and strict role-based access control. Student data is private and only visible to authorized teachers and admins within your school." },
  { question: "How does the Interactive Study Companion work?", answer: "The Companion provides hints, study strategies, and concept explanations. It is strictly prompted to guide students to the answer without doing the work for them, encouraging critical thinking." },
  { question: "Can we integrate this with our existing curriculum?", answer: "Absolutely. Teachers can create custom chapters, slides, and quizzes directly in the platform to match your school's specific syllabus." }
];

/* ── Main Landing Component ──────────────────────────────────── */

function Landing({ onGetStarted }) {
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  return (
    <div className="landing-page">
      <ScatteredShapes />

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="landing-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--gradient-brand)",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontWeight: 900,
            fontSize: 18,
            fontFamily: "var(--font-display)",
            boxShadow: "0 2px 8px rgba(108, 60, 225, 0.4)"
          }}>a</div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-.01em" }}>academia.io</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => document.getElementById("problem-solution")?.scrollIntoView({ behavior: "smooth" })}
              style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-soft)", padding: "8px 14px" }}
            >
              Why Gamify?
            </button>
            <button
              onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })}
              style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-soft)", padding: "8px 14px" }}
            >
              Features
            </button>
          </div>
          <button onClick={onGetStarted} className="btn-gradient" style={{ padding: "10px 24px", fontSize: 14 }}>
            Sign in
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="landing-hero">
        {/* Glow orbs */}
        <div style={{
          position: "absolute",
          top: "20%",
          left: "20%",
          width: 380,
          height: 380,
          background: "radial-gradient(circle, rgba(108, 60, 225, 0.18) 0%, rgba(108, 60, 225, 0) 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0
        }} />
        <div style={{
          position: "absolute",
          top: "35%",
          right: "20%",
          width: 350,
          height: 350,
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0) 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 780 }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 6px",
              background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 999,
              marginBottom: 28, fontSize: 13, fontWeight: 700, color: "var(--ink-soft)",
              boxShadow: "var(--shadow-sm)"
            }}>
            <span style={{
              background: "var(--gradient-cta)", color: "white", padding: "3px 10px",
              borderRadius: 99, fontSize: 11, fontWeight: 800,
            }}>
              NEW
            </span>
            Interactive study companion now available
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Where Every Lesson{" "}
            <span className="gradient-text">Becomes an</span>{" "}
            Adventure
          </motion.h1>

          <motion.p 
            className="subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The gamified learning platform that turns classrooms into engaging, interactive
            experiences. XP, streaks, badges, companion support, and real-time analytics — built
            for schools that want their students to thrive.
          </motion.p>

          <motion.div 
            className="hero-ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center" }}
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted} 
              className="btn-gradient" 
              style={{ fontSize: 17, padding: "16px 36px" }}
            >
              Get Started <ArrowRight size={18} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })}
              className="btn ghost"
              style={{ fontSize: 17, padding: "16px 36px", height: 58, display: "inline-flex", alignItems: "center" }}
            >
              Explore Features
            </motion.button>
          </motion.div>

          <motion.div 
            className="hero-icons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {[
              { Icon: Trophy, bg: "#FEF3C7", color: "#D97706", delay: 0 },
              { Icon: Target, bg: "#DBEAFE", color: "#2563EB", delay: 0.2 },
              { Icon: Zap, bg: "#EDE9FE", color: "#7C3AED", delay: 0.4 },
              { Icon: BookOpen, bg: "#D1FAE5", color: "#059669", delay: 0.6 },
              { Icon: TreePine, bg: "#FEF3C7", color: "#D97706", delay: 0.8 },
              { Icon: Sparkles, bg: "#FCE7F3", color: "#DB2777", delay: 1.0 },
            ].map((item, i) => (
              <div
                key={i}
                className="hero-icon-bubble"
                style={{
                  background: item.bg,
                  color: item.color,
                  animationDelay: `${item.delay}s`,
                  animationDuration: `${3.5 + i * 0.4}s`,
                }}
              >
                <item.Icon size={28} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        className="landing-stats"
      >
        {[
          { value: "120+", label: "Schools" },
          { value: "15,000+", label: "Active Students" },
          { value: "2M+", label: "XP Earned" },
          { value: "98%", label: "Engagement Rate" },
        ].map((stat, i) => (
          <div key={i} className="landing-stat">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Problem vs Solution ─────────────────────── */}
      <section id="problem-solution" style={{ padding: "80px 24px", background: "var(--bg-card)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="landing-section-header">
            <div className="eyebrow" style={{ color: "var(--primary)", marginBottom: 10 }}>The Motivation Gap</div>
            <h2>Why Gamification?</h2>
            <p>Traditional digital learning often leads to disengagement. We fix that by applying the same mechanics that make games irresistible.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card" style={{ padding: 32, background: "rgba(239, 68, 68, 0.04)", borderColor: "rgba(239, 68, 68, 0.1)" }}
            >
              <h3 style={{ color: "#EF4444", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>✕</span> Traditional Learning
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ color: "#EF4444", marginTop: 2 }}>✕</div>
                  <div><strong style={{ display: "block" }}>Passive Consumption</strong> Students just read and click next, leading to boredom.</div>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ color: "#EF4444", marginTop: 2 }}>✕</div>
                  <div><strong style={{ display: "block" }}>Delayed Feedback</strong> Waiting days for grades destroys intrinsic motivation.</div>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ color: "#EF4444", marginTop: 2 }}>✕</div>
                  <div><strong style={{ display: "block" }}>Invisible Progress</strong> Hard to see day-to-day improvement or consistency.</div>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card" style={{ padding: 32, background: "rgba(16, 185, 129, 0.04)", borderColor: "rgba(16, 185, 129, 0.2)" }}
            >
              <h3 style={{ color: "#10B981", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 /> The academia.io Way
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <CheckCircle2 color="#10B981" size={20} style={{ marginTop: 2 }} />
                  <div><strong style={{ display: "block" }}>Active Engagement</strong> Interactive slides, quizzes, and focus timers.</div>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <CheckCircle2 color="#10B981" size={20} style={{ marginTop: 2 }} />
                  <div><strong style={{ display: "block" }}>Instant Rewards</strong> XP, level-ups, and lootboxes immediately reinforce effort.</div>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <CheckCircle2 color="#10B981" size={20} style={{ marginTop: 2 }} />
                  <div><strong style={{ display: "block" }}>Visible Streaks</strong> Daily goals and streaks build powerful learning habits.</div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section id="features-section" className="landing-section">
        <div className="landing-section-header">
          <div className="eyebrow" style={{ color: "var(--primary)", marginBottom: 10 }}>Platform Features</div>
          <h2>Everything Your School Needs</h2>
          <p>A complete gamified learning ecosystem designed to make digital classrooms engaging, measurable, and rewarding.</p>
        </div>

        <div className="features-grid">
          {FEATURES.map((feat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="feature-card"
            >
              <div className="feature-icon" style={{ background: feat.bg, color: feat.color }}>
                <feat.icon size={26} />
              </div>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "80px 24px", background: "var(--bg-soft)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="landing-section-header">
            <div className="eyebrow" style={{ color: "var(--primary)", marginBottom: 10 }}>Simple Setup</div>
            <h2>How It Works</h2>
            <p>From onboarding to daily learning, the entire experience is designed to be seamless and rewarding.</p>
          </div>

          <div className="steps-row">
            {STEPS.map((step, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                key={i} 
                className="step-item"
              >
                <div className="step-number" style={{ background: step.bg }}>
                  <step.icon size={32} color="white" />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Benefits ────────────────────────────── */}
      <section style={{ padding: "80px 24px", background: "var(--bg-card)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="landing-section-header">
            <div className="eyebrow" style={{ color: "var(--primary)", marginBottom: 10 }}>For Everyone</div>
            <h2>Built for the whole school</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            <motion.div whileHover={{ y: -5 }} className="card" style={{ padding: 32 }}>
              <div style={{ background: "rgba(108, 60, 225, 0.1)", color: "var(--primary)", width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center", marginBottom: 20 }}>
                <User size={24} />
              </div>
              <h3>For Students</h3>
              <p className="soft" style={{ marginTop: 8, fontSize: 15 }}>Learning feels like playing. Earn XP, maintain streaks, unlock cool avatars, and get instant help from the Study Companion.</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="card" style={{ padding: 32 }}>
              <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981", width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center", marginBottom: 20 }}>
                <BookOpen size={24} />
              </div>
              <h3>For Teachers</h3>
              <p className="soft" style={{ marginTop: 8, fontSize: 15 }}>Automated grading, rich activity heatmaps, and a clear view of who needs help, letting you focus on actual teaching.</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="card" style={{ padding: 32 }}>
              <div style={{ background: "rgba(245, 158, 11, 0.1)", color: "#F59E0B", width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center", marginBottom: 20 }}>
                <School size={24} />
              </div>
              <h3>For Admins</h3>
              <p className="soft" style={{ marginTop: 8, fontSize: 15 }}>Manage multiple classes and teachers with ease. Secure, isolated data and high-level engagement analytics.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────── */}
      <section className="landing-section">
        <div className="landing-section-header">
          <div className="eyebrow" style={{ color: "var(--primary)", marginBottom: 10 }}>What People Say</div>
          <h2>Loved by Schools</h2>
          <p>Hear from administrators, teachers, and students who use academia.io every day.</p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              key={i} 
              className="testimonial-card"
            >
              <div className="quote-mark">"</div>
              <div className="quote-text">{t.quote}</div>
              <div className="quote-author">
                <div className="author-avatar" style={{ background: t.avatarBg, color: t.iconColor }}>
                  <User size={20} />
                </div>
                <div>
                  <div className="author-name">{t.name}</div>
                  <div className="author-role">{t.role} · {t.school}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", background: "var(--bg-soft)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="landing-section-header">
            <h2>Frequently Asked Questions</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="card" style={{ padding: "8px 24px" }}>
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", fontWeight: 800, fontSize: 16, textAlign: "left" }}
                >
                  {faq.question}
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }}>
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                <motion.div 
                  initial={false}
                  animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="soft" style={{ paddingBottom: 24, margin: 0, lineHeight: 1.6 }}>{faq.answer}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="landing-cta" style={{ background: "var(--gradient-brand)" }}>
        <ScatteredShapes />
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to Transform Your Classroom?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Join hundreds of schools already using academia.io to make learning engaging, measurable, and fun.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          onClick={onGetStarted}
          className="btn-gradient"
          style={{ fontSize: 17, padding: "16px 40px", position: "relative", zIndex: 1 }}
        >
          Get Started <ArrowRight size={18} />
        </motion.button>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--line)" }}>
        <div className="landing-footer">
          <div className="landing-footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "var(--gradient-brand)",
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                  fontWeight: 900,
                  fontSize: 15,
                  fontFamily: "var(--font-display)",
                  boxShadow: "0 2px 6px rgba(108, 60, 225, 0.4)"
                }}>a</div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, letterSpacing: "-.01em" }}>academia.io</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", maxWidth: 280, lineHeight: 1.6, fontWeight: 600 }}>
                The gamified learning platform that turns every classroom into an engaging adventure for students and teachers alike.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-mute)", marginBottom: 14 }}>Product</div>
              <FooterLink label="Features" />
              <FooterLink label="For Schools" />
              <FooterLink label="For Teachers" />
              <FooterLink label="Pricing" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-mute)", marginBottom: 14 }}>Company</div>
              <FooterLink label="About" />
              <FooterLink label="Careers" />
              <FooterLink label="Blog" />
              <FooterLink label="Contact" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-mute)", marginBottom: 14 }}>Legal</div>
              <FooterLink label="Privacy Policy" />
              <FooterLink label="Terms of Service" />
              <FooterLink label="Cookie Policy" />
            </div>
          </div>

          <div className="landing-footer-bottom">
            <span>© {new Date().getFullYear()} academia.io — All rights reserved.</span>
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

function FooterLink({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 8, cursor: "pointer" }}>
      {label}
    </div>
  );
}

window.Landing = Landing;
