import React from "react";
import { getToken } from "../../services/api";
import { ResearchKPIs } from "./components/ResearchKPIs";
import { HypothesisPanel } from "./components/HypothesisPanel";
import { MLDiagnosticsPanel } from "./components/MLDiagnosticsPanel";
import { ScatterChart } from "./components/ScatterChart";
import { EngagementCharts, XPTrendChart, ActiveStudentsChart, RiskDistributionChart } from "./components/EngagementCharts";
import { ChartModal } from "./components/ChartModal";
import { StudentEvaluation } from "./components/StudentEvaluation";

export default function ResearchAnalytics() {
  const [data, setData] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedChart, setExpandedChart] = React.useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      const res = await fetch("/api/project", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error("Access denied. Super Admin role required.");
        throw new Error(`Server returned ${res.status}`);
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const exportCSV = () => {
    if (!data || !data.mlStudents || data.mlStudents.length === 0) {
      alert("No data available to export.");
      return;
    }
    let csv = "ID,Name,Avatar,XP,Streak,Academic Accuracy (%),Consistency (%),Focus Minutes,Lessons Completed,Badges Earned,Disengagement Risk,Disengagement Probability (%),Next Quiz Success Probability (%),Flow Zone State,AI Recommendation\n";
    data.mlStudents.forEach((s: any) => {
      const cleanName = s.name.replace(/"/g, '""');
      const cleanRec = s.recommendation.replace(/"/g, '""').replace(/\n/g, " ");
      csv += `"${s.id}","${cleanName}","${s.avatar}",${s.xp},${s.streak},${s.accuracy},${s.consistency},${s.focusMinutes},${s.lessonsCount},${s.badgesCount},"${s.risk}",${s.disengagementProb},${s.successProb},"${s.flowState}","${cleanRec}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `academia_io_research_dataset_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--brand)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: "var(--ink-muted)", fontSize: 14, fontWeight: 500 }}>Fetching live thesis analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 48, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius)", color: "#EF4444" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Thesis Analytics Connection Failed</div>
        <div style={{ fontSize: 14, opacity: 0.8 }}>{error}</div>
        <button className="btn" onClick={loadData} style={{ marginTop: 20, background: "#EF4444" }}>Retry Connection</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "8px 0", animation: "fadeInUp 0.4s ease-out both" }}>
      {/* Cockpit Header */}
      <div className="card" style={{ padding: 28, background: "linear-gradient(135deg, rgba(108, 60, 225, 0.04) 0%, rgba(59, 130, 246, 0.04) 100%)", border: "1.5px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="live-badge thesis" style={{ background: "rgba(108, 60, 225, 0.12)", color: "#A78BFA", border: "1px solid rgba(108, 60, 225, 0.25)", padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                📚 Thesis Research
              </span>
              <span className="live-badge live" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                Secure Data
              </span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginTop: 12, letterSpacing: "-0.03em" }}>Student Engagement & Gamification Analytics</h1>
            <p style={{ fontSize: 15, color: "var(--ink-muted)", marginTop: 8, maxWidth: 720, lineHeight: 1.6 }}>
              Live research console tracking how streaks, badges, and focus sessions affect learning outcomes. Focus is restricted to gamification impact analysis and academic performance correlations.
            </p>
          </div>
          <button className="btn primary" onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", fontSize: 13, background: "#3B82F6", color: "#ffffff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 800, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.5)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)"; }}>
            <span style={{ fontSize: 16 }}>📥</span> Export Thesis Dataset
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <ResearchKPIs summary={data.summary} />

      {/* Thesis Hypothesis Testing Panel */}
      <HypothesisPanel stats={data.hypothesisStats} />

      {/* Scikit-Learn ML Model Validation Diagnostics */}
      <MLDiagnosticsPanel />


      {/* Visualizations: Scatter Plot & Trend Line Side-by-Side */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: 24 }}>
        <ScatterChart students={data.mlStudents} onExpand={() => setExpandedChart("scatter")} />
        
        <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, cursor: "pointer", transition: "transform 0.2s", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)", display: "flex", flexDirection: "column" }} onClick={() => setExpandedChart("xp")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--ink)", letterSpacing: "-0.01em" }}>Experience Points (XP) Trend</h4>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 6, lineHeight: 1.5 }}>
                Evaluates the daily XP generation rate over the last 14 days.
              </p>
            </div>
            <button className="btn primary" style={{ fontSize: 12, padding: "8px 16px", borderRadius: 99, display: "flex", alignItems: "center", gap: 8, background: "#3B82F6", color: "#ffffff", border: "none", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <span style={{ fontSize: 14 }}>🔍</span> Expand
            </button>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%", height: 240 }}>
              <XPTrendChart data={data.engagementOverTime} isZoomed={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Minor Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
        <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, cursor: "pointer", transition: "transform 0.2s" }} onClick={() => setExpandedChart("active")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>📈 Active Daily Students</h4>
            <span style={{ fontSize: 11, color: "#3B82F6", fontWeight: 800 }}>🔍 Zoom Chart</span>
          </div>
          <div style={{ height: 260 }}>
            <ActiveStudentsChart data={data.engagementOverTime} />
          </div>
        </div>

        <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>⚠️ Machine Learning Risk Cohorts</h4>
          </div>
          <div style={{ height: 260 }}>
            <RiskDistributionChart students={data.mlStudents} />
          </div>
        </div>
      </div>

      {/* Student Evaluation Tiers */}
      <StudentEvaluation students={data.mlStudents} />

      {/* Chart Modals */}
      <ChartModal
        isOpen={expandedChart === "scatter"}
        onClose={() => setExpandedChart(null)}
        chartTitle="Correlation: Gamification Index vs. Academic Accuracy"
        chartDesc="Interactive 2D map comparing gamification indices against quiz accuracy."
        researchQuestion="What are the primary motivational barriers students face, and does replacing static tools with interactive feedback loops boost participation?"
        hypothesisMapping="Outcome: Students actively engaged in gamified loops (badges, streaks) show a mathematically verified accuracy lift compared to static learners."
        implications="Gamification acts as an immediate incentive feedback loop. High streaks and badges correlate directly with an upward shift in academic accuracy, proving that active participation reduces learning isolation."
      >
        <div style={{ width: "100%", height: "100%" }}>
          <ScatterChart students={data.mlStudents} onExpand={() => { }} isModal={true} />
        </div>
      </ChartModal>

      <ChartModal
        isOpen={expandedChart === "xp"}
        onClose={() => setExpandedChart(null)}
        chartTitle="XP Accumulation Trend (Zoomed)"
        chartDesc="Evaluates the daily XP generation rate over the last 14 days."
        researchQuestion="Does active visual feedback increase engagement?"
        hypothesisMapping="Outcome: Consistent XP climb shows high ongoing learning interaction compared to flat historical controls."
        implications="Daily streaks promote consistent behavior patterns, establishing high study frequencies."
      >
        <div style={{ width: "100%", height: "100%", padding: 10 }}>
          <XPTrendChart data={data.engagementOverTime} isZoomed={true} />
        </div>
      </ChartModal>

      <ChartModal
        isOpen={expandedChart === "active"}
        onClose={() => setExpandedChart(null)}
        chartTitle="Active User Trends (Zoomed)"
        chartDesc="Visualizes student logins and active study days."
        researchQuestion="Does system design keep students in safe daily zones?"
        hypothesisMapping="Outcome: Stable active user volumes indicate high consistency without extreme hourly spikes."
        implications="Helps developers verify that engagement design does not encourage addictive midnight grinds."
      >
        <div style={{ width: "100%", height: "100%", padding: 10 }}>
          <ActiveStudentsChart data={data.engagementOverTime} isZoomed={true} />
        </div>
      </ChartModal>
    </div>
  );
}
