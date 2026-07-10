import React from "react";
import { stats } from "../../services/api";

// Student weekly summaries and learning statistics visual interface.

function StudentStats() {
  const [summary, setSummary] = React.useState(null);
  const [weekly, setWeekly] = React.useState(null);
  const [ml, setMl] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([stats.summary(), stats.weekly(), stats.mlInsights()])
      .then(([s, w, m]) => { setSummary(s); setWeekly(w); setMl(m); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="muted" style={{ padding: 40, textAlign: "center" }}>Loading stats...</div>;
  if (!summary) return <div className="muted" style={{ padding: 40, textAlign: "center" }}>Complete a lesson to see stats.</div>;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Hero stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Level" value={summary.level} sub={`${summary.xp} XP total`} color="#A855F7" />
        <StatCard label="Streak" value={`${summary.streak} days`} sub={summary.streak >= 5 ? "🔥 Bonus active!" : "5 days for bonus"} color="#F59E0B" />
        <StatCard label="Lessons" value={summary.lessonsCompleted} sub={`${summary.perfectQuizzes} perfect`} color="#3B82F6" />
        <StatCard label="Focus" value={`${summary.focusMinutes}m`} sub={`${summary.treesGrown} trees 🌳`} color="#10B981" />
      </div>

      {/* Weekly chart */}
      {weekly && (
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>This week</div>
          <h3 style={{ margin: "0 0 16px" }}>Daily XP earned</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
            {weekly.days.map((d) => {
              const max = Math.max(...weekly.days.map(x => x.xp), 1);
              const h = Math.max(8, (d.xp / max) * 100);
              return (
                <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>{d.xp}</div>
                  <div style={{
                    width: "100%", maxWidth: 40, height: h, borderRadius: "8px 8px 4px 4px",
                    background: d.xp > 0 ? "linear-gradient(180deg, #A855F7, #EC4899)" : "var(--bg-soft)",
                    transition: "height 0.3s",
                  }} />
                  <div className="muted" style={{ fontSize: 9, fontWeight: 700 }}>
                    {d.date.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            <div><span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Total this week</span><div style={{ fontWeight: 800, fontSize: 18 }}>{weekly.totalXp} XP</div></div>
            <div><span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Lessons done</span><div style={{ fontWeight: 800, fontSize: 18 }}>{weekly.totalLessons}</div></div>
            <div><span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Daily average</span><div style={{ fontWeight: 800, fontSize: 18 }}>{weekly.averagePerDay} XP</div></div>
          </div>
        </div>
      )}

      {/* Level progress & ML insights row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 18 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow">Level progress</div>
          <h3 style={{ margin: "0 0 12px" }}>Next level</h3>
          {summary.levelProgress && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Level {summary.levelProgress.lvl}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Level {summary.levelProgress.lvl + 1}</span>
              </div>
              <div style={{ height: 10, background: "var(--bg-soft)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${(summary.levelProgress.into / summary.levelProgress.span) * 100}%`,
                  background: "linear-gradient(90deg, #A855F7, #EC4899)", borderRadius: 99,
                  transition: "width 0.5s",
                }} />
              </div>
              <div className="muted" style={{ fontSize: 12, fontWeight: 700, marginTop: 6, textAlign: "center" }}>
                {summary.levelProgress.into} / {summary.levelProgress.span} XP
              </div>
            </>
          )}
        </div>

        {ml && (
          <div className="card" style={{ padding: 24, background: "linear-gradient(135deg, rgba(108,60,225,0.06), rgba(236,72,153,0.06))", borderColor: "rgba(108,60,225,0.15)" }}>
            <div className="eyebrow" style={{ color: "var(--primary)" }}>AI Learning Coach</div>
            <h3 style={{ margin: "0 0 12px" }}>ML Flow Diagnostics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 10, border: "1px solid var(--line)" }}>
                <span className="muted" style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Flow Zone</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: ml.flowState.includes("Anxiety") ? "#EF4444" : ml.flowState.includes("Boredom") ? "#F59E0B" : "#10B981", marginTop: 2 }}>{ml.flowState.split(" ")[0]}</div>
              </div>
              <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: 10, border: "1px solid var(--line)" }}>
                <span className="muted" style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Success Prob.</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)", marginTop: 2 }}>{ml.successProbability}%</div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, fontWeight: 600, color: "var(--ink-soft)" }}>
              🤖 <b>AI Diagnostic</b>: {ml.recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="eyebrow">{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
      {sub && <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

window.StudentStats = StudentStats;
