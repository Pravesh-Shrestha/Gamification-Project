import React from "react";

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  badges: number;
  lessons: number;
}

interface LeaderboardTableProps {
  leaderboard: LeaderboardUser[];
  maxXp: number;
}

export function LeaderboardTable({ leaderboard, maxXp }: LeaderboardTableProps) {
  const getRankClass = (rank: number) => {
    if (rank === 1) return "gold";
    if (rank === 2) return "silver";
    if (rank === 3) return "bronze";
    return "normal";
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "#F59E0B";
    if (rank === 2) return "#9CA3AF";
    if (rank === 3) return "#D97706";
    return "var(--ink-muted)";
  };

  const fmt = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return n.toString();
  };

  return (
    <div className="chart-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, marginTop: 24 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🏆 Top Student Leaderboard</h4>
      <div style={{ overflowX: "auto" }}>
        <table className="leaderboard-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ background: "var(--bg-card2)", color: "var(--ink-muted)", fontSize: 11, textTransform: "uppercase" }}>
              <th style={{ padding: "12px 14px", textAlign: "left", width: 60 }}>Rank</th>
              <th style={{ padding: "12px 14px", textAlign: "left" }}>Student</th>
              <th style={{ padding: "12px 14px", textAlign: "left" }}>XP Progress</th>
              <th style={{ padding: "12px 14px", textAlign: "left", width: 100 }}>Level</th>
              <th style={{ padding: "12px 14px", textAlign: "left", width: 100 }}>Streak</th>
              <th style={{ padding: "12px 14px", textAlign: "left", width: 100 }}>Badges</th>
              <th style={{ padding: "12px 14px", textAlign: "left", width: 100 }}>Lessons</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((s, idx) => (
              <tr key={idx} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 14px" }}>
                  <span className={`rank-badge ${getRankClass(s.rank)}`} style={{
                    display: "inline-grid", placeItems: "center", width: 24, height: 24,
                    borderRadius: "50%", fontWeight: 900, fontSize: 12,
                    background: s.rank <= 3 ? "rgba(255,255,255,0.06)" : "transparent",
                    color: getRankColor(s.rank)
                  }}>
                    {s.rank}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", fontWeight: 600 }}>{s.name}</td>
                <td style={{ padding: "12px 14px" }}>
                  <div className="xp-bar-wrap" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="xp-bar" style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                      <div className="xp-bar-fill" style={{
                        height: "100%", width: `${Math.min(100, Math.round((s.xp / (maxXp || 1)) * 100 * leaderboard.length))}%`,
                        background: "var(--brand)", borderRadius: 99
                      }} />
                    </div>
                    <span className="xp-val" style={{ fontSize: 13, fontWeight: 700, minWidth: 32 }}>{fmt(s.xp)}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 14px" }}><span style={{ color: "#A78BFA", fontWeight: 700 }}>Lv {s.level}</span></td>
                <td style={{ padding: "12px 14px" }}>{s.streak > 0 ? `🔥 ${s.streak}d` : "—"}</td>
                <td style={{ padding: "12px 14px" }}>{s.badges > 0 ? `🏅 ${s.badges}` : "—"}</td>
                <td style={{ padding: "12px 14px" }}>{s.lessons}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
