import React from "react";

interface GroupStats {
  count: number;
  avgXp: number;
  avgLessons: number;
  avgStreak: number;
  avgFocusMinutes: number;
}

interface GamificationImpactProps {
  impact: {
    badgeHolders: GroupStats;
    nonBadgeHolders: GroupStats;
  };
}

export function GamificationImpactPanel({ impact }: GamificationImpactProps) {
  if (!impact || !impact.badgeHolders) return null;

  const wb = impact.badgeHolders;
  const wob = impact.nonBadgeHolders;

  const xpLift = wob.avgXp > 0 ? Math.round(((wb.avgXp - wob.avgXp) / wob.avgXp) * 100) : 0;

  function metricRow(name: string, val: number, compVal: number) {
    const lift = compVal > 0 ? Math.round(((val - compVal) / compVal) * 100) : 0;
    const showLift = lift !== 0;
    return (
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
        <span style={{ color: "var(--ink-muted)", fontSize: 13 }}>{name}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>{val.toLocaleString()}</span>
          {showLift && lift > 0 ? (
            <span style={{ fontSize: 10, fontWeight: 900, background: "rgba(16,185,129,0.1)", color: "#10B981", padding: "2px 6px", borderRadius: 4 }}>
              +{lift}%
            </span>
          ) : null}
        </span>
      </div>
    );
  }

  return (
    <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>🏆 Gamification Impact Matrix</h4>
          <p style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>Core comparison of Highly Gamified students vs. Control Group.</p>
        </div>
        <span style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.25)", padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800 }}>
          +{xpLift}% XP Lift from Gamification
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        {/* With Badges */}
        <div style={{ background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 18 }}>
          <h5 style={{ color: "#10B981", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>🟢 Students With Badges</h5>
          <div>
            {metricRow("Avg XP", wb.avgXp, wob.avgXp)}
            {metricRow("Avg Lessons", wb.avgLessons, wob.avgLessons)}
            {metricRow("Avg Streak", wb.avgStreak, wob.avgStreak)}
            {metricRow("Avg Focus (min)", wb.avgFocusMinutes, wob.avgFocusMinutes)}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
              <span style={{ color: "var(--ink-muted)", fontSize: 13 }}>Cohort Size</span>
              <strong style={{ fontSize: 14 }}>{wb.count} students</strong>
            </div>
          </div>
        </div>

        {/* Without Badges */}
        <div style={{ background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 18 }}>
          <h5 style={{ color: "var(--ink-muted)", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>⚪ Students Without Badges</h5>
          <div>
            {metricRow("Avg XP", wob.avgXp, 0)}
            {metricRow("Avg Lessons", wob.avgLessons, 0)}
            {metricRow("Avg Streak", wob.avgStreak, 0)}
            {metricRow("Avg Focus (min)", wob.avgFocusMinutes, 0)}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
              <span style={{ color: "var(--ink-muted)", fontSize: 13 }}>Cohort Size</span>
              <strong style={{ fontSize: 14 }}>{wob.count} students</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
