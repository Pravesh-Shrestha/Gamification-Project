import React from "react";
import { chatbot } from "../../services/api";

// Interactive chat view supporting dialog with the local knowledge companion.

// ── Simple markdown-style renderer ─────────────────────────
function renderMessage(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold **text**
    const parts = line.split(/(\*\*.*?\*\*)/g).map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return <strong key={j}>{p.slice(2, -2)}</strong>;
      }
      return p;
    });

    // Headers
    if (line.startsWith("**") && line.endsWith("**") && !line.includes("\n")) {
      return <div key={i} style={{ fontWeight: 900, fontSize: 15, marginTop: i > 0 ? 8 : 0, marginBottom: 4 }}>{parts}</div>;
    }

    // Empty line
    if (line.trim() === "") {
      return <div key={i} style={{ height: 6 }} />;
    }

    // Bullet point
    if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
      return <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 13, lineHeight: 1.6 }}><span>{line.trim().charAt(0)}</span><span>{parts.slice(1)}</span></div>;
    }

    // Numbered list
    const numMatch = line.trim().match(/^(\d+[.)])\s*/);
    if (numMatch) {
      return <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 13, lineHeight: 1.6 }}><span style={{ fontWeight: 800, minWidth: 20 }}>{numMatch[1]}</span><span>{parts.slice(1)}</span></div>;
    }

    return <div key={i} style={{ fontSize: 13, lineHeight: 1.6 }}>{parts}</div>;
  });
}

// ── Quick actions ──────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "📊 My stats", msg: "How am I doing?" },
  { label: "🏆 My rank", msg: "What's my rank?" },
  { label: "📚 Explain fractions", msg: "Explain fractions" },
  { label: "🎯 Recommendations", msg: "What should I study?" },
  { label: "🔥 My streak", msg: "What's my streak?" },
  { label: "💪 Motivate me", msg: "Motivate me!" },
];

// ── Typing dots animation ──────────────────────────────────
function TypingDots() {
  const [dots, setDots] = React.useState("");
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 400);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ alignSelf: "flex-start", padding: "10px 16px", borderRadius: 14, background: "var(--bg-soft)", display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 16 }}>🎓</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>Thinking{dots}</span>
    </div>
  );
}

// Primary user interface component.

function ChatBot({ onClose }) {
  const [messages, setMessages] = React.useState([
    {
      role: "assistant",
      content: `Hi! I'm your **study companion**! ✨

Ask me anything about your studies:

• 📊 **Your stats** — "How am I doing?"
• 📚 **Explain concepts** — "What is photosynthesis?"
• 🏆 **Leaderboard** — "What's my rank?"
• 🎯 **Recommendations** — "What should I study?"
• 💪 **Motivation** — "Motivate me!"`,
    },
  ]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [showQuickActions, setShowQuickActions] = React.useState(true);
  const listRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  async function handleSend(text?: string) {
    const msg = (text || input || "").trim();
    if (!msg || sending) return;
    setInput("");
    setShowQuickActions(false);
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setSending(true);
    try {
      const result = await chatbot.send(msg);
      setMessages(result.history);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again! 😊" }]);
    }
    setSending(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    handleSend();
  }

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, width: 400, height: 560,
      background: "var(--bg-card)", border: "1.5px solid var(--line)",
      borderRadius: 16, boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
      display: "flex", flexDirection: "column", zIndex: 999, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 18px",
        background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
        color: "white", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>💬</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Study Companion</div>
            <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600 }}>academia.io · Real-time data</div>
          </div>
        </div>
        <button onClick={onClose} style={{ color: "rgba(255,255,255,0.8)", fontSize: 20, lineHeight: 1, cursor: "pointer", background: "none", border: "none" }}>✕</button>
      </div>

      {/* Messages */}
      <div ref={listRef} style={{
        flex: 1, overflowY: "auto", padding: "12px 14px",
        display: "flex", flexDirection: "column", gap: 8,
        background: "var(--bg)",
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "88%",
          }}>
            {m.role === "assistant" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, paddingLeft: 2 }}>
                <span style={{ fontSize: 12 }}>💬</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Study Guide</span>
              </div>
            )}
            <div style={{
              padding: "10px 14px", borderRadius: 14,
              background: m.role === "user" ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "var(--bg-soft)",
              color: m.role === "user" ? "white" : "var(--ink)",
              whiteSpace: "pre-wrap",
              boxShadow: m.role === "user" ? "0 2px 8px rgba(124,58,237,0.3)" : "none",
            }}>
              {m.role === "user" ? m.content : renderMessage(m.content)}
            </div>
          </div>
        ))}

        {/* Quick actions — only show at start */}
        {showQuickActions && messages.length <= 1 && (
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i} onClick={() => handleSend(action.msg)}
                style={{
                  padding: "7px 12px", borderRadius: 99, background: "var(--bg-card)",
                  border: "1.5px solid var(--line)", cursor: "pointer",
                  fontWeight: 700, fontSize: 11, color: "var(--ink)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#7C3AED"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--line)"}>
                {action.label}
              </button>
            ))}
          </div>
        )}

        {sending && <TypingDots />}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        padding: "10px 14px", borderTop: "1.5px solid var(--line)",
        background: "var(--bg-card)", display: "flex", gap: 8, alignItems: "center",
      }}>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything..." disabled={sending}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--line)",
            background: "var(--bg)", fontWeight: 600, fontSize: 13, outline: "none",
          }} />
        <button type="submit" disabled={sending || !input.trim()}
          style={{
            padding: "10px 18px", borderRadius: 10,
            background: sending || !input.trim() ? "var(--line)" : "linear-gradient(135deg, #7C3AED, #6D28D9)",
            color: "white", fontWeight: 800, fontSize: 13,
            opacity: sending || !input.trim() ? 0.5 : 1,
            cursor: sending || !input.trim() ? "default" : "pointer",
            border: "none",
          }}>
          Send
        </button>
      </form>
    </div>
  );
}

window.ChatBot = ChatBot;
