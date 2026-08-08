import React from "react";
import * as Lucide from "lucide-react";

// academia.io - Notifications bell + dropdown + equipped avatar component

// EquippedAvatar - renders user avatar with their equipped frame/hat/pet
function EquippedAvatar({ user, size = 36, showLevel = false }) {
  const equipped = user.equipped || {};
  const frame = equipped.frame && window.Gamify.COSMETICS.find((c) => c.id === equipped.frame);
  const hat = equipped.hat && window.Gamify.COSMETICS.find((c) => c.id === equipped.hat);
  const pet = equipped.pet && window.Gamify.COSMETICS.find((c) => c.id === equipped.pet);
  const frameColor = frame ? frame.color || window.Gamify.RARITY_COLORS[frame.rarity] : null;
  const HatIcon = hat && Lucide[hat.icon];
  const PetIcon = pet && Lucide[pet.icon];
  const lvl = showLevel ? window.Engine.levelFromXP(user.xp || 0) : null;
  const Avatar = window.Avatar;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 99,
          background: "var(--bg-soft)",
          display: "grid",
          placeItems: "center",
          border: frameColor ? `2.5px solid ${frameColor}` : "none",
          boxShadow: frame && frame.rarity === "epic" ? "0 0 14px rgba(168,85,247,0.5)" : frame && frame.rarity === "legend" ? "0 0 14px rgba(245,158,11,0.6)" : "none",
        }}
      >
        <Avatar value={user.avatar} size={size * 0.7} />
      </div>
      {HatIcon && (
        <div style={{ position: "absolute", top: -size * 0.3, left: "50%", transform: "translateX(-50%) rotate(-12deg)", pointerEvents: "none", color: "var(--ink)" }}>
          <HatIcon size={size * 0.5} />
        </div>
      )}
      {PetIcon && (
        <div style={{ position: "absolute", bottom: -size * 0.1, right: -size * 0.3, background: "var(--bg-card)", borderRadius: 99, padding: 2, lineHeight: 1, border: "1.5px solid var(--line)", color: "var(--ink)", display: "grid", placeItems: "center" }}>
          <PetIcon size={size * 0.45} />
        </div>
      )}
      {lvl && (
        <div style={{ position: "absolute", bottom: -4, right: -4, background: "var(--ink)", color: "var(--bg-card)", fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 99, border: "2px solid var(--bg-card)" }}>
          L{lvl}
        </div>
      )}
    </div>
  );
}

function NotificationsBell({ user, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    function clickAway(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", clickAway);
    return () => document.removeEventListener("mousedown", clickAway);
  }, []);

  const db = window.DB.load();
  const list = window.DB.notificationsFor(db, user.id);
  const unread = list.filter((n) => !n.read).length;

  function openAndRead() {
    setOpen((o) => {
      const next = !o;
      if (next) {
        window.DB.markAllRead(window.DB.load(), user.id);
        if (onChange) onChange();
      }
      return next;
    });
  }

  function IconFor({ kind }) {
    if (kind === "assignment") return <Lucide.ClipboardList size={20} color="#3B82F6" />;
    if (kind === "announcement") return <Lucide.Megaphone size={20} color="#8B5CF6" />;
    if (kind === "badge") return <Lucide.Trophy size={20} color="#F59E0B" />;
    if (kind === "level") return <Lucide.ArrowUpCircle size={20} color="#10B981" />;
    if (kind === "streak") return <Lucide.Flame size={20} color="#EF4444" />;
    if (kind === "message") return <Lucide.MessageCircle size={20} color="#6366F1" />;
    return <Lucide.Bell size={20} color="#94A3B8" />;
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={openAndRead}
        style={{
          width: 40, height: 40, borderRadius: 99, background: "var(--bg-card)", border: "1px solid var(--line)",
          display: "grid", placeItems: "center", position: "relative", boxShadow: "var(--shadow-sm)",
        }}
        aria-label="Notifications"
      >
        <Lucide.Bell size={20} color="var(--ink-soft)" />
        {unread > 0 && (
          <span style={{ position: "absolute", top: -2, right: -2, background: "#EF4444", color: "white", fontSize: 10, fontWeight: 800, padding: "1px 5px", borderRadius: 99, border: "2px solid var(--bg-card)", minWidth: 16, textAlign: "center" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute", top: 48, right: 0, width: 360,
            maxHeight: 480, overflow: "auto",
            background: "var(--bg-card)", border: "1px solid var(--line)",
            borderRadius: 14, boxShadow: "var(--shadow-lg)", zIndex: 100,
          }}
        >
          <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Notifications</div>
            {list.length > 0 && (
              <button
                onClick={() => { window.DB.clearNotifications(window.DB.load(), user.id); if (onChange) onChange(); }}
                style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-mute)", background: "none", border: "none", cursor: "pointer" }}
              >
                Clear all
              </button>
            )}
          </div>
          {list.length === 0 && <div className="muted" style={{ padding: 30, textAlign: "center", fontWeight: 700, fontSize: 13 }}>No notifications yet.</div>}
          <div style={{ display: "grid" }}>
            {list.map((n) => (
              <div key={n.id} style={{ padding: "12px 16px", display: "flex", gap: 12, borderBottom: "1px solid var(--line)", background: n.read ? "transparent" : "var(--bg-soft)" }}>
                <div style={{ lineHeight: 1, marginTop: 2 }}>
                  <IconFor kind={n.kind} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "var(--ink)" }}>{n.title}</div>
                  <div className="muted" style={{ fontSize: 12, fontWeight: 600, marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                  <div className="muted" style={{ fontSize: 10, fontWeight: 700, marginTop: 4 }}>{timeAgoShort(n.t)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgoShort(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

Object.assign(window, { EquippedAvatar, NotificationsBell });
