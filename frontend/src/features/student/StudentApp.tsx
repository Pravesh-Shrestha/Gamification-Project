import React from "react";
import { LogOut, Flame, ArrowUpCircle, MessageSquare } from "lucide-react";
import { engine } from "../../services/api";

// academia.io — Student app (gamified core)
// Uses the DB profile for `user`. All mutations write back to DB.

function StudentApp({ user: initialUser, onLogout }) {
  const [user, setUser] = React.useState(initialUser);
  const [tab, setTab] = React.useState("home");
  const [openLesson, setOpenLesson] = React.useState(null);
  const [toasts, setToasts] = React.useState([]);
  const [lootbox, setLootbox] = React.useState(null);
  const [logEntries, setLogEntries] = React.useState(() => window.DB.loadLog());
  const [tweaks, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [dbAssignments, setDbAssignments] = React.useState([]);
  const [activeSubjectMap, setActiveSubjectMap] = React.useState(null);
  const [showChat, setShowChat] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  // ensure freezes refreshed weekly
  React.useEffect(() => {
    const u = { ...user };
    window.Gamify.ensureFreezes(u);
    persist(u);
  }, []);

  React.useEffect(() => {
    const handleCurriculum = () => {
      setUser((prev) => ({ ...prev }));
    };
    window.addEventListener("curriculum_loaded", handleCurriculum);
    return () => window.removeEventListener("curriculum_loaded", handleCurriculum);
  }, []);

  // Fetch real gamification data from database on mount
  React.useEffect(() => {
    engine.dashboard()
      .then((data) => {
        setUser((prev) => ({
          ...prev,
          xp: data.gamification.xp,
          streak: data.gamification.streak,
          perfectQuizzes: data.gamification.perfectQuizzes,
          focusMinutes: data.gamification.focusMinutes,
          treesGrown: data.gamification.treesGrown,
          dailyGoal: data.gamification.dailyGoal,
          badges: data.badges.map((b) => b.id),
          cosmetics: data.cosmetics,
          lessonsCompleted: data.recentActivity.map((a) => a.lessonId),
        }));
        setDbAssignments(data.assignments || []);
      })
      .catch((err) => console.error("Failed to load dashboard data from server:", err));
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme || "light");
  }, [tweaks.theme]);

  function persist(u) {
    const db = window.DB.load();
    const found = db.users.find((x) => x.id === u.id);
    if (found) Object.assign(found, u);
    window.DB.save(db);
    setUser(u);
  }

  function pushToast(t) {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { id, ...t }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4200);
  }

  function logEvents(events) {
    if (!events?.length) return;
    window.DB.appendLog(events);
    setLogEntries(window.DB.loadLog());
  }

  async function handleLessonComplete(lessonId, correct, total, comboMax) {
    const lesson = window.findLesson(lessonId);
    let apiXp = 0;
    let apiStreak = user.streak;
    let apiBadges = [];
    let apiLvl = 1;
    let allQuestsDone = [];

    try {
      const apiRes = await engine.completeLesson(lessonId, correct, total, lesson?.subjectId || "math", tweaks.xpMultiplier || 1, comboMax);
      apiXp = apiRes.xpEarned;
      apiStreak = apiRes.newStreak;
      apiBadges = apiRes.newBadges || [];
      apiLvl = apiRes.level;
      if (apiRes.questsState) {
        user.questsState = JSON.parse(apiRes.questsState);
      }
      allQuestsDone = apiRes.completedQuests || [];
    } catch (err) {
      console.error("Failed to persist lesson completion to server:", err);
    }

    const next = { ...user };
    const res = window.Engine.processLessonComplete(next, lessonId, correct, total, { xpMultiplier: tweaks.xpMultiplier || 1 });

    if (apiXp > 0) {
      next.xp = user.xp + apiXp;
      next.streak = apiStreak;
    }

    // Apply combo bonus on top
    const comboMult = window.Gamify.comboMultiplier(comboMax);
    const comboBonus = comboMult > 1 ? Math.round(res.xpGain * (comboMult - 1)) : 0;
    if (comboBonus > 0 && apiXp === 0) {
      next.xp += comboBonus;
      const tk = window.Engine.todayKey();
      next.todayXP[tk] = (next.todayXP[tk] || 0) + comboBonus;
      res.log.push(`Combo ×${comboMult}: +${comboBonus} bonus XP`);
    }

    // Quests (local fallback if server didn't run)
    if (apiXp === 0) {
      const q1 = window.Gamify.applyQuestsForLesson(next, lessonId, correct === total, lesson?.subjectId, comboMax);
      const q2 = window.Gamify.applyQuestsForXp(next, res.xpGain + comboBonus);
      const questXp = q1.bonusXp + q2.bonusXp;
      allQuestsDone = [...q1.completed, ...q2.completed];
      if (questXp > 0) {
        next.xp += questXp;
        const tk = window.Engine.todayKey();
        next.todayXP[tk] = (next.todayXP[tk] || 0) + questXp;
        res.log.push(`Quests completed: +${questXp} bonus`);
      }
    }

    logEvents(res.log);
    pushToast({ icon: "⭐", title: `+${apiXp > 0 ? apiXp : (res.xpGain + comboBonus)} XP`, body: `${correct}/${total} correct${comboMax >= 3 ? ` · ×${comboMult} combo` : ""}` });

    for (const bId of apiBadges) {
      const bDef = window.DB.load().badges?.find(x => x.id === bId) || { name: bId, desc: "Unlocked!", icon: "🏅" };
      pushToast({ icon: bDef.icon, title: `Badge unlocked: ${bDef.name}`, body: bDef.desc, kind: "badge" });
      window.FX && window.FX.Sound.badge();
    }
    for (const q of allQuestsDone) {
      pushToast({ icon: "🎯", title: `Quest complete: ${q.text}`, body: `+${q.reward} XP` });
    }

    // FX on perfect or combo
    if (correct === total) {
      window.FX && window.FX.fire({ count: 120, origin: { x: 0.5, y: 0.4 } });
      window.FX && window.FX.Sound.perfect();
    } else if (comboMax >= 3) {
      window.FX && window.FX.fire({ count: 60, origin: { x: 0.5, y: 0.5 } });
    }

    // Lootbox roll
    if (correct === total || Math.random() < 0.5) {
      const result = window.Gamify.rollLootbox(next.cosmetics || []);
      if (result.duplicate) {
        next.xp += result.xpInstead;
        const tk = window.Engine.todayKey();
        next.todayXP[tk] = (next.todayXP[tk] || 0) + result.xpInstead;
      } else {
        next.cosmetics = [...(next.cosmetics || []), result.item.id];
      }
      setTimeout(() => setLootbox(result), 600);
    }

    // Level notifications
    const newLvl = apiXp > 0 ? apiLvl : window.Engine.levelFromXP(next.xp);
    if (newLvl > window.Engine.levelFromXP(user.xp)) {
      pushToast({ icon: <ArrowUpCircle size={22} color="#10B981" />, title: `Level ${newLvl}!`, body: "You're getting stronger.", kind: "badge" });
      window.DB.pushFeed(window.DB.load(), { userId: user.id, kind: "level", payload: { level: newLvl } });
      window.DB.notify(window.DB.load(), user.id, { kind: "level", title: `Level ${newLvl}!`, body: "You're getting stronger — keep it up." });
      window.FX && window.FX.fire({ count: 150, origin: { x: 0.5, y: 0.5 }, spread: 90 });
      window.FX && window.FX.Sound.levelUp();
    }

    // Balance check
    const bc = window.Engine.balanceCheck(next, tweaks.balanceMode);
    if (bc.warn) {
      pushToast({ icon: "🌿", title: "Take a break", body: bc.message, kind: "warn" });
    }

    persist(next);
  }

  async function handleFocusComplete(minutes) {
    let apiXp = 0;
    let serverQuests = [];
    try {
      const apiRes = await engine.completeFocus(minutes);
      apiXp = apiRes.xpEarned;
      if (apiRes.questsState) {
        user.questsState = JSON.parse(apiRes.questsState);
      }
      serverQuests = apiRes.completedQuests || [];
    } catch (err) {
      console.error("Failed to persist focus to server:", err);
    }

    const next = { ...user };
    const res = window.Engine.processFocusComplete(next, minutes, { xpMultiplier: tweaks.xpMultiplier || 1 });

    if (apiXp > 0) {
      next.xp = user.xp + apiXp;
      next.focusMinutes = user.focusMinutes + minutes;
      next.treesGrown = user.treesGrown + 1;
    }

    // Quests (local fallback if server didn't run)
    let localQuests = [];
    if (apiXp === 0) {
      const q1 = window.Gamify.applyQuestsForFocus(next, minutes);
      const q2 = window.Gamify.applyQuestsForXp(next, res.xp);
      const questXp = q1.bonusXp + q2.bonusXp;
      localQuests = [...q1.completed, ...q2.completed];
      if (questXp > 0) {
        next.xp += questXp;
        const tk = window.Engine.todayKey();
        next.todayXP[tk] = (next.todayXP[tk] || 0) + questXp;
        res.log.push(`Focus quests: +${questXp}`);
      }
    }

    logEvents(res.log);
    pushToast({ icon: "🌳", title: `+${apiXp > 0 ? apiXp : res.xp} XP`, body: `${minutes} min focused — tree grown` });
    for (const b of res.newBadges) pushToast({ icon: b.icon, title: `Badge: ${b.name}`, body: b.desc, kind: "badge" });
    
    const finalQuests = apiXp > 0 ? serverQuests : localQuests;
    for (const q of finalQuests) {
      pushToast({ icon: "🎯", title: `Quest complete: ${q.text}`, body: `+${q.reward} XP` });
    }
    persist(next);
  }

  function handleUpdate(patch) {
    persist({ ...user, ...patch });
  }

  const db = window.DB.load();
  const myClasses = window.DB.classesByStudent(db, user.id);
  const assignments = dbAssignments.length ? dbAssignments : window.DB.assignmentsForStudent(db, user.id);

  // Lesson view (full-bleed inside shell)
  if (openLesson) {
    return (
      <div className="app-shell">
        <div style={{ padding: "16px 0", display: "flex", alignItems: "center", gap: 14 }}>
          <Logo size={36} />
        </div>
        <LessonPlayer
          lessonId={openLesson}
          profile={user}
          opts={{ xpMultiplier: tweaks.xpMultiplier || 1, enableCombo: true }}
          onComplete={(id, c, t, comboMax) => {
            handleLessonComplete(id, c, t, comboMax || 0);
          }}
          onExit={() => setOpenLesson(null)}
        />
        <Toasts items={toasts} onDismiss={(id) => setToasts((ts) => ts.filter((t) => t.id !== id))} />
        {lootbox && <LootboxModal result={lootbox} onClose={() => setLootbox(null)} />}
      </div>
    );
  }

  const recommended = window.Engine.recommendNext(user);

  return (
    <RoleShell user={user} onLogout={onLogout} roleLabel="Student" tint="var(--primary)">
      <RoleTabs current={tab} onChange={setTab} tabs={[
        { id: "home", label: "Home" },
        { id: "learn", label: "Learn" },
        { id: "quests", label: "Quests" },
        { id: "focus", label: "Focus", group: "LEARNING" },
        { id: "stats", label: "Stats" },
        { id: "locker", label: "Locker", group: "ACCOUNT" },
        { id: "profile", label: "Profile" },
      ]} />

      {tab === "home" && (
        <div style={{ display: "grid", gap: 18 }}>
          <CockpitBanner
            eyebrow="STUDENT COCKPIT"
            greeting={`Welcome back, ${user.name.split(" ")[0]}!`}
            sub={<>You have earned <strong>{(user.xp || 0).toLocaleString()} XP</strong> and are on a <strong>{user.streak || 0} day streak</strong>. Keep going!</>}
            actions={
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {recommended ? (
                  <button className="btn" style={{ background: recommended.color || "var(--accent)", color: "white", fontSize: 13, padding: "8px 16px" }} onClick={() => setOpenLesson(recommended.id)}>
                    Continue: {recommended.title} →
                  </button>
                ) : (
                  <button className="btn ghost" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => setTab("learn")}>
                    Browse Subjects →
                  </button>
                )}
                <button onClick={() => setShowChat(true)}
                  style={{ padding: "8px 16px", borderRadius: 99, background: "linear-gradient(135deg, #A855F7, #EC4899)", color: "white", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer" }}>
                  <MessageSquare size={14} /> Study Buddy
                </button>
              </div>
            }
          />
          <StudentHome
            user={user}
            db={db}
            assignments={assignments}
            classes={myClasses}
            onOpenLesson={(id) => setOpenLesson(id)}
            onTab={setTab}
          />
        </div>
      )}
      {tab === "learn" && (
        <LearnHub
          profile={user}
          onOpenLesson={(id) => setOpenLesson(id)}
          onOpenSubject={(id) => setActiveSubjectMap(id)}
        />
      )}
      {tab === "quests" && (
        <QuestsTab user={user} db={db} classes={myClasses} />
      )}
      {tab === "focus" && (
        <FocusMode profile={user} onComplete={handleFocusComplete} onExit={() => setTab("home")} />
      )}
      {tab === "stats" && (
        <Analytics />
      )}
      {tab === "locker" && (
        <Locker user={user} onUpdate={handleUpdate} />
      )}
      {tab === "profile" && (
        <Profile
          profile={user}
          onReset={() => {
            if (confirm("Reset YOUR progress only? (Other accounts unaffected.)")) {
              const db = window.DB.load();
              const u = db.users.find((x) => x.id === user.id);
              if (u) {
                Object.assign(u, {
                  xp: 0, streak: 0, streakDays: [], lessonsCompleted: [], perfectQuizzes: 0,
                  focusMinutes: 0, treesGrown: 0, badges: [], todayXP: {}, cosmetics: [], questsState: {},
                });
                window.DB.save(db);
                setUser({ ...u });
              }
            }
          }}
          onUpdate={handleUpdate}
        />
      )}

      {/* Global Overlays */}
      <Toasts items={toasts} onDismiss={(id) => setToasts((ts) => ts.filter((t) => t.id !== id))} />
      {lootbox && <LootboxModal result={lootbox} onClose={() => setLootbox(null)} />}
      {tweaks.showEngineLog && (
        <EngineLog
          entries={logEntries}
          onClear={() => { window.DB.clearLog(); setLogEntries([]); }}
          onClose={() => setTweak("showEngineLog", false)}
        />
      )}

      <TweaksPanel title="academia.io · Tweaks">
        <TweakSection label="Appearance">
          <TweakRadio label="Theme" value={tweaks.theme} options={["light", "dark"]} onChange={(v) => setTweak("theme", v)} />
        </TweakSection>
        <TweakSection label="Engine">
          <TweakSlider label="XP multiplier (demo)" value={tweaks.xpMultiplier} min={0.5} max={5} step={0.5} unit="×" onChange={(v) => setTweak("xpMultiplier", v)} />
          <TweakRadio label="Balance mode" value={tweaks.balanceMode} options={["strict", "balanced", "relaxed"]} onChange={(v) => setTweak("balanceMode", v)} />
          <TweakToggle label="Show engine log" value={tweaks.showEngineLog} onChange={(v) => setTweak("showEngineLog", v)} />
        </TweakSection>
        <TweakSection label="Demo">
          <TweakButton label="Reset all data" onClick={() => { if (confirm("Wipe ALL data and reseed demo?")) { window.DB.reseed(); onLogout(); } }} />
          <TweakButton label="Open a mystery box" onClick={() => {
            const result = window.Gamify.rollLootbox(user.cosmetics || []);
            const next = { ...user };
            if (result.duplicate) next.xp += result.xpInstead;
            else next.cosmetics = [...(next.cosmetics || []), result.item.id];
            persist(next);
            setLootbox(result);
          }} />
        </TweakSection>
      </TweaksPanel>

      {/* Learning Map Modal */}
      {activeSubjectMap && (
        <SubjectMapModal
          subjectId={activeSubjectMap}
          profile={user}
          onClose={() => setActiveSubjectMap(null)}
          onOpenLesson={(id) => { setOpenLesson(id); setActiveSubjectMap(null); }}
        />
      )}

      {showChat && <ChatBot onClose={() => setShowChat(false)} />}
    </RoleShell>
  );
}

function SubjectMapModal({ subjectId, profile, onClose, onOpenLesson }) {
  const db = window.DB.load();
  const subj = window.findSubject(subjectId) || window.CURRICULUM.find(s => s.id === subjectId);
  if (!subj) return null;
  const done = new Set(profile.lessonsCompleted);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(20, 17, 13, 0.85)", backdropFilter: "blur(8px)",
      zIndex: 200, display: "grid", placeItems: "center", padding: 24,
      animation: "scaleIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both"
    }}>
      <div className="card" style={{
        width: "100%", maxWidth: 850, maxHeight: "90vh", overflowY: "auto",
        position: "relative", padding: 32, display: "flex", flexDirection: "column", gap: 24,
        background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 24,
        boxShadow: "var(--shadow-xl)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <SubjectMark subject={subj} size={48} />
            <div>
              <div className="eyebrow" style={{ color: subj.color }}>Learning Map</div>
              <h1 style={{ fontSize: 24 }}>{subj.name}</h1>
            </div>
          </div>
          <button className="btn ghost" onClick={onClose}>Close Map</button>
        </div>

        {/* Map visual path */}
        <div style={{
          background: "var(--bg-soft)", borderRadius: 16, border: "1.5px solid var(--line)",
          padding: "40px 24px", display: "flex", flexDirection: "column", gap: 40,
          position: "relative", minHeight: 300, overflowX: "hidden"
        }}>
          {subj.chapters.map((ch, ci) => (
            <div key={ch.id} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 800, padding: "3px 10px", borderRadius: 99, background: subj.accent, color: subj.color }}>Chapter {ci + 1}</span>
                <h3 style={{ margin: 0, fontSize: 16 }}>{ch.title}</h3>
              </div>

              {/* Staggered visual board-game path */}
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap", paddingLeft: 12, position: "relative" }}>
                {ch.lessons.map((l, li) => {
                  const isDone = done.has(l.id);
                  const prevDone = li === 0 ? true : done.has(ch.lessons[li - 1].id);
                  const unlocked = prevDone || isDone;

                  return (
                    <button
                      key={l.id}
                      disabled={!unlocked}
                      onClick={() => onOpenLesson(l.id)}
                      className="card"
                      style={{
                        padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
                        minWidth: 180, cursor: unlocked ? "pointer" : "not-allowed",
                        opacity: unlocked ? 1 : 0.6,
                        border: `2px solid ${isDone ? "#84CC16" : unlocked ? subj.color : "var(--line-strong)"}`,
                        boxShadow: isDone ? "0 4px 10px rgba(132, 204, 22, 0.15)" : unlocked ? "0 4px 10px rgba(108, 60, 225, 0.1)" : "none",
                        background: "var(--bg-card)",
                        transition: "transform 0.2s",
                        transform: unlocked ? "scale(1)" : "scale(0.96)",
                      }}
                      onMouseEnter={(e) => unlocked && (e.currentTarget.style.transform = "scale(1.04)")}
                      onMouseLeave={(e) => unlocked && (e.currentTarget.style.transform = "scale(1)")}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: isDone ? "#84CC16" : unlocked ? subj.color : "var(--bg-soft)",
                        display: "grid", placeItems: "center", color: "white", flexShrink: 0
                      }}>
                        {isDone ? "✓" : unlocked ? "▶" : "🔒"}
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 800, fontSize: 12, color: "var(--ink)" }}>{l.title}</div>
                        <div className="muted" style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>{l.mins} mins</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.StudentApp = StudentApp;
