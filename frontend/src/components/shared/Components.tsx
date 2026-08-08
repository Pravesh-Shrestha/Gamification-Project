import React from "react";
import { GraduationCap, Cat, Dog, Rabbit, Bird, Bot, Smile, Star, Flame } from "lucide-react";

// academia.io — Shared UI components

function ProgressRing({ size = 80, stroke = 8, pct = 0, color = "var(--ink)", label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, pct / 100)));
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {label && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: size / 4,
            fontFamily: "var(--font-display)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, sub, color }) {
  return (
    <div className="card card-tight" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div className="eyebrow">{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, color: color || "var(--ink)" }}>{value}</div>
        {sub && <div className="muted" style={{ fontSize: 13, fontWeight: 700 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function Logo({ size = 36, light = false }) {
  return (
    <div className="brand" onClick={() => window.dispatchEvent(new CustomEvent("aio:nav", { detail: "home" }))} style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: size * 0.35,
        background: "var(--gradient-brand)",
        display: "grid",
        placeItems: "center",
        color: "white",
        fontWeight: 800,
        fontSize: size * 0.6,
        fontFamily: "var(--font-display)",
        boxShadow: "0 4px 12px rgba(43, 27, 122, 0.25)",
        transform: "rotate(-4deg)"
      }}>a</div>
      <span className="brand-text" style={{ fontSize: (size - 4) * 0.55, color: light ? "white" : "inherit", fontFamily: "var(--font-display)", fontWeight: 700 }}>academia.io</span>
    </div>
  );
}

function Avatar({ value, size = 32 }) {
  const avatarMap = { hat: "🎓", panda: "🐼", fox: "🦊", cat: "🐱", dog: "🐶", owl: "🦉", penguin: "🐧", bunny: "🐰", bear: "🐻", frog: "🐸", monkey: "🐵", unicorn: "🦄" };
  const emoji = avatarMap[value] || "🎓";
  return (
    <div className="avatar" style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "var(--bg-soft)",
      border: "1.5px solid var(--line-strong)",
      display: "grid",
      placeItems: "center",
      fontSize: size * 0.55,
      lineHeight: 1,
      userSelect: "none"
    }}>
      {emoji}
    </div>
  );
}

function StreakChip({ days }) {
  return (
    <div className="streak">
      <Flame size={16} color="#F59E0B" />
      <span>{days || 0}</span>
    </div>
  );
}

function NavBar({ screen, onNav, profile }) {
  return (
    <div className="topbar">
      <Logo />
      <div className="nav">
        <button className={screen === "home" ? "active" : ""} onClick={() => onNav("home")}>
          Home
        </button>
        <button className={screen === "learn" ? "active" : ""} onClick={() => onNav("learn")}>
          Learn
        </button>
        <button className={screen === "focus" ? "active" : ""} onClick={() => onNav("focus")}>
          Focus
        </button>
        <button className={screen === "profile" ? "active" : ""} onClick={() => onNav("profile")}>
          Profile
        </button>
      </div>
      <div className="user-chip" onClick={() => onNav("profile")} style={{ cursor: "pointer" }}>
        <Avatar value={profile.avatar} />
        <span className="name">{profile.name || "Learner"}</span>
        <StreakChip days={profile.streak} />
      </div>
    </div>
  );
}

function Toasts({ items, onDismiss }) {
  return (
    <div className="toast-stack">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.kind || ""}`} onClick={() => onDismiss(t.id)}>
          {t.icon && <span style={{ fontSize: 22 }}>{t.icon}</span>}
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{t.title}</div>
            {t.body && <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function EngineLog({ entries, onClear, onClose }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries.length]);
  return (
    <div className="engine-log" ref={ref}>
      <h4>
        <span>⚙ Engagement Engine · live log</span>
        <span style={{ display: "flex", gap: 8 }}>
          <button onClick={onClear}>clear</button>
          <button onClick={onClose}>×</button>
        </span>
      </h4>
      {entries.length === 0 && <div style={{ color: "#5C7B5C" }}>No events yet. Complete a lesson or focus session.</div>}
      {entries.map((e, i) => (
        <div key={i} className="row">
          <time>{new Date(e.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time>
          <span>{e.m}</span>
        </div>
      ))}
    </div>
  );
}

// Subtle decorative "subject" symbol -- not the AI-slop variety, just a flat geometric mark.
function SubjectMark({ subject, size = 56 }) {
  if (subject.id === "math") {
    return (
      <svg width={size} height={size} viewBox="0 0 56 56">
        <rect x="2" y="2" width="52" height="52" rx="14" fill={subject.accent} />
        <text x="28" y="38" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="26" fill={subject.color}>
          √x
        </text>
      </svg>
    );
  }
  if (subject.id === "sci") {
    return (
      <svg width={size} height={size} viewBox="0 0 56 56">
        <rect x="2" y="2" width="52" height="52" rx="14" fill={subject.accent} />
        <g stroke={subject.color} strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M21 14 L21 26 L14 40 a4 4 0 0 0 4 6 H38 a4 4 0 0 0 4 -6 L35 26 L35 14" />
          <line x1="18" y1="14" x2="38" y2="14" />
          <circle cx="24" cy="35" r="2" fill={subject.color} />
          <circle cx="32" cy="38" r="1.4" fill={subject.color} />
        </g>
      </svg>
    );
  }
  // english
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <rect x="2" y="2" width="52" height="52" rx="14" fill={subject.accent} />
      <text x="28" y="38" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="22" fill={subject.color}>
        Aa
      </text>
    </svg>
  );
}

Object.assign(window, { ProgressRing, StatTile, Logo, Avatar, StreakChip, NavBar, Toasts, EngineLog, SubjectMark });
