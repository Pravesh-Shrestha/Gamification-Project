import React from "react";
import { createPortal } from "react-dom";

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartTitle: string;
  chartDesc: string;
  researchQuestion: string;
  hypothesisMapping: string;
  implications: string;
  children: React.ReactNode;
}

export function ChartModal({ isOpen, onClose, chartTitle, chartDesc, researchQuestion, hypothesisMapping, implications, children }: ChartModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(9,9,15,0.85)", backdropFilter: "blur(12px)",
      display: "grid", placeItems: "center", zIndex: 9999, padding: 24,
      animation: "fadeIn 0.25s ease-out",
      overflowY: "auto"
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg-card)", border: "1.5px solid var(--border-glow)",
        borderRadius: "var(--radius)", padding: 32, width: "100%", maxWidth: 800,
        boxShadow: "0 20px 50px rgba(0,0,0,0.8)", animation: "slideUp 0.3s ease-out",
        position: "relative", margin: "auto"
      }} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: "absolute", top: 20, right: 20, background: "transparent",
          border: "none", color: "var(--ink-muted)", fontSize: 24, cursor: "pointer",
          transition: "color 0.2s"
        }} onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
           onMouseLeave={(e) => e.currentTarget.style.color = "var(--ink-muted)"}>
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 11, color: "var(--brand-2)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Detailed Research View</span>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginTop: 4, letterSpacing: "-0.02em" }}>{chartTitle}</h2>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 2 }}>{chartDesc}</p>
        </div>

        {/* Chart Content Container */}
        <div style={{
          background: "transparent", border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)", padding: 0, marginBottom: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", minHeight: 320
        }}>
          {children}
        </div>

        {/* Thesis Alignment */}
        <div style={{ display: "grid", gap: 14, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <div>
            <strong style={{ fontSize: 11, color: "var(--brand-2)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>Research Question Alignment</strong>
            <p style={{ fontSize: 13, color: "var(--ink)", marginTop: 2, lineHeight: 1.5 }}>{researchQuestion}</p>
          </div>
          <div>
            <strong style={{ fontSize: 11, color: "var(--brand-2)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>Hypothesis Mapping & Outcome</strong>
            <p style={{ fontSize: 13, color: "var(--ink)", marginTop: 2, lineHeight: 1.5 }}>{hypothesisMapping}</p>
          </div>
          <div>
            <strong style={{ fontSize: 11, color: "var(--accent-green)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>Research Implications for Thesis</strong>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2, lineHeight: 1.5 }}>{implications}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
