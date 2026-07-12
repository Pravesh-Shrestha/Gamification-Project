import React from "react";

// academia.io — Profile (badges, stats, streak heatmap, settings)

function Profile({ profile, onReset, onUpdate }) {
  const earned = new Set(profile.badges || []);
  const lvl = window.Engine.xpForNextLevel(profile.xp);
  const total = window.allLessons().length;
  const completed = (profile.lessonsCompleted || []).length;
  const accuracy = profile.perfectQuizzes && completed ? Math.round((profile.perfectQuizzes / completed) * 100) : 0;

  const avatars = ["hat", "panda", "fox", "cat", "dog", "owl", "penguin", "bunny", "bear", "frog", "monkey", "unicorn"];
  const avatarMap = { hat: "🎓", panda: "🐼", fox: "🦊", cat: "🐱", dog: "🐶", owl: "🦉", penguin: "🐧", bunny: "🐰", bear: "🐻", frog: "🐸", monkey: "🐵", unicorn: "🦄" };
  const [editAvatar, setEditAvatar] = React.useState(false);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Hero */}
      <div className="card" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 26, alignItems: "center", padding: 28 }}>
        <button
          onClick={() => setEditAvatar(true)}
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FEF3C7, #FCE7F3)",
            display: "grid",
            placeItems: "center",
            fontSize: 54,
            cursor: "pointer",
          }}
        >
          {avatarMap[profile.avatar] || "🎓"}
        </button>
        <div>
          <h1 style={{ marginBottom: 4 }}>{profile.name}</h1>
          <div className="muted" style={{ fontWeight: 700 }}>
            {profile.grade} · Level {lvl.lvl} · {profile.xp.toLocaleString()} XP
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <span style={{ background: "#FEF3C7", color: "#92400E", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 800 }}>🔥 {profile.streak} day streak</span>
            <span style={{ background: "#DBEAFE", color: "#1E40AF", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 800 }}>📖 {completed}/{total} lessons</span>
            <span style={{ background: "#D1FAE5", color: "#065F46", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 800 }}>🌳 {profile.treesGrown || 0} trees</span>
          </div>
        </div>
        <div>
          <ProgressRing
            size={110}
            stroke={10}
            pct={(lvl.into / lvl.span) * 100}
            color="#A855F7"
            label={
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>L{lvl.lvl}</div>
                <div style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.06em", fontWeight: 800 }}>{lvl.span - lvl.into} XP</div>
              </div>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatTile label="Lessons done" value={completed} sub={`of ${total}`} />
        <StatTile label="Perfect quizzes" value={profile.perfectQuizzes || 0} sub={accuracy ? `${accuracy}%` : ""} color="#10B981" />
        <StatTile label="Focus minutes" value={profile.focusMinutes || 0} sub="total" color="#3B82F6" />
        <StatTile label="Best streak" value={profile.streak} sub="days" color="#F59E0B" />
      </div>

      {/* Badges */}
      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div className="eyebrow">Achievements</div>
          <h2>Badges</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {window.Engine.BADGES.map((b) => {
            const got = earned.has(b.id);
            return (
              <div
                key={b.id}
                className="card card-tight"
                style={{
                  textAlign: "center",
                  padding: 18,
                  opacity: got ? 1 : 0.45,
                  background: got ? "var(--bg-card)" : "var(--bg-soft)",
                  border: got ? "1.5px solid var(--line-strong)" : "1px dashed var(--line-strong)",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8, filter: got ? "none" : "grayscale(1)" }}>{b.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{b.name}</div>
                <div className="muted" style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>{b.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap */}
      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div className="eyebrow">Activity</div>
          <h2>Last 8 weeks</h2>
        </div>
        <Heatmap profile={profile} />
      </div>

      {/* Danger zone */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 22 }}>
        <div>
          <div style={{ fontWeight: 800 }}>Reset all progress</div>
          <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>Clears your XP, streak, badges and finished lessons.</div>
        </div>
        <button
          className="btn"
          style={{ background: "#FEE2E2", color: "#991B1B" }}
          onClick={() => {
            if (confirm("Reset everything? This cannot be undone.")) onReset();
          }}
        >
          Reset
        </button>
      </div>

      {/* Avatar editor modal */}
      {editAvatar && (
        <div
          onClick={() => setEditAvatar(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(20,17,13,0.5)", display: "grid", placeItems: "center", zIndex: 100 }}
        >
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ maxWidth: 380, width: "90vw", padding: 26 }}>
            <h3 style={{ marginBottom: 14 }}>Pick a new avatar</h3>
            <div className="avatar-grid">
              {avatars.map((a) => (
                <button
                  key={a}
                  className={profile.avatar === a ? "sel" : ""}
                  onClick={() => {
                    onUpdate({ avatar: a });
                    setEditAvatar(false);
                  }}
                >
                  {avatarMap[a]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Heatmap({ profile }) {
  // 8 weeks × 7 days grid
  const weeks = 8;
  const grid = [];
  const today = new Date();
  // start at 8 weeks ago, Monday-aligned
  const start = new Date(today);
  start.setDate(today.getDate() - (weeks * 7 - 1));
  // shift start to a Monday so columns align
  const dayOfWeek = (start.getDay() + 6) % 7; // 0=Mon
  start.setDate(start.getDate() - dayOfWeek);

  const days = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const xp = (profile.todayXP || {})[key] || 0;
    days.push({ key, xp, date: d });
  }

  function color(xp) {
    if (xp === 0) return "var(--bg-soft)";
    if (xp < 30) return "#D1FAE5";
    if (xp < 80) return "#86EFAC";
    if (xp < 150) return "#22C55E";
    return "#15803D";
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${weeks}, 1fr)`, gridAutoFlow: "column", gridTemplateRows: "repeat(7, 1fr)", gap: 4 }}>
      {days.map((d) => (
        <div
          key={d.key}
          title={`${d.date.toDateString()}: ${d.xp} XP`}
          style={{ aspectRatio: 1, borderRadius: 4, background: color(d.xp), border: "1px solid var(--line)" }}
        />
      ))}
    </div>
  );
}

window.Profile = Profile;
