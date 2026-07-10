import React from "react";

interface Badge {
  name: string;
  icon: string;
  count: number;
}

interface TopBadgesGridProps {
  badges: Badge[];
}

export function TopBadgesGrid({ badges }: TopBadgesGridProps) {
  if (!badges || badges.length === 0) {
    return (
      <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, marginTop: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🏅 Top Badges Awarded</h4>
        <p style={{ color: "var(--ink-dim)", fontSize: 13 }}>No badges earned yet.</p>
      </div>
    );
  }

  return (
    <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, marginTop: 24 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🏅 Top Badges Awarded</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {badges.map((b, i) => (
          <div key={i} className="badge-chip" style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
            background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)"
          }}>
            <span style={{ fontSize: 24 }}>{b.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{b.name}</div>
              <div style={{ fontSize: 11, color: "var(--ink-dim)" }}>{b.count} student{b.count !== 1 ? "s" : ""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
