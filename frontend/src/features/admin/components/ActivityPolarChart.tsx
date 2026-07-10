import React from "react";

interface Activity {
  kind: string;
  count: number;
}

interface ActivityPolarChartProps {
  data: Activity[];
}

export function ActivityPolarChart({ data }: ActivityPolarChartProps) {
  const actData = data.filter(a => a.count > 0);
  const maxVal = Math.max(...actData.map(d => d.count), 1);

  const actLabels: Record<string, string> = {
    lesson_complete: "📚 Lesson",
    focus_complete: "🌱 Focus",
    badge_earned: "🏅 Badge",
    streak_milestone: "🔥 Streak",
  };

  const colors = [
    "#8B5CF6", // Purple
    "#10B981", // Green
    "#F59E0B", // Orange
    "#3B82F6", // Blue
  ];

  const center = 90;
  const maxRadius = 70;

  return (
    <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px 0", alignSelf: "flex-start" }}>📊 Platform Activity Breakdown</h4>
      <div style={{ display: "flex", gap: 20, alignItems: "center", width: "100%", justifyContent: "space-around" }}>
        <svg viewBox="0 0 180 180" style={{ width: "100%", height: "auto", maxWidth: 140, aspectRatio: "1 / 1", display: "block" }}>
          {/* Concentric rings */}
          {[0.25, 0.5, 0.75, 1.0].map((r, i) => (
            <circle key={i} cx={center} cy={center} r={maxRadius * r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
          ))}
          {/* Custom sectors */}
          {actData.map((d, i) => {
            const angleStep = 360 / actData.length;
            const startAngle = i * angleStep;
            const endAngle = (i + 1) * angleStep;
            const radius = (d.count / maxVal) * maxRadius;

            // Coordinate helpers
            const rad = (deg: number) => (deg - 90) * (Math.PI / 180);
            const x1 = center + radius * Math.cos(rad(startAngle));
            const y1 = center + radius * Math.sin(rad(startAngle));
            const x2 = center + radius * Math.cos(rad(endAngle));
            const y2 = center + radius * Math.sin(rad(endAngle));

            const largeArc = angleStep > 180 ? 1 : 0;
            const pathData = `
              M ${center} ${center}
              L ${x1} ${y1}
              A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
              Z
            `;

            return (
              <path
                key={i}
                d={pathData}
                fill={colors[i % colors.length]}
                fillOpacity={0.65}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div style={{ display: "grid", gap: 8, fontSize: 11 }}>
          {actData.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i % colors.length] }} />
              <span style={{ color: "var(--ink-muted)" }}>{actLabels[d.kind] || d.kind}:</span>
              <strong>{d.count.toLocaleString()}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
