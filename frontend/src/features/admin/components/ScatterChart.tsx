import React from "react";

interface Student {
  id: string;
  name: string;
  accuracy: number;
  streak: number;
  focusMinutes: number;
  badgesCount: number;
  risk: "Low" | "Medium" | "High";
  successProb: number;
  flowState: string;
  recommendation: string;
}

interface ScatterChartProps {
  students: Student[];
  onExpand: () => void;
  isModal?: boolean;
}

export function ScatterChart({ students, onExpand, isModal = false }: ScatterChartProps) {
  const [hovered, setHovered] = React.useState<any | null>(null);

  // Compute boundaries
  const mappedPoints = students.map(s => {
    const xVal = s.streak * 15 + s.focusMinutes + s.badgesCount * 40;
    const yVal = s.accuracy;
    return { x: xVal, y: yVal, student: s };
  });

  const rawMaxX = Math.max(...mappedPoints.map(p => p.x), 100);
  const maxX = Math.max(100, rawMaxX * 1.12);
  const minX = 0;
  const maxY = 100;
  const minY = 0;

  const width = 600;
  const height = 300;
  const paddingLeft = 55;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 55;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getCanvasCoords = (x: number, y: number) => {
    const cx = paddingLeft + (Math.min(maxX, Math.max(minX, x)) / maxX) * chartW;
    const cy = paddingTop + (1 - Math.min(maxY, Math.max(minY, y)) / maxY) * chartH;
    return { cx, cy };
  };

  const getRiskColor = (risk: string) => {
    if (risk === "High") return "#EF4444";
    if (risk === "Medium") return "#F59E0B";
    return "#10B981";
  };

  return (
    <div className="chart-card" style={{
      background: isModal ? "transparent" : "var(--bg-card)",
      border: isModal ? "none" : "1px solid var(--border)",
      borderRadius: isModal ? 0 : "var(--radius)",
      padding: isModal ? 0 : 32,
      position: "relative",
      cursor: isModal ? "default" : "pointer",
      boxShadow: isModal ? "none" : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
      display: "flex", flexDirection: "column"
    }} onClick={() => {
      if (!isModal) onExpand();
    }}>
      {!isModal && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h4 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--ink)", letterSpacing: "-0.01em" }}>Gamification Index vs. Academic Accuracy</h4>
            <p style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 6, lineHeight: 1.5 }}>
              Visualizing the correlation between high gamification engagement (streaks, focus time, badges) and academic quiz accuracy.
            </p>
          </div>
          <button className="btn primary" style={{ fontSize: 12, padding: "8px 16px", borderRadius: 99, display: "flex", alignItems: "center", gap: 8, background: "#3B82F6", color: "#ffffff", border: "none", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
            <span style={{ fontSize: 14 }}>🔍</span> Expand
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative", width: "100%" }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", aspectRatio: `${width} / ${height}`, overflow: "visible", display: "block" }}>
          <defs>
            <linearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.05)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
            </linearGradient>
          </defs>
          
          <rect x={paddingLeft} y={paddingTop} width={chartW} height={chartH} fill="url(#chartBg)" rx={4} />

          {/* Grid lines */}
          {[20, 40, 60, 80, 100].map((yVal) => {
            const { cy } = getCanvasCoords(0, yVal);
            return (
              <g key={yVal}>
                <line x1={paddingLeft} y1={cy} x2={width - paddingRight} y2={cy} stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="4 4" />
                <text x={paddingLeft - 12} y={cy + 4} fill="var(--ink-dim)" fontSize={10} fontWeight={600} textAnchor="end">{yVal}%</text>
              </g>
            );
          })}

          {/* X Axis Ticks */}
          {[0, Math.round(maxX / 2), Math.round(maxX)].map((xVal) => {
            const { cx } = getCanvasCoords(xVal, 0);
            return (
              <g key={xVal}>
                <line x1={cx} y1={paddingTop} x2={cx} y2={height - paddingBottom} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                <text x={cx} y={height - paddingBottom + 20} fill="var(--ink-dim)" fontSize={10} fontWeight={600} textAnchor="middle">{xVal}</text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeLinecap="round" />
          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeLinecap="round" />

          {/* Axis Labels */}
          <text x={- (paddingTop + chartH / 2)} y={15} transform="rotate(-90)" fill="var(--ink-muted)" fontSize={11} fontWeight={800} textAnchor="middle" letterSpacing="0.05em">ACADEMIC ACCURACY (%)</text>
          <text x={paddingLeft + chartW / 2} y={height - 10} fill="var(--ink-muted)" fontSize={11} fontWeight={800} textAnchor="middle" letterSpacing="0.05em">GAMIFICATION INDEX SCORE</text>

          {/* Dots */}
          {mappedPoints.map((pt, i) => {
            const { cx, cy } = getCanvasCoords(pt.x, pt.y);
            const isHovered = hovered && hovered.id === pt.student.id;
            const color = getRiskColor(pt.student.risk);
            return (
              <g key={i}>
                {isHovered && <circle cx={cx} cy={cy} r={16} fill={color} fillOpacity={0.2} style={{ transition: "r 0.2s ease" }} />}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 8 : 6}
                  fill={color}
                  fillOpacity={isHovered ? 1 : 0.8}
                  stroke={isHovered ? "#fff" : "rgba(255,255,255,0.2)"}
                  strokeWidth={isHovered ? 3 : 1}
                  style={{ transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)", cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setHovered({ ...pt.student, cx, cy });
                  }}
                  onMouseLeave={() => setHovered(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpand();
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Custom Tooltip */}
        {hovered && (
          <div style={{
            position: "absolute",
            left: Math.min(width - 200, hovered.cx + 15),
            top: Math.min(height - 150, hovered.cy - 15),
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "16px",
            color: "#fff",
            fontSize: 13,
            zIndex: 10,
            pointerEvents: "none",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5), 0 0 15px rgba(59, 130, 246, 0.2)",
            backdropFilter: "blur(8px)",
            width: 220,
            transform: "translateY(-50%)",
            transition: "all 0.1s ease"
          }}>
            <strong style={{ display: "block", fontSize: 15, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8, marginBottom: 8 }}>{hovered.name}</strong>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "var(--ink-muted)" }}>Accuracy:</span> <strong>{hovered.accuracy}%</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "var(--ink-muted)" }}>Active Streak:</span> <strong>{hovered.streak}d</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "var(--ink-muted)" }}>Focus Time:</span> <strong>{hovered.focusMinutes}m</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
              <span style={{ color: "var(--ink-muted)" }}>Risk Profile:</span> 
              <span style={{ color: getRiskColor(hovered.risk), fontWeight: 800 }}>{hovered.risk}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
