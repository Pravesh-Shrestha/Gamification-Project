import React from "react";

// academia.io - Dashboard (Home)

function Dashboard({ profile, onNav, onOpenLesson }) {
  const dp = window.Engine.dailyProgress(profile, profile.dailyGoal);
  const lvl = window.Engine.xpForNextLevel(profile.xp);
  const recommended = window.Engine.recommendNext(profile);
  const done = new Set(profile.lessonsCompleted);
  const all = window.allLessons();
  const progressPct = Math.round((done.size / all.length) * 100);

  // Recently started subject (any subject with at least 1 completed lesson - or first)
  const subjectsWithProgress = window.CURRICULUM.map((s) => {
    const subjLessons = s.chapters.flatMap((c) => c.lessons);
    const completed = subjLessons.filter((l) => done.has(l.id)).length;
    return { subj: s, completed, total: subjLessons.length };
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <div
          className="card"
          style={{
            background: "linear-gradient(135deg, #1F1B16 0%, #2A2520 100%)",
            color: "#FAF7F2",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative bubbles */}
          <div style={{ position: "absolute", right: -40, top: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(245,158,11,0.25), transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", right: 60, bottom: -60, width: 140, height: 140, background: "radial-gradient(circle, rgba(168,85,247,0.2), transparent 70%)", borderRadius: "50%" }} />

          <div style={{ position: "relative", display: "flex", alignItems: "start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div className="eyebrow" style={{ color: "#FFD279", marginBottom: 8 }}>{greeting}</div>
              <h1 style={{ color: "#FAF7F2", marginBottom: 6 }}>
                {profile.name},<br />ready to learn?
              </h1>
              <p style={{ color: "rgba(250,247,242,0.7)", margin: "0 0 22px", maxWidth: 380, fontWeight: 600 }}>
                You've earned <b style={{ color: "#FAF7F2" }}>{dp.earned} XP</b> today. {dp.pct >= 100 ? "Goal complete - nicely done." : `${dp.goal - dp.earned} XP to hit your daily goal.`}
              </p>

              {recommended ? (
                <button
                  className="btn"
                  style={{ background: recommended.color, color: "white" }}
                  onClick={() => onOpenLesson(recommended.id)}
                >
                  Continue: {recommended.title} →
                </button>
              ) : (
                <button className="btn" style={{ background: "#FAF7F2", color: "#1F1B16" }} onClick={() => onNav("learn")}>
                  Browse subjects →
                </button>
              )}
            </div>
            <div style={{ flexShrink: 0 }}>
              <ProgressRing
                size={120}
                stroke={11}
                pct={dp.pct}
                color="#FFD279"
                label={
                  <div style={{ textAlign: "center", color: "#FAF7F2" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>{dp.pct}%</div>
                    <div style={{ fontSize: 10, color: "rgba(250,247,242,0.7)", letterSpacing: "0.06em", fontWeight: 800 }}>DAILY GOAL</div>
                  </div>
                }
              />
            </div>
          </div>
        </div>

        {/* Stats card */}
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 12 }}>
          <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignContent: "center", padding: 18 }}>
            <div>
              <div className="eyebrow">Level</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 36 }}>{lvl.lvl}</div>
                <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
                  {lvl.into}/{lvl.span} xp
                </div>
              </div>
              <div style={{ height: 6, background: "var(--line)", borderRadius: 99, overflow: "hidden", marginTop: 8 }}>
                <div style={{ height: "100%", width: `${(lvl.into / lvl.span) * 100}%`, background: "linear-gradient(90deg, #A855F7, #EC4899)" }} />
              </div>
            </div>
            <div>
              <div className="eyebrow">Streak</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 36, color: "#F59E0B" }}>{profile.streak}</div>
                <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>days 🔥</div>
              </div>
              <div className="muted" style={{ fontSize: 12, fontWeight: 600, marginTop: 8 }}>
                {profile.streak >= 7 ? "On fire!" : "Keep showing up."}
              </div>
            </div>
          </div>

          <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignContent: "center", padding: 18 }}>
            <div>
              <div className="eyebrow">Total XP</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28 }}>{profile.xp.toLocaleString()}</div>
            </div>
            <div>
              <div className="eyebrow">Badges</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28 }}>
                {(profile.badges || []).length}<span className="muted" style={{ fontSize: 16 }}>/{window.Engine.BADGES.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {recommended && (
          <button
            className="card"
            onClick={() => onOpenLesson(recommended.id)}
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, textAlign: "left", padding: 18, cursor: "pointer", border: `1.5px solid ${recommended.color}33` }}
          >
            <span style={{ fontSize: 22 }}>▶</span>
            <div style={{ fontWeight: 800 }}>Continue learning</div>
            <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{recommended.title}</div>
          </button>
        )}
        <button
          className="card"
          onClick={() => onNav("learn")}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, textAlign: "left", padding: 18, cursor: "pointer" }}
        >
          <span style={{ fontSize: 22 }}>📚</span>
          <div style={{ fontWeight: 800 }}>Browse subjects</div>
          <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{all.length} lessons total</div>
        </button>
        <button
          className="card"
          onClick={() => onNav("focus")}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, textAlign: "left", padding: 18, cursor: "pointer" }}
        >
          <span style={{ fontSize: 22 }}>🌳</span>
          <div style={{ fontWeight: 800 }}>Focus mode</div>
          <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Grow a tree, no distractions</div>
        </button>
        <button
          className="card"
          onClick={() => onNav("profile")}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, textAlign: "left", padding: 18, cursor: "pointer" }}
        >
          <span style={{ fontSize: 22 }}>🏆</span>
          <div style={{ fontWeight: 800 }}>Your badges</div>
          <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{(profile.badges || []).length} earned</div>
        </button>
      </div>

      {/* Subject progress */}
      <div>
        <h2 style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span>Your subjects</span>
          <button className="soft" style={{ fontSize: 13, fontWeight: 700, padding: 0 }} onClick={() => onNav("learn")}>
            See all →
          </button>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {subjectsWithProgress.map(({ subj, completed, total }) => {
            const pct = total ? Math.round((completed / total) * 100) : 0;
            return (
              <button
                key={subj.id}
                className="card"
                onClick={() => onNav("subject:" + subj.id)}
                style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start", padding: 22, cursor: "pointer", textAlign: "left" }}
              >
                <SubjectMark subject={subj} size={56} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 4 }}>{subj.name}</h3>
                  <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{subj.blurb}</div>
                </div>
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-soft)" }}>{completed} / {total} lessons</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: subj.color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 8, background: subj.accent, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: subj.color, transition: "width 0.5s" }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily history strip */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="eyebrow">Last 14 days</div>
            <h3>Daily activity</h3>
          </div>
          <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>{progressPct}% of curriculum complete</div>
        </div>
        <HistoryStrip profile={profile} />
      </div>
    </div>
  );
}

function HistoryStrip({ profile }) {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const xp = (profile.todayXP || {})[key] || 0;
    days.push({ key, xp, day: d.toLocaleDateString([], { weekday: "short" })[0], date: d.getDate() });
  }
  const max = Math.max(...days.map((d) => d.xp), profile.dailyGoal || 50);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 6, alignItems: "end" }}>
      {days.map((d, i) => (
        <div key={d.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ height: 60, width: "100%", display: "flex", alignItems: "end" }}>
            <div
              title={`${d.xp} XP`}
              style={{
                width: "100%",
                height: `${Math.max(3, (d.xp / max) * 100)}%`,
                background: d.xp >= (profile.dailyGoal || 50)
                  ? "linear-gradient(180deg, #84CC16, #65A30D)"
                  : d.xp > 0 ? "var(--line-strong)" : "var(--line)",
                borderRadius: 6,
                transition: "height 0.4s",
              }}
            />
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-mute)" }}>{d.day}</div>
        </div>
      ))}
    </div>
  );
}

window.Dashboard = Dashboard;
