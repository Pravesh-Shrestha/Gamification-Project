import React from "react";

interface Student {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  accuracy: number;
  consistency: number;
  focusMinutes: number;
  lessonsCount: number;
  badgesCount: number;
  risk: "Low" | "Medium" | "High";
  successProb: number;
  flowState: string;
  recommendation: string;
}

interface InterventionCockpitProps {
  students: Student[];
}

export function InterventionCockpit({ students }: InterventionCockpitProps) {
  const [search, setSearch] = React.useState("");
  const [riskFilter, setRiskFilter] = React.useState("");
  const [flowFilter, setFlowFilter] = React.useState("");

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = !riskFilter || s.risk === riskFilter;
    const matchesFlow = !flowFilter || 
                        (flowFilter === "Flow" && s.flowState.startsWith("Flow")) ||
                        (flowFilter === "Anxiety" && s.flowState.startsWith("Anxiety")) ||
                        (flowFilter === "Boredom" && s.flowState.startsWith("Boredom"));
    return matchesSearch && matchesRisk && matchesFlow;
  });

  const getRiskClass = (risk: string) => {
    if (risk === "High") return "red";
    if (risk === "Medium") return "yellow";
    return "green";
  };

  const getFlowColor = (flow: string) => {
    if (flow.includes("Anxiety")) return "#EF4444";
    if (flow.includes("Boredom")) return "#F59E0B";
    return "#10B981";
  };

  return (
    <div className="chart-card" style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: 24,
      marginTop: 24
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>🔍 Student Intervention & Guidance Cockpit</h4>
          <p style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
            Real-time diagnostic cockpit. Filter and locate vulnerable students needing pedagogical assistance.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search students by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, background: "var(--bg-card2)", border: "1px solid var(--border)",
            color: "var(--ink)", padding: "10px 16px", borderRadius: "var(--radius-sm)", outline: "none", fontSize: 13
          }}
        />
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          style={{
            background: "var(--bg-card2)", border: "1px solid var(--border)", color: "var(--ink)",
            padding: "10px 16px", borderRadius: "var(--radius-sm)", outline: "none", fontSize: 13
          }}
        >
          <option value="">All Risk Tiers</option>
          <option value="High">🚨 High Risk</option>
          <option value="Medium">⚠️ Medium Risk</option>
          <option value="Low">✅ Low Risk</option>
        </select>
        <select
          value={flowFilter}
          onChange={(e) => setFlowFilter(e.target.value)}
          style={{
            background: "var(--bg-card2)", border: "1px solid var(--border)", color: "var(--ink)",
            padding: "10px 16px", borderRadius: "var(--radius-sm)", outline: "none", fontSize: 13
          }}
        >
          <option value="">All Flow Zones</option>
          <option value="Flow">🌊 Flow Zone</option>
          <option value="Anxiety">⚠️ Anxiety (Over-challenged)</option>
          <option value="Boredom">😴 Boredom (Under-challenged)</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ maxHeight: 360, overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
        <table className="leaderboard-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ background: "var(--bg-card2)", color: "var(--ink-muted)", fontSize: 11, textTransform: "uppercase" }}>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Student</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Risk Level</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Success Probability</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Flow State</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Quiz Accuracy</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>AI Companion Intervention Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{s.name}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span className={`pill ${getRiskClass(s.risk)}`}>{s.risk} Risk</span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div className="xp-bar-wrap" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="xp-bar" style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                      <div className="xp-bar-fill" style={{
                        height: "100%", width: `${s.successProb}%`,
                        background: s.successProb > 75 ? "#10B981" : s.successProb > 45 ? "#F59E0B" : "#EF4444", borderRadius: 99
                      }} />
                    </div>
                    <span className="xp-val" style={{ fontSize: 13, fontWeight: 700, minWidth: 32 }}>{s.successProb}%</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: getFlowColor(s.flowState) }}>{s.flowState}</td>
                <td style={{ padding: "12px 16px", fontFamily: "var(--mono)", fontWeight: 700 }}>{s.accuracy}%</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.4, maxWidth: 300, whiteSpace: "normal" }}>
                  {s.recommendation}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--ink-dim)" }}>
                  No students match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
