import React from "react";
import { LogOut, Bell, Search, School, Users, GraduationCap, BookOpen, Activity, Shield, Flame, Clock, Award } from "lucide-react";

// academia.io — Shared admin/teacher UI bits

export const RoleShellContext = React.createContext<{
  tabs: any[];
  setTabs: React.Dispatch<React.SetStateAction<any[]>>;
  currentTab: string;
  setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
} | null>(null);

function RoleShell({ user, onLogout, roleLabel, tint = "var(--ink)", children }) {
  const [tabs, setTabs] = React.useState<any[]>([]);
  const [currentTab, setCurrentTab] = React.useState("");
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [notifTick, setNotifTick] = React.useState(0);

  const db = window.DB.load();
  const school = user.schoolId ? window.DB.schoolById(db, user.schoolId) : null;
  const avatarMap = { hat: "🎓", panda: "🐼", fox: "🦊", cat: "🐱", dog: "🐶", owl: "🦉", penguin: "🐧", bunny: "🐰", bear: "🐻", frog: "🐸", monkey: "🐵", unicorn: "🦄" };
  const roleClass = roleLabel === "Teacher" ? "theme-teacher" : roleLabel === "Admin" ? "theme-admin" : roleLabel === "Super Admin" ? "theme-superadmin" : "theme-student";
  
  // Build subtitle based on role
  const subtitle = roleLabel === "Super Admin" ? "Platform Administrator"
    : roleLabel === "Admin" ? (school ? school.name : "School Administrator")
    : roleLabel === "Teacher" ? (school ? school.name : "Instructor")
    : `Lvl ${Math.floor((user.xp || 0) / 500) + 1} · ${(user.xp || 0).toLocaleString()} XP`;

  // Group tabs by section
  const renderNavItems = () => {
    const items: React.ReactNode[] = [];
    let lastGroup = "__default__";
    
    tabs.forEach((t) => {
      if (t.group && t.group !== lastGroup) {
        items.push(
          <div key={`group-${t.group}`} className="nav-section-label">{t.group}</div>
        );
        lastGroup = t.group;
      } else if (!t.group && lastGroup !== "__default__") {
        lastGroup = "__default__";
      }
      
      items.push(
        <button
          key={t.id}
          className={`nav-item ${currentTab === t.id ? "active" : ""}`}
          onClick={() => {
            const event = new CustomEvent("aio:tabchange", { detail: t.id });
            window.dispatchEvent(event);
          }}
        >
          {t.icon && <span style={{ display: "flex", alignItems: "center", opacity: 0.7 }}>{t.icon}</span>}
          <span>{t.label}</span>
          {typeof t.badge !== "undefined" && t.badge > 0 && (
            <span className="nav-badge">{t.badge}</span>
          )}
        </button>
      );
    });
    
    return items;
  };

  return (
    <RoleShellContext.Provider value={{ tabs, setTabs, currentTab, setCurrentTab }}>
      <div className={`dashboard-theme ${roleClass}`}>
        <div className="app">
          {/* Sidebar overlay for mobile/tablet */}
          {menuOpen && (
            <div 
              onClick={() => setMenuOpen(false)}
              className="sidebar-overlay"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(31, 24, 64, 0.4)",
                zIndex: 99,
                backdropFilter: "blur(2px)",
              }}
            />
          )}

          {/* Left Sidebar */}
          <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
            <div className="sidebar-logo" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <Logo size={36} />
              <button 
                className="sidebar-close" 
                onClick={() => setMenuOpen(false)}
                style={{ fontSize: 20, cursor: "pointer", display: "none" }}
              >
                ✕
              </button>
            </div>
            
            <div className="sidebar-role">
              <div className="role-avatar">
                {avatarMap[user.avatar] || user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="role-meta">
                <div className="role-name">{user.name}</div>
                <div className="role-subtitle">{subtitle}</div>
              </div>
            </div>

            <nav className="nav">
              {renderNavItems()}
            </nav>

            <div className="sidebar-foot">
              <button className="switch-role-btn" onClick={() => setShowConfirm(true)}>
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </aside>

          {/* Main Panel */}
          <div className="main">
            <div className="topbar">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button 
                  className="sidebar-toggle" 
                  onClick={() => setMenuOpen(true)}
                  style={{
                    fontSize: 20,
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "var(--bg-soft)",
                    cursor: "pointer",
                    display: "none",
                    border: "1.5px solid var(--line-strong)"
                  }}
                >
                  ☰
                </button>
                <h2 className="topbar-title">{tabs.find(t => t.id === currentTab)?.label || "Portal"}</h2>
              </div>
              <div className="topbar-right">
                <div className="topbar-search">
                  <Search size={14} style={{ color: "var(--ink-mute)", flexShrink: 0 }} />
                  <input type="text" placeholder="Search dashboard…" />
                </div>
                {(window as any).NotificationsBell ? (
                  React.createElement((window as any).NotificationsBell, { user, onChange: () => setNotifTick(t => t + 1) })
                ) : (
                  <button className="topbar-bell">
                    <Bell size={16} />
                  </button>
                )}
                <span className="topbar-role-badge">{roleLabel}</span>
              </div>
            </div>
            <div className="page">
              {children}
            </div>
          </div>

          {/* Logout confirmation dialog */}
          {showConfirm && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(31, 24, 64, 0.45)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", zIndex: 9999, padding: 20 }}>
              <div className="card" style={{ maxWidth: 360, width: "100%", padding: 28, textAlign: "center" }}>
                <div style={{ marginBottom: 12, color: "var(--ink-mute)" }}>
                  <LogOut size={36} />
                </div>
                <h2 style={{ margin: "0 0 6px", fontSize: 20 }}>Sign out?</h2>
                <p className="soft" style={{ margin: "0 0 20px", fontSize: 14 }}>Are you sure you want to sign out? Your progress is saved automatically.</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button className="btn ghost" onClick={() => setShowConfirm(false)} style={{ flex: 1 }}>Cancel</button>
                  <button className="btn color" onClick={() => { setShowConfirm(false); onLogout(); }} style={{ flex: 1, "--brand-color": "var(--accent-coral)" } as any}>Sign out</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleShellContext.Provider>
  );
}

function RoleTabs({ current, onChange, tabs }) {
  const ctx = React.useContext(RoleShellContext);
  
  React.useEffect(() => {
    if (ctx) {
      ctx.setTabs(tabs);
    }
  }, [tabs, ctx]);

  React.useEffect(() => {
    if (ctx) {
      ctx.setCurrentTab(current);
    }
  }, [current, ctx]);

  React.useEffect(() => {
    const handleTabChange = (e: Event) => {
      const tabId = (e as CustomEvent).detail;
      onChange(tabId);
    };
    window.addEventListener("aio:tabchange", handleTabChange);
    return () => window.removeEventListener("aio:tabchange", handleTabChange);
  }, [onChange]);

  return null; // Teleported to sidebar
}

// ── Cockpit Welcome Banner ──────────────────────────────
function CockpitBanner({ eyebrow, greeting, sub, actions }: { eyebrow: string; greeting: string; sub: React.ReactNode; actions?: React.ReactNode }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  
  return (
    <div className="cockpit-banner">
      <div className="cockpit-left">
        <div className="cockpit-eyebrow">
          {eyebrow} <span style={{ opacity: 0.4 }}>·</span> <span className="cockpit-date">{dateStr}</span>
        </div>
        <h2 className="cockpit-greeting">{greeting}</h2>
        <div className="cockpit-sub">{sub}</div>
      </div>
      {actions && (
        <div className="cockpit-actions">
          {actions}
        </div>
      )}
    </div>
  );
}

function BigStat({ label, value, color = "var(--accent, var(--primary))", sub }) {
  const iconMap: Record<string, any> = {
    schools: School,
    teachers: Users,
    students: GraduationCap,
    classes: BookOpen,
    "active today": Activity,
    admins: Shield,
    "my classes": BookOpen,
    "lessons done": Award,
    "active streaks": Flame,
    "weekly sessions": Clock,
    "pending grading": Clock,
    "total students": GraduationCap,
    "active cohorts": Users,
  };
  const IconComponent = iconMap[label.toLowerCase()] || GraduationCap;
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", minHeight: "100px" }}>
      <div>
        <div className="eyebrow" style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 4 }}>{label}</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-mute)", marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: color + "1A",
        color: color,
        display: "grid",
        placeItems: "center",
        flexShrink: 0
      }}>
        <IconComponent size={22} />
      </div>
    </div>
  );
}

function RowStat({ label, value, sub }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px dashed var(--line)" }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
        {sub && <div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{sub}</div>}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>{value}</div>
    </div>
  );
}

function Pill({ label, value }) {
  return (
    <div style={{ background: "var(--bg-soft)", padding: "8px 12px", borderRadius: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-mute)" }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 14, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function SectionHeader({ title, eyebrow, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)" }}>{title}</h3>
      </div>
      {action}
    </div>
  );
}

function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,17,13,0.55)", display: "grid", placeItems: "center", zIndex: 200, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: "100%", maxWidth: width, padding: 26, maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 99, background: "var(--bg-soft)", fontSize: 16 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: any; value: any; onChange: any; placeholder?: string; type?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "var(--ink-soft)" }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "11px 14px",
          border: "1.5px solid var(--line-strong)",
          borderRadius: 10,
          background: "var(--bg-soft)",
          fontWeight: 700,
          fontSize: 14,
          outline: "none",
        }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: any; value: any; onChange: any; options: any[] }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "var(--ink-soft)" }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "11px 14px",
          border: "1.5px solid var(--line-strong)",
          borderRadius: 10,
          background: "var(--bg-soft)",
          fontWeight: 700,
          fontSize: 14,
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

Object.assign(window, { RoleShell, RoleTabs, BigStat, RowStat, Pill, SectionHeader, Modal, Field, Select, CockpitBanner });
