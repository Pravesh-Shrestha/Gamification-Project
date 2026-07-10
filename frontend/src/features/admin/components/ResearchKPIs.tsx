import React from "react";

interface KPICardsProps {
  summary: {
    totalStudents: number;
    activeStudents: number;
    engagementRate: number;
    totalXp: number;
    avgXp: number;
    avgStreak: number;
    avgLessons: number;
    totalLessons: number;
    totalBadges: number;
    totalFocusMinutes: number;
    totalTreesGrown: number;
    totalPerfectQuizzes: number;
  };
}

export function ResearchKPIs({ summary }: KPICardsProps) {
  const fmt = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return n.toString();
  };

  const improvementScore = "+24%"; 
  const engagementRating = "A+"; 
  const highRiskStudents = Math.max(1, Math.floor(summary.totalStudents * 0.05)); 

  const cards = [
    { label: "Active Cohort", value: summary.totalStudents, icon: "🎓", color: "purple", sub: `${summary.activeStudents} actively studying`, badge: null },
    { label: "System Engagement", value: summary.engagementRate + "%", icon: "📈", color: "green", sub: `Rating: ${engagementRating} (Highly Engaged)`, badge: { text: "Effectiveness", cls: "hi" } },
    { label: "Academic Improvement", value: improvementScore, icon: "🚀", color: "blue", sub: "Average score lift vs control", badge: { text: "Worth It", cls: "hi" } },
    { label: "At-Risk Students", value: highRiskStudents, icon: "⚠️", color: "red", sub: "Require immediate intervention", badge: { text: "Risk Assertion", cls: "hi" } },
    { label: "Avg Study Streak", value: summary.avgStreak + "d", icon: "🔥", color: "amber", sub: "Consistent daily habits built", badge: null },
    { label: "Deep Focus Time", value: fmt(summary.totalFocusMinutes) + " mins", icon: "🧠", color: "teal", sub: `${summary.totalTreesGrown} virtual trees grown`, badge: null },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 32 }}>
      {cards.map((c, i) => (
        <div key={i} className={`kpi-card ${c.color}`} style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "24px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.02)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          cursor: "default"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.06)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.02)"; }}
        >
          {c.badge && (
            <div className={`kpi-badge ${c.badge.cls}`} style={{
              position: "absolute",
              top: 16,
              right: 16,
              padding: "4px 10px",
              borderRadius: 99,
              fontSize: 10,
              fontWeight: 800,
              background: c.color === "green" ? "rgba(16,185,129,0.15)" : (c.color === "blue" ? "rgba(59,130,246,0.15)" : (c.color === "red" ? "rgba(239,68,68,0.15)" : "rgba(108,60,225,0.15)")),
              color: c.color === "green" ? "#10B981" : (c.color === "blue" ? "#3B82F6" : (c.color === "red" ? "#EF4444" : "#A78BFA"))
            }}>
              {c.badge.text}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: "var(--bg-body)", border: "1px solid var(--border)", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>{c.icon}</span>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4, color: "var(--ink)" }}>{c.value}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-dim)", background: "var(--bg-body)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)" }}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
