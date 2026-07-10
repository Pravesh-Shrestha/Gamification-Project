import React from "react";

interface Bucket {
  label: string;
  count: number;
}

interface LevelCount {
  level: number;
  count: number;
}

interface StreakDist {
  noStreak: number;
  oneToThree: number;
  fourToSeven: number;
  eightPlus: number;
}

interface DistributionChartsProps {
  xpDist: Bucket[];
  streakDist: StreakDist;
  levelDist: LevelCount[];
  onExpand: (type: string) => void;
}

export function DistributionCharts({ xpDist, streakDist, levelDist, onExpand }: DistributionChartsProps) {
  const maxXPCount = Math.max(...xpDist.map(b => b.count), 1);
  const maxLvlCount = Math.max(...levelDist.map(l => l.count), 1);

  // SVG parameters
  const width = 450;
  const height = 160;
  const padLeft = 40;
  const padBottom = 35;
  const chartW = width - padLeft - 10;
  const chartH = height - padBottom - 10;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginTop: 20 }}>
      {/* XP Distribution */}
      <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, cursor: "pointer" }} onClick={() => onExpand("xpDist")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>📊 XP Distribution</h4>
          <span style={{ fontSize: 10, color: "var(--brand-2)", fontWeight: 700 }}>🔍 Zoom</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", aspectRatio: `${width} / ${height}`, overflow: "visible", display: "block" }}>
          {/* Grid lines */}
          {[0, 0.5, 1].map((p, idx) => {
            const y = 10 + p * chartH;
            const val = Math.round(maxXPCount * (1 - p));
            return (
              <g key={idx}>
                <line x1={padLeft} y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                <text x={padLeft - 8} y={y + 4} fill="var(--ink-dim)" fontSize={8} textAnchor="end">{val}</text>
              </g>
            );
          })}
          {/* Bars */}
          {xpDist.map((b, i) => {
            const barW = chartW / xpDist.length - 8;
            const x = padLeft + (i / xpDist.length) * chartW + 4;
            const barH = (b.count / maxXPCount) * chartH;
            const y = height - padBottom - barH;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={barH} fill="#A78BFA" rx={3} fillOpacity={0.8} />
                <text x={x + barW / 2} y={height - 10} fill="var(--ink-dim)" fontSize={8} textAnchor="middle">{b.label}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Streak Distribution */}
      <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, cursor: "pointer" }} onClick={() => onExpand("streakDist")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>🔥 Streak Milestones</h4>
          <span style={{ fontSize: 10, color: "var(--brand-2)", fontWeight: 700 }}>🔍 Zoom</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", height: chartH + 10 }}>
          {/* Ring Chart */}
          <div style={{ position: "relative", width: 90, height: 90 }}>
            <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              {/* Simplified nested arcs or segments */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray={`${Math.min(100, Math.round(((streakDist.eightPlus || 0) / (streakDist.noStreak + streakDist.oneToThree + streakDist.fourToSeven + streakDist.eightPlus || 1)) * 100))} 100`} />
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 11, fontWeight: 800 }}>
              🔥 {streakDist.eightPlus}
            </div>
          </div>
          <div style={{ flex: 1, display: "grid", gap: 6, fontSize: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-muted)" }}>8+ Days:</span>
              <strong style={{ color: "#F59E0B" }}>{streakDist.eightPlus} students</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-muted)" }}>4-7 Days:</span>
              <strong style={{ color: "#8B5CF6" }}>{streakDist.fourToSeven} students</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-muted)" }}>1-3 Days:</span>
              <strong style={{ color: "#3B82F6" }}>{streakDist.oneToThree} students</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-muted)" }}>No Streak:</span>
              <strong style={{ color: "#6B7280" }}>{streakDist.noStreak} students</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Level Distribution */}
      <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, cursor: "pointer" }} onClick={() => onExpand("levelDist")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>🎖️ Level Distribution</h4>
          <span style={{ fontSize: 10, color: "var(--brand-2)", fontWeight: 700 }}>🔍 Zoom</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", aspectRatio: `${width} / ${height}`, overflow: "visible", display: "block" }}>
          {/* Grid lines */}
          {[0, 0.5, 1].map((p, idx) => {
            const y = 10 + p * chartH;
            const val = Math.round(maxLvlCount * (1 - p));
            return (
              <g key={idx}>
                <line x1={padLeft} y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                <text x={padLeft - 8} y={y + 4} fill="var(--ink-dim)" fontSize={8} textAnchor="end">{val}</text>
              </g>
            );
          })}
          {/* Bars */}
          {levelDist.slice(0, 7).map((l, i) => {
            const barW = chartW / Math.min(levelDist.length, 7) - 8;
            const x = padLeft + (i / Math.min(levelDist.length, 7)) * chartW + 4;
            const barH = (l.count / maxLvlCount) * chartH;
            const y = height - padBottom - barH;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={barH} fill="#3B82F6" rx={3} fillOpacity={0.8} />
                <text x={x + barW / 2} y={height - 10} fill="var(--ink-dim)" fontSize={8} textAnchor="middle">Lv {l.level}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
