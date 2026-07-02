import React from "react";

interface EngagementDay {
  date: string;
  xp: number;
  active: number;
}

interface EngagementChartsProps {
  data: EngagementDay[];
  onExpand: (type: string) => void;
}

export function XPTrendChart({ data, isZoomed = false }: { data: EngagementDay[], isZoomed?: boolean }) {
  if (!data || data.length === 0) return null;
  const xpValues = data.map(d => d.xp);
  const maxXp = Math.max(...xpValues, 100);

  const width = isZoomed ? 700 : 450;
  const height = isZoomed ? 260 : 160;
  const padLeft = 45;
  const padBottom = 30;
  const chartW = width - padLeft - 15;
  const chartH = height - padBottom - 15;

  const xpPoints = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartW;
    const y = 15 + (1 - d.xp / maxXp) * chartH;
    return { x, y, val: d.xp, date: d.date };
  });

  const xpPath = xpPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const xpAreaPath = `${xpPath} L ${xpPoints[xpPoints.length - 1].x} ${height - padBottom} L ${xpPoints[0].x} ${height - padBottom} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%", overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
        const y = 15 + p * chartH;
        const val = Math.round(maxXp * (1 - p));
        return (
          <g key={idx}>
            <line x1={padLeft} y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            <text x={padLeft - 8} y={y + 4} fill="var(--ink-dim)" fontSize={isZoomed ? 9 : 8} textAnchor="end">{val}</text>
          </g>
        );
      })}
      <path d={xpAreaPath} fill="url(#xpGrad)" />
      <path d={xpPath} fill="none" stroke="#8B5CF6" strokeWidth={2.5} />
      {xpPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={isZoomed ? 4.5 : 3} fill="#8B5CF6" stroke="#fff" strokeWidth={isZoomed ? 1.5 : 0} />
      ))}
      {xpPoints.filter((_, i) => i % (isZoomed ? 2 : 3) === 0).map((p, i) => (
        <text key={i} x={p.x} y={height - 10} fill="var(--ink-dim)" fontSize={isZoomed ? 9 : 8} textAnchor="middle">
          {p.date.split("-")[2]}/{p.date.split("-")[1]}
        </text>
      ))}
    </svg>
  );
}

export function ActiveStudentsChart({ data, isZoomed = false }: { data: EngagementDay[], isZoomed?: boolean }) {
  if (!data || data.length === 0) return null;
  const activeValues = data.map(d => d.active);
  const maxActive = Math.max(...activeValues, 10);

  const width = isZoomed ? 700 : 450;
  const height = isZoomed ? 260 : 240;
  const padLeft = 45;
  const padBottom = 30;
  const chartW = width - padLeft - 15;
  const chartH = height - padBottom - 15;

  const xpPoints = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartW;
    return { x, date: d.date };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%", overflow: "visible", display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
        const y = 15 + p * chartH;
        const val = Math.round(maxActive * (1 - p));
        return (
          <g key={idx}>
            <line x1={padLeft} y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            <text x={padLeft - 8} y={y + 4} fill="var(--ink-dim)" fontSize={isZoomed ? 9 : 8} textAnchor="end">{val}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const barW = Math.max(isZoomed ? 16 : 8, chartW / data.length - (isZoomed ? 12 : 6));
        const x = padLeft + (i / data.length) * chartW + (isZoomed ? 6 : 3);
        const barH = (d.active / maxActive) * chartH;
        const y = height - padBottom - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill="#10B981" rx={isZoomed ? 3 : 2} fillOpacity={0.8} />
          </g>
        );
      })}
      {xpPoints.filter((_, i) => i % (isZoomed ? 2 : 3) === 0).map((p, i) => (
        <text key={i} x={p.x} y={height - 10} fill="var(--ink-dim)" fontSize={isZoomed ? 9 : 8} textAnchor="middle">
          {p.date.split("-")[2]}/{p.date.split("-")[1]}
        </text>
      ))}
    </svg>
  );
}

export function EngagementCharts({ data, onExpand }: EngagementChartsProps) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
      <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, cursor: "pointer", transition: "transform 0.2s" }} onClick={() => onExpand("xp")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>⚡ Experience Points (XP) Trend</h4>
          <span style={{ fontSize: 11, color: "var(--brand-2)", fontWeight: 700 }}>🔍 Zoom Chart</span>
        </div>
        <div style={{ height: 160 }}>
          <XPTrendChart data={data} />
        </div>
      </div>
      <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, cursor: "pointer", transition: "transform 0.2s" }} onClick={() => onExpand("active")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>📈 Active Daily Students</h4>
          <span style={{ fontSize: 11, color: "var(--brand-2)", fontWeight: 700 }}>🔍 Zoom Chart</span>
        </div>
        <div style={{ height: 160 }}>
          <ActiveStudentsChart data={data} />
        </div>
      </div>
    </div>
  );
}

export function RiskDistributionChart({ students }: { students: any[] }) {
  if (!students || students.length === 0) return null;
  const low = students.filter(s => s.risk === "Low").length;
  const medium = students.filter(s => s.risk === "Medium").length;
  const high = students.filter(s => s.risk === "High").length;
  const max = Math.max(low, medium, high, 1);
  
  return (
    <svg viewBox="0 0 450 240" style={{ width: "100%", height: "100%", display: "block" }}>
      <text x={10} y={60} fill="var(--ink)" fontSize="14" fontWeight="600">Low Risk</text>
      <rect x={110} y={42} width={Math.max((low/max)*280, 5)} height={24} fill="#10B981" rx={4} fillOpacity={0.85} />
      <text x={120 + Math.max((low/max)*280, 5)} y={60} fill="var(--ink-dim)" fontSize="14">{low} Students</text>
      
      <text x={10} y={115} fill="var(--ink)" fontSize="14" fontWeight="600">Medium Risk</text>
      <rect x={110} y={97} width={Math.max((medium/max)*280, 5)} height={24} fill="#F59E0B" rx={4} fillOpacity={0.85} />
      <text x={120 + Math.max((medium/max)*280, 5)} y={115} fill="var(--ink-dim)" fontSize="14">{medium} Students</text>
      
      <text x={10} y={170} fill="var(--ink)" fontSize="14" fontWeight="600">High Risk</text>
      <rect x={110} y={152} width={Math.max((high/max)*280, 5)} height={24} fill="#EF4444" rx={4} fillOpacity={0.85} />
      <text x={120 + Math.max((high/max)*280, 5)} y={170} fill="var(--ink-dim)" fontSize="14">{high} Students</text>
    </svg>
  );
}
