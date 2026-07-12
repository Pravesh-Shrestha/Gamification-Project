import React from "react";

export function StudentEvaluation({ students }: { students: any[] }) {
  if (!students || students.length === 0) return null;

  const highPerformers = students.filter(s => s.risk === "Low");
  const mediumPerformers = students.filter(s => s.risk === "Medium");
  const atRisk = students.filter(s => s.risk === "High");

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: 32,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>Student Performance Evaluation</h3>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 4 }}>Categorizing students into performance tiers to identify who needs immediate guidance.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        <TierColumn title="High Performers" students={highPerformers} color="#10B981" bg="rgba(16,185,129,0.05)" icon="🌟" />
        <TierColumn title="Needs Monitoring" students={mediumPerformers} color="#F59E0B" bg="rgba(245,158,11,0.05)" icon="👀" />
        <TierColumn title="Requires Attention" students={atRisk} color="#EF4444" bg="rgba(239,68,68,0.05)" icon="⚠️" />
      </div>
    </div>
  );
}

function TierColumn({ title, students, color, bg, icon }: any) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}40`, borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: 0 }}>{title} ({students.length})</h4>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 400, overflowY: "auto", paddingRight: 8 }}>
        {students.slice(0, 10).map((s: any, i: number) => (
          <div key={i} style={{ background: "var(--bg-card)", padding: 12, borderRadius: 8, border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <strong style={{ fontSize: 13, color: "var(--ink)" }}>{s.name}</strong>
              <span style={{ fontSize: 11, fontWeight: 700, color }}>{s.accuracy}% Acc</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 8 }}>Streak: {s.streak}d | Focus: {s.focusMinutes}m</div>
            <div style={{ fontSize: 11, background: "var(--bg-body)", padding: "6px 8px", borderRadius: 4, color: "var(--ink-dim)", fontStyle: "italic" }}>
              💡 {s.recommendation}
            </div>
          </div>
        ))}
        {students.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-muted)", textAlign: "center", padding: 20 }}>No students in this tier.</div>}
        {students.length > 10 && <div style={{ fontSize: 12, color: "var(--brand)", textAlign: "center", cursor: "pointer", fontWeight: 600 }}>+ {students.length - 10} more</div>}
      </div>
    </div>
  );
}
