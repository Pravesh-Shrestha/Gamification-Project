import React from "react";

// academia.io - Student sub-screens: Home, Quests, Locker, Lootbox

function StudentHome({ user, db, assignments, classes, onOpenLesson, onTab }) {
  const dp = window.Engine.dailyProgress(user, user.dailyGoal);
  const lvl = window.Engine.xpForNextLevel(user.xp);
  const recommended = window.Engine.recommendNext(user);
  const todayQuests = window.Gamify.todaysQuests(user.id);
  const myClass = classes[0]; // assume primary class
  const classmates = myClass ? myClass.studentIds.map((id) => window.DB.userById(db, id)).filter(Boolean) : [];
  const ranking = classmates.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const myRank = ranking.findIndex((s) => s.id === user.id) + 1;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* 4 Stat Cards Row */}
      <div className="stats-grid">
        <BigStat label="Daily Goal" value={`${dp.pct}%`} color="#F59E0B" sub={dp.goal - dp.earned <= 0 ? "Goal completed!" : `${dp.goal - dp.earned} XP remaining`} />
        <BigStat label="Level" value={lvl.lvl} color="#A855F7" sub={`${lvl.into}/${lvl.span} XP`} />
        <BigStat label="Streak" value={`${user.streak} days`} color="#EF4444" sub={`Freezes: ${user.freezes?.count || 0}`} />
        <BigStat label="Class Rank" value={myRank ? `#${myRank}` : "-"} color="#3B82F6" sub={myClass?.name || "No class"} />
      </div>

      {/* Main 2-Column Panel Layout */}
      <div className="dashboard-grid-2col">
        {/* Left Column */}
        <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
          {/* Daily Quests */}
          <div className="card">
            <SectionHeader title="Daily quests" eyebrow="Today's missions" action={
              <button className="muted" onClick={() => onTab("quests")} style={{ fontSize: 13, fontWeight: 800, padding: 0 }}>See all →</button>
            } />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {todayQuests.map((q) => <QuestCard key={q.id} quest={q} user={user} />)}
            </div>
          </div>

          {/* Assignments */}
          <div className="card">
            <SectionHeader title="Assignments from your teacher" eyebrow={`${assignments.length} active`} />
            <div style={{ display: "grid", gap: 10 }}>
              {assignments.length === 0 && <div className="muted" style={{ padding: 16, textAlign: "center", fontWeight: 700 }}>No assignments - explore on your own!</div>}
              {assignments.map((a) => {
                const lesson = window.findLesson(a.lessonId);
                const teacher = window.DB.userById(db, a.assignedBy);
                const done = (user.lessonsCompleted || []).includes(a.lessonId);
                const daysLeft = Math.ceil((a.dueAt - Date.now()) / (1000 * 60 * 60 * 24));
                const overdue = daysLeft < 0 && !done;
                return (
                  <div key={a.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center", padding: "14px 16px", background: done ? "rgba(16,185,129,0.12)" : "var(--bg-soft)", borderRadius: 12, border: overdue ? "1.5px solid #EF4444" : done ? "1.5px solid rgba(16,185,129,0.45)" : "1px solid transparent" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: lesson?.color + "22", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 800, color: lesson?.color }}>
                      {done ? "✓" : daysLeft < 0 ? "!" : daysLeft}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{lesson?.title}</div>
                      <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginTop: 2 }}>
                        {lesson?.subjectName} · from {teacher?.name} · {done ? "done ✓" : overdue ? `overdue by ${-daysLeft}d` : `due in ${daysLeft}d`}
                      </div>
                      {a.note && <div className="muted" style={{ fontSize: 11, fontStyle: "italic", marginTop: 2 }}>"{a.note}"</div>}
                    </div>
                    {!done && (
                      <button className="btn" style={{ background: lesson?.color, color: window.readableTextOn(lesson?.color), padding: "8px 16px", fontSize: 13 }} onClick={() => onOpenLesson(a.lessonId)}>Start →</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
          {/* Class Feed */}
          <div className="card">
            <SectionHeader title="Class feed" eyebrow={myClass?.name || "Live"} />
            <ClassFeed db={db} myClass={myClass} userId={user.id} />
          </div>

          {/* Class Leaderboard */}
          {myClass && (
            <div className="card">
              <SectionHeader title="Class leaderboard" eyebrow={`${myClass.name} · this week`} action={
                <button className="muted" onClick={() => onTab("quests")} style={{ fontSize: 13, fontWeight: 800, padding: 0 }}>Full rank →</button>
              } />
              <Leaderboard students={ranking.slice(0, 5)} highlightId={user.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClassFeed({ db, myClass, userId }) {
  if (!myClass) return <div className="muted" style={{ padding: 14, textAlign: "center", fontWeight: 700 }}>No class yet.</div>;
  const events = (db.feed || []).filter((e) => myClass.studentIds.includes(e.userId)).slice(0, 6);
  const avatarMap = { hat: "🎓", panda: "🐼", fox: "🦊", cat: "🐱", dog: "🐶", owl: "🦉", penguin: "🐧", bunny: "🐰", bear: "🐻", frog: "🐸", monkey: "🐵", unicorn: "🦄" };
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {events.length === 0 && <div className="muted" style={{ padding: 14, textAlign: "center", fontWeight: 700 }}>Quiet for now. Be the first to do something!</div>}
      {events.map((e, i) => {
        const u = window.DB.userById(db, e.userId);
        if (!u) return null;
        const isMe = e.userId === userId;
        const ago = timeAgo(e.t);
        let line = "";
        if (e.kind === "perfect") line = `aced "${e.payload.lesson}"`;
        else if (e.kind === "badge") line = `earned the "${e.payload.badge}" badge`;
        else if (e.kind === "level") line = `reached level ${e.payload.level}`;
        else if (e.kind === "streak") line = `is on a ${e.payload.days}-day streak`;
        else line = "did something";
        return (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", borderRadius: 10, background: isMe ? "rgba(245,158,11,0.15)" : "var(--bg-soft)", color: isMe ? "var(--ink)" : "inherit", border: isMe ? "1px solid rgba(245,158,11,0.45)" : "1px solid transparent" }}>
            <div style={{ width: 30, height: 30, borderRadius: 99, background: "var(--bg-card)", display: "grid", placeItems: "center", fontSize: 15, color: "var(--ink)" }}>{avatarMap[u.avatar] || "🎓"}</div>
            <div style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>
              <b>{isMe ? "You" : u.name.split(" ")[0]}</b> <span style={{ fontWeight: 600, color: isMe ? "#FBBF24" : "var(--ink-soft)" }}>{line}</span>
            </div>
            <div className={isMe ? "" : "muted"} style={{ fontSize: 10, fontWeight: 700, color: isMe ? "#FBBF24" : undefined }}>{ago}</div>
          </div>
        );
      })}
    </div>
  );
}

function timeAgo(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function QuestCard({ quest, user }) {
  const progress = window.Gamify.questProgress(user, quest);
  const done = progress >= quest.goal;
  const pct = Math.min(100, Math.round((progress / quest.goal) * 100));
  return (
    <div style={{ padding: 14, background: done ? "rgba(16,185,129,0.12)" : "var(--bg-soft)", borderRadius: 12, border: done ? "2px solid #34D399" : "1px solid transparent" }}>
      <div style={{ display: "flex", alignItems: "start", gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 22 }}>{done ? "✅" : "🎯"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.3 }}>{quest.text}</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#F59E0B", marginTop: 2 }}>+{quest.reward} XP</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, marginBottom: 4 }}>
        <span>{progress} / {quest.goal}</span>
        <span style={{ color: done ? "#34D399" : "var(--ink-mute)" }}>{done ? "Done" : `${pct}%`}</span>
      </div>
      <div style={{ height: 6, background: "var(--line)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: done ? "#10B981" : "#A855F7", transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function QuestsTab({ user, db, classes }) {
  const todayQuests = window.Gamify.todaysQuests(user.id);
  const myClass = classes[0];
  const classmates = myClass ? myClass.studentIds.map((id) => window.DB.userById(db, id)).filter(Boolean) : [];
  const ranking = classmates.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0));

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">Today</div>
        <h1>Daily quests</h1>
        <p className="soft" style={{ maxWidth: 540, marginTop: 6 }}>Three new quests every day. Hit them all for bonus XP. Resets at midnight.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {todayQuests.map((q) => <QuestCard key={q.id} quest={q} user={user} />)}
      </div>

      {myClass && (
        <div className="card">
          <SectionHeader title="Class leaderboard" eyebrow={myClass.name} />
          <Leaderboard students={ranking} highlightId={user.id} />
        </div>
      )}
    </div>
  );
}

function Locker({ user, onUpdate }) {
  const unlocked = new Set(user.cosmetics || []);
  const equipped = user.equipped || {};
  const byKind = {};
  for (const c of window.Gamify.COSMETICS) {
    byKind[c.kind] = byKind[c.kind] || [];
    byKind[c.kind].push(c);
  }
  const kinds = [
    { id: "frame", label: "Avatar frames" },
    { id: "hat", label: "Hats" },
    { id: "pet", label: "Pets" },
    { id: "title", label: "Titles" },
  ];

  function toggleEquip(item) {
    const next = { ...(user.equipped || {}) };
    if (next[item.kind] === item.id) delete next[item.kind];
    else next[item.kind] = item.id;
    onUpdate({ equipped: next });
    window.FX && window.FX.Sound.click();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">Your locker</div>
        <h1>Cosmetics & rewards</h1>
        <p className="soft" style={{ maxWidth: 540, marginTop: 6 }}>
          Unlock items from mystery boxes after lessons. Equip them to show off - purely cosmetic, no advantage in learning.
        </p>
      </div>

      <div className="card" style={{ padding: 24, background: "linear-gradient(135deg, var(--bg-card), var(--bg-soft))", display: "flex", gap: 24, alignItems: "center" }}>
        <EquippedAvatar user={user} size={96} />
        <div style={{ flex: 1 }}>
          <div className="eyebrow">Your look</div>
          <h2 style={{ marginBottom: 6 }}>{(user.cosmetics || []).length} / {window.Gamify.COSMETICS.length} unlocked</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {Object.entries(equipped).map(([k, id]) => {
              const c = window.Gamify.COSMETICS.find((x) => x.id === id);
              if (!c) return null;
              return (
                <span key={k} style={{ background: window.Gamify.RARITY_COLORS[c.rarity] + "20", color: window.Gamify.RARITY_COLORS[c.rarity], padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800 }}>
                  {c.emoji} {c.name}
                </span>
              );
            })}
            {Object.keys(equipped).length === 0 && <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>Nothing equipped yet. Tap a card below to equip.</div>}
          </div>
        </div>
      </div>

      {kinds.map((k) => (
        <div key={k.id} className="card">
          <SectionHeader title={k.label} eyebrow={`${(byKind[k.id] || []).filter((c) => unlocked.has(c.id)).length} / ${(byKind[k.id] || []).length}`} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
            {(byKind[k.id] || []).map((c) => {
              const got = unlocked.has(c.id);
              const isEquipped = equipped[c.kind] === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => got && toggleEquip(c)}
                  disabled={!got}
                  style={{
                    padding: 16,
                    background: got ? (isEquipped ? window.Gamify.RARITY_COLORS[c.rarity] + "18" : "var(--bg-card)") : "var(--bg-soft)",
                    border: isEquipped ? `2.5px solid ${window.Gamify.RARITY_COLORS[c.rarity]}` : got ? `2px solid ${window.Gamify.RARITY_COLORS[c.rarity]}` : "1.5px dashed var(--line-strong)",
                    borderRadius: 14,
                    textAlign: "center",
                    opacity: got ? 1 : 0.55,
                    cursor: got ? "pointer" : "not-allowed",
                    transition: "transform 0.12s",
                  }}
                >
                  <div style={{ fontSize: 36, filter: got ? "none" : "grayscale(1)" }}>{c.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: 13, marginTop: 6 }}>{c.name}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 4, color: window.Gamify.RARITY_COLORS[c.rarity] }}>{c.rarity}</div>
                  {got && (
                    <div style={{ fontSize: 10, fontWeight: 800, marginTop: 6, color: isEquipped ? window.Gamify.RARITY_COLORS[c.rarity] : "var(--ink-mute)" }}>
                      {isEquipped ? "✓ Equipped" : "Tap to equip"}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function LootboxModal({ result, onClose }) {
  const [opened, setOpened] = React.useState(false);
  React.useEffect(() => {
    window.FX && window.FX.Sound.lootboxOpen();
    const t = setTimeout(() => {
      setOpened(true);
      if (result.item.rarity === "legend" || result.item.rarity === "epic") {
        window.FX && window.FX.fire({ count: 100, origin: { x: 0.5, y: 0.5 }, spread: 90 });
      }
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const item = result.item;
  const rarityColor = window.Gamify.RARITY_COLORS[item.rarity];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,17,13,0.7)", display: "grid", placeItems: "center", zIndex: 300, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: "100%", maxWidth: 380, padding: 32, textAlign: "center", background: `linear-gradient(180deg, ${rarityColor}15, var(--bg-card))`, border: `2px solid ${rarityColor}` }}>
        {!opened && (
          <div style={{ animation: "wiggle 0.6s infinite alternate" }}>
            <div style={{ fontSize: 100, lineHeight: 1 }}>🎁</div>
            <p className="soft" style={{ margin: "12px 0 0" }}>Opening…</p>
          </div>
        )}
        {opened && (
          <div style={{ animation: "popIn 0.4s cubic-bezier(.2,1.4,.5,1) both" }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: rarityColor }}>{item.rarity}</div>
            <div style={{ fontSize: 88, lineHeight: 1, margin: "10px 0" }}>{item.emoji}</div>
            <h2 style={{ marginBottom: 6 }}>{result.duplicate ? "Duplicate!" : "You got it!"}</h2>
            <p className="soft" style={{ marginTop: 0, marginBottom: 16 }}>
              {result.duplicate
                ? <>You already own <b>{item.name}</b>. Converted to <b style={{ color: "#F59E0B" }}>+{result.xpInstead} XP</b>.</>
                : <><b>{item.name}</b> added to your locker.</>}
            </p>
            <button className="btn" onClick={onClose}>Awesome →</button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes wiggle {
          from { transform: rotate(-4deg) scale(1); }
          to { transform: rotate(4deg) scale(1.04); }
        }
        @keyframes popIn {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { StudentHome, ClassFeed, QuestCard, QuestsTab, Locker, LootboxModal });
