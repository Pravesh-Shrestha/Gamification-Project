import React from "react";
import { getPerformance, getSummaries, getMlInsights } from "../../services/analytics";

// Student performance history and learning activity dashboard views.

function Analytics() {
  const [perf, setPerf] = React.useState(null);
  const [summaries, setSummaries] = React.useState([]);
  const [mlInsights, setMlInsights] = React.useState(null);
  const [tab, setTab] = React.useState("overview");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([getPerformance(), getSummaries(), getMlInsights()])
      .then(([p, s, m]) => { setPerf(p); setSummaries(s); setMlInsights(m); })
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="muted" style={{ padding: 40, textAlign: "center" }}>Loading analytics...</div>;
  if (!perf) return <div className="muted" style={{ padding: 40, textAlign: "center" }}>Complete a lesson to see analytics.</div>;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, padding: 4, background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 14, width: "fit-content" }}>
        {[
          { id: "overview", label: "Overview", icon: "📊" },
          { id: "subjects", label: "Subjects", icon: "📚" },
          { id: "summaries", label: "Lesson History", icon: "📝" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "8px 16px", borderRadius: 10, fontWeight: 800, fontSize: 13,
              background: tab === t.id ? "var(--ink)" : "transparent",
              color: tab === t.id ? "var(--bg-card)" : "var(--ink-soft)",
              display: "flex", alignItems: "center", gap: 6,
            }}
          ><span>{t.icon}</span> {t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────── */}
      {tab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <PerfCard label="Level" value={perf.level} sub={`${perf.xp} XP`} color="#A855F7" />
            <PerfCard label="Streak" value={`${perf.streak} days`} sub={`${perf.totalDaysActive} total active`} color="#F59E0B" />
            <PerfCard label="Accuracy" value={`${perf.accuracy}%`} sub={`${perf.totalLessons} lessons`} color="#10B981" />
            <PerfCard label="Focus" value={`${perf.totalFocusMinutes}m`} sub={`${perf.treesGrown} trees`} color="#3B82F6" />
          </div>

          {/* Weekly activity bar */}
          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow">Activity</div>
            <h3 style={{ margin: "0 0 4px" }}>30-day overview</h3>
            <p className="soft" style={{ fontSize: 13, margin: "0 0 16px" }}>
              Active days in last 30: <strong>{perf.daysActive30}</strong>
              {perf.weakestSubject && <span> · Needs improvement: <strong>{perf.weakestSubject}</strong> ({perf.weakestAccuracy}%)</span>}
            </p>

            {/* XP breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, padding: 16, background: "var(--bg-soft)", borderRadius: 12 }}>
              <div>
                <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Total XP</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{perf.xp.toLocaleString()}</div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Perfect Quizzes</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{perf.perfectQuizzes}</div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Streak Best</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{perf.streak} days</div>
              </div>
            </div>
          </div>

          {/* Predictive ML Insights Card */}
          {mlInsights && (
            <div className="card" style={{ padding: 24, background: "linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)", border: "1.5px solid var(--line)" }}>
              <div className="eyebrow" style={{ color: "#7C3AED", fontWeight: 800 }}>🧠 AI/ML Engine Diagnostics</div>
              <h3 style={{ margin: "4px 0 16px" }}>Performance predictions & cognitive disengagement risk</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 16 }}>
                <div style={{ padding: 14, background: "var(--bg-soft)", borderRadius: 12, border: "1px solid var(--line)" }}>
                  <div className="muted" style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>Disengagement Risk</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: mlInsights.disengagementRisk === "High" ? "#EF4444" : mlInsights.disengagementRisk === "Medium" ? "#F59E0B" : "#10B981", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{mlInsights.disengagementRisk === "High" ? "🚨" : mlInsights.disengagementRisk === "Medium" ? "⚠️" : "✅"}</span>
                    <span>{mlInsights.disengagementRisk}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 9, fontWeight: 700, marginTop: 4 }}>Probability score: {mlInsights.disengagementProb}%</div>
                </div>

                <div style={{ padding: 14, background: "var(--bg-soft)", borderRadius: 12, border: "1px solid var(--line)" }}>
                  <div className="muted" style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>Next Test Success</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#10B981", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🎯</span>
                    <span>{mlInsights.successProbability}%</span>
                  </div>
                  <div className="muted" style={{ fontSize: 9, fontWeight: 700, marginTop: 4 }}>Predicted score threshold</div>
                </div>

                <div style={{ padding: 14, background: "var(--bg-soft)", borderRadius: 12, border: "1px solid var(--line)" }}>
                  <div className="muted" style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>Flow State Status</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#A855F7", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                    <span>🌊</span>
                    <span>{mlInsights.flowState.split(" ")[0]}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 9, fontWeight: 700, marginTop: 6 }}>Challenge-Skill ratio</div>
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "var(--bg-soft)", borderRadius: 10, borderLeft: "4px solid #7C3AED", fontSize: 12, lineHeight: 1.5, fontWeight: 600 }}>
                <span style={{ color: "#7C3AED" }}>🤖 Companion Advice:</span> {mlInsights.recommendation}
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow">Recent</div>
            <h3 style={{ margin: "0 0 12px" }}>Last 10 lessons</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {perf.recentActivity.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg-soft)", borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.lessonTitle}</div>
                    <div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{new Date(r.completedAt).toLocaleDateString()} · {r.score}/{r.total} correct</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {r.perfect && <span style={{ fontSize: 16 }}>💎</span>}
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#10B981" }}>+{r.xpEarned} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── SUBJECTS TAB ────────────────────────────── */}
      {tab === "subjects" && (
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow">Performance by subject</div>
          <h3 style={{ margin: "0 0 16px" }}>Subject breakdown</h3>
          <div style={{ display: "grid", gap: 16 }}>
            {perf.subjectPerformance.filter((s) => s.completed > 0 || s.total > 0).map((s) => (
              <div key={s.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{s.name}</span>
                    <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{s.completed}/{s.total} lessons</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: s.accuracy >= 80 ? "#10B981" : s.accuracy >= 50 ? "#F59E0B" : "#EF4444" }}>
                      {s.accuracy}%
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#A855F7" }}>{s.xp} XP</span>
                  </div>
                </div>
                {/* Accuracy bar */}
                <div style={{ height: 8, background: "var(--bg-soft)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.accuracy}%`, background: s.accuracy >= 80 ? "#10B981" : s.accuracy >= 50 ? "#F59E0B" : "#EF4444", borderRadius: 99, transition: "width 0.5s" }} />
                </div>
                {/* Completion bar */}
                <div style={{ height: 4, background: "var(--bg-soft)", borderRadius: 99, overflow: "hidden", marginTop: 4 }}>
                  <div style={{ height: "100%", width: `${(s.completed / Math.max(s.total, 1)) * 100}%`, background: s.color, borderRadius: 99, transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUMMARIES TAB ───────────────────────────── */}
      {tab === "summaries" && (
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow">Your learning journey</div>
          <h3 style={{ margin: "0 0 16px" }}>Lesson summaries</h3>
          {summaries.length === 0 && <div className="muted" style={{ textAlign: "center", padding: 20 }}>No lessons completed yet.</div>}
          <div style={{ display: "grid", gap: 12 }}>
            {summaries.map((s, i) => (
              <div key={i} style={{ padding: 16, background: "var(--bg-soft)", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{s.lessonTitle}</div>
                    <div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{s.subject} · {s.duration} min · {new Date(s.completedAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: s.perfect ? "#10B981" : "var(--ink)" }}>
                      {s.score}/{s.total} {s.perfect && "💎"}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#A855F7" }}>+{s.xpEarned} XP</div>
                  </div>
                </div>
                {s.keyPoints.length > 0 && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 800 }}>Key points:</span>
                    <ul style={{ margin: "4px 0 0", paddingLeft: 16 }}>
                      {s.keyPoints.map((kp, j) => (
                        <li key={j}>{kp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PerfCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="eyebrow">{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
      {sub && <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

window.Analytics = Analytics;
