import React from "react";
import { getToken } from "../../../services/api";

export function MLDiagnosticsPanel() {
  const [metrics, setMetrics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/analytics/ml-metrics", {
      headers: { "Authorization": `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) setMetrics(json.data);
      })
      .catch(err => console.error("Failed to load ML metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 20, textAlign: "center", color: "var(--ink-muted)" }}>Loading ML Model Diagnostics...</div>;
  if (!metrics || !metrics.classification) return null;

  const cls = metrics.classification;
  const reg = metrics.regression || {};
  const featMap = cls.feature_importance || {};
  const cm = cls.confusion_matrix || [[0, 0], [0, 0]];

  return (
    <div className="card" style={{ padding: 28, background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: "var(--radius)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <span style={{ background: "rgba(167, 139, 250, 0.14)", color: "#A78BFA", border: "1.5px solid rgba(167, 139, 250, 0.35)", padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
            🤖 Scikit-Learn ML Model Diagnostics
          </span>
          <h3 style={{ fontSize: 20, fontWeight: 900, marginTop: 8, margin: "8px 0 0" }}>Machine Learning Validation & Feature Importance</h3>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", background: "var(--bg-soft)", padding: "6px 14px", borderRadius: 8 }}>
          Dataset: <strong>{metrics.dataset_size} samples ({metrics.test_samples} test set)</strong>
        </div>
      </div>

      {/* 4 Metric Badges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        <MetricCard label="Model Test Accuracy" value={`${cls.accuracy}%`} color="#10B981" sub="Random Forest (Unseen Test Set)" />
        <MetricCard label="Precision" value={`${cls.precision}%`} color="#3B82F6" sub="True Positive Rate" />
        <MetricCard label="Recall Rate" value={`${cls.recall}%`} color="#A855F7" sub="Disengagement Sensitivity" />
        <MetricCard label="Regression R²" value={reg.r2_score} color="#F59E0B" sub="Next Quiz Score Prediction" />
      </div>

      {/* 2 Column Layout: Feature Importance & Confusion Matrix */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
        {/* Left: Feature Importance Bar Chart */}
        <div style={{ padding: 20, background: "var(--bg-soft)", borderRadius: 14, border: "1px solid var(--border)" }}>
          <h4 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800 }}>📊 Feature Importance Rankings (%)</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(featMap).map(([name, weight]: any) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  <span>{name}</span>
                  <span style={{ color: "#A78BFA", fontWeight: 800 }}>{weight}%</span>
                </div>
                <div style={{ height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, weight)}%`, background: "linear-gradient(90deg, #7C3AED, #EC4899)", borderRadius: 99, transition: "width 0.6s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Confusion Matrix & Regression Formula */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Confusion Matrix Table */}
          <div style={{ padding: 20, background: "var(--bg-soft)", borderRadius: 14, border: "1px solid var(--border)", flex: 1 }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800 }}>🎯 Confusion Matrix (Disengagement Classifier)</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "center" }}>
              <div style={{ padding: 12, background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#34D399" }}>{cm[0]?.[0]}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", marginTop: 2 }}>True Active (TN)</div>
              </div>
              <div style={{ padding: 12, background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#FBBF24" }}>{cm[0]?.[1]}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", marginTop: 2 }}>False Risk (FP)</div>
              </div>
              <div style={{ padding: 12, background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#F87171" }}>{cm[1]?.[0]}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", marginTop: 2 }}>Missed Risk (FN)</div>
              </div>
              <div style={{ padding: 12, background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#C084FC" }}>{cm[1]?.[1]}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", marginTop: 2 }}>True Risk (TP)</div>
              </div>
            </div>
          </div>

          {/* Formula Card */}
          <div style={{ padding: 16, background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 12, fontSize: 12, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 800, color: "#3B82F6" }}>📐 Ridge Regression Formula:</span>
            <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, marginTop: 4, color: "var(--ink)" }}>
              {reg.formula}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color, sub }: any) {
  return (
    <div style={{ padding: 16, background: "var(--bg-soft)", borderRadius: 12, border: "1px solid var(--border)" }}>
      <div className="muted" style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color, marginTop: 4 }}>{value}</div>
      {sub && <div className="muted" style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

