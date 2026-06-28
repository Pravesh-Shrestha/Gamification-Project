import React from "react";

// academia.io — Focus mode (Forest-style)
// Plant a virtual tree that grows during a focus timer. Leave the tab → tree dies.

function FocusMode({ profile, onComplete, onExit }) {
  const [picked, setPicked] = React.useState(25); // minutes
  const [running, setRunning] = React.useState(false);
  const [secsLeft, setSecsLeft] = React.useState(picked * 60);
  const [totalSecs, setTotalSecs] = React.useState(picked * 60);
  const [dead, setDead] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);
  const tickRef = React.useRef(null);

  // tab visibility detection — leave the tab while running and the tree dies
  React.useEffect(() => {
    function onVis() {
      if (document.hidden && running && !completed) {
        setDead(true);
        setRunning(false);
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [running, completed]);

  React.useEffect(() => {
    if (!running) {
      clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) {
          clearInterval(tickRef.current);
          setRunning(false);
          setCompleted(true);
          // Award
          setTimeout(() => onComplete(picked), 50);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [running]);

  function start() {
    setSecsLeft(picked * 60);
    setTotalSecs(picked * 60);
    setDead(false);
    setCompleted(false);
    setRunning(true);
  }
  function cancel() {
    setRunning(false);
    setDead(false);
    setSecsLeft(picked * 60);
  }

  const elapsed = totalSecs - secsLeft;
  const growth = totalSecs === 0 ? 0 : elapsed / totalSecs; // 0..1

  function fmt(s) {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <div className="eyebrow">Focus mode</div>
        <h1 style={{ marginTop: 4, marginBottom: 6 }}>
          {completed ? "Tree grown!" : dead ? "Your tree withered" : running ? "Stay focused" : "Plant a tree"}
        </h1>
        <p className="soft" style={{ maxWidth: 420, margin: "0 auto 28px" }}>
          {completed
            ? "You stayed focused the whole time. Your tree is added to your forest."
            : dead
            ? "You left the tab. Try again — keep this tab open until the timer ends."
            : running
            ? "Keep this tab open. If you leave, your tree dies."
            : "Pick a length, plant your tree, and stay on this tab until the timer ends."}
        </p>

        <TreeArt growth={dead ? -1 : growth} />

        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 56, letterSpacing: "-0.02em", margin: "12px 0 4px" }}>
          {fmt(secsLeft)}
        </div>
        {!running && !completed && !dead && (
          <>
            <div className="muted" style={{ marginBottom: 22, fontWeight: 700 }}>
              Earn ~{picked * 2} XP for completing this session
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 22 }}>
              {[10, 25, 50].map((m) => (
                <button
                  key={m}
                  onClick={() => { setPicked(m); setSecsLeft(m * 60); setTotalSecs(m * 60); }}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 99,
                    fontWeight: 800,
                    background: picked === m ? "var(--ink)" : "var(--bg-soft)",
                    color: picked === m ? "var(--bg-card)" : "var(--ink)",
                  }}
                >
                  {m} min
                </button>
              ))}
            </div>
            <button className="btn" style={{ background: "#84CC16", color: "white" }} onClick={start}>
              Plant tree 🌱
            </button>
          </>
        )}
        {running && (
          <button className="btn ghost" onClick={cancel} style={{ marginTop: 10 }}>
            Give up
          </button>
        )}
        {(completed || dead) && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
            <button className="btn ghost" onClick={onExit}>Back</button>
            <button className="btn" style={{ background: "#84CC16", color: "white" }} onClick={() => { setCompleted(false); setDead(false); setSecsLeft(picked * 60); }}>
              {completed ? "Plant another" : "Try again"}
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 18, padding: 22, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 36 }}>🌲</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800 }}>Your forest</div>
          <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>
            You've grown <b>{profile.treesGrown || 0}</b> tree{(profile.treesGrown || 0) === 1 ? "" : "s"} · <b>{profile.focusMinutes || 0}</b> focus minutes total
          </div>
        </div>
        <ForestStrip count={profile.treesGrown || 0} />
      </div>
    </div>
  );
}

function TreeArt({ growth }) {
  // growth: 0 = seed, 1 = fully grown, -1 = dead
  const stage = growth < 0 ? "dead" : growth < 0.15 ? "seed" : growth < 0.4 ? "sprout" : growth < 0.75 ? "small" : "tree";
  const trunkH = stage === "dead" ? 30 : stage === "seed" ? 0 : stage === "sprout" ? 14 : stage === "small" ? 40 : 70;
  const leafR = stage === "dead" ? 0 : stage === "seed" ? 6 : stage === "sprout" ? 12 : stage === "small" ? 26 : 48;
  const leafColor = stage === "dead" ? "#94A3B8" : "#22C55E";
  const trunkColor = stage === "dead" ? "#475569" : "#8B5E3C";

  return (
    <div style={{ height: 200, display: "grid", placeItems: "end center", padding: "20px 0", position: "relative" }}>
      <svg width="180" height="180" viewBox="-90 -180 180 180">
        {/* ground */}
        <ellipse cx="0" cy="-2" rx="70" ry="10" fill="#84CC16" opacity="0.25" />
        {stage === "seed" && (
          <circle cx="0" cy="-6" r="6" fill="#8B5E3C" />
        )}
        {stage !== "seed" && (
          <>
            <rect x="-5" y={-trunkH} width="10" height={trunkH} fill={trunkColor} rx="2" />
            <circle cx="0" cy={-trunkH - leafR / 1.5} r={leafR} fill={leafColor} />
            {stage !== "sprout" && stage !== "dead" && (
              <>
                <circle cx={-leafR * 0.7} cy={-trunkH - leafR / 2} r={leafR * 0.7} fill={leafColor} />
                <circle cx={leafR * 0.7} cy={-trunkH - leafR / 2} r={leafR * 0.7} fill={leafColor} />
              </>
            )}
            {stage === "dead" && (
              <text x="0" y={-trunkH - leafR / 2} textAnchor="middle" fontSize="20">💀</text>
            )}
          </>
        )}
      </svg>
    </div>
  );
}

function ForestStrip({ count }) {
  if (count === 0) return <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>No trees yet</div>;
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
        <span key={i} style={{ fontSize: 22 }}>🌳</span>
      ))}
      {count > 8 && <span className="muted" style={{ fontWeight: 800, alignSelf: "center", fontSize: 13 }}>+{count - 8}</span>}
    </div>
  );
}

window.FocusMode = FocusMode;
