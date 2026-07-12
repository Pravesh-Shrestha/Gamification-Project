// academia.io — Learn screen (all subjects + skill tree)

function LearnHub({ profile, onOpenLesson, onOpenSubject }) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <div className="eyebrow">Learn</div>
        <h1>Pick a subject</h1>
        <p className="soft" style={{ maxWidth: 540, marginTop: 6 }}>
          Each subject is a tree of small lessons. Finish a lesson to earn XP, unlock the next one and grow your streak.
        </p>
      </div>

      {window.CURRICULUM.map((subj) => (
        <SubjectSection key={subj.id} subj={subj} profile={profile} onOpenLesson={onOpenLesson} onOpenSubject={onOpenSubject} />
      ))}
    </div>
  );
}

function SubjectSection({ subj, profile, onOpenLesson, onOpenSubject }) {
  const done = new Set(profile.lessonsCompleted);
  const lessons = subj.chapters.flatMap((c) => c.lessons);
  const completed = lessons.filter((l) => done.has(l.id)).length;
  const pct = Math.round((completed / lessons.length) * 100);

  return (
    <div className="card" style={{ padding: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <SubjectMark subject={subj} size={64} />
          <div>
            <h2>{subj.name}</h2>
            <div className="muted" style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{subj.blurb}</div>
          </div>
        </div>
        <button className="btn ghost" onClick={() => onOpenSubject(subj.id)}>Open map →</button>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-soft)" }}>{completed} / {lessons.length} lessons</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: subj.color }}>{pct}%</span>
        </div>
        <div style={{ height: 10, background: subj.accent, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: subj.color, transition: "width 0.5s" }} />
        </div>
      </div>

      <SkillTree subj={subj} profile={profile} onOpenLesson={onOpenLesson} />
    </div>
  );
}

// Khan-Academy-style staggered skill tree. Each lesson is a "node".
// A lesson is unlocked if all prior lessons in the chapter (linear) are complete.
function SkillTree({ subj, profile, onOpenLesson }) {
  const done = new Set(profile.lessonsCompleted);

  return (
    <div style={{ display: "grid", gap: 28 }}>
      {subj.chapters.map((ch, ci) => {
        return (
          <div key={ch.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 12,
                  width: 28,
                  height: 28,
                  borderRadius: 99,
                  background: subj.accent,
                  color: subj.color,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {ci + 1}
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{ch.title}</h3>
            </div>

            <div style={{ position: "relative", paddingLeft: 14 }}>
              {/* connecting line */}
              <div style={{ position: "absolute", left: 28, top: 30, bottom: 30, width: 3, background: subj.accent, borderRadius: 2 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {ch.lessons.map((l, li) => {
                  const isDone = done.has(l.id);
                  const prevDone = li === 0 ? true : done.has(ch.lessons[li - 1].id);
                  const unlocked = prevDone || isDone;
                  const offset = li % 2 === 0 ? 0 : 80; // stagger
                  return (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: offset, transition: "margin 0.3s" }}>
                      <LessonNode lesson={l} done={isDone} unlocked={unlocked} color={subj.color} accent={subj.accent} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ fontWeight: 800, fontSize: 15 }}>{l.title}</div>
                          {isDone && <span style={{ fontSize: 11, fontWeight: 800, background: "#84CC16", color: "white", padding: "2px 8px", borderRadius: 99 }}>DONE</span>}
                          {!unlocked && <span style={{ fontSize: 11, fontWeight: 800, background: "var(--bg-soft)", color: "var(--ink-mute)", padding: "2px 8px", borderRadius: 99 }}>LOCKED</span>}
                        </div>
                        <div className="muted" style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>
                          {l.mins} min · {(l.quiz || []).length} questions
                        </div>
                      </div>
                      <button
                        className="btn"
                        disabled={!unlocked}
                        style={{
                          background: isDone ? "var(--bg-soft)" : subj.color,
                          color: isDone ? "var(--ink)" : "white",
                          padding: "10px 18px",
                          fontSize: 13,
                        }}
                        onClick={() => unlocked && onOpenLesson(l.id)}
                      >
                        {isDone ? "Review" : "Start →"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LessonNode({ lesson, done, unlocked, color, accent }) {
  return (
    <div
      style={{
        position: "relative",
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: done ? color : unlocked ? accent : "var(--bg-soft)",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        border: `3px solid ${done ? color : unlocked ? color : "var(--line-strong)"}`,
        boxShadow: done ? `0 4px 14px ${color}55` : "none",
        zIndex: 1,
      }}
    >
      {done ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10L8 14L16 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : unlocked ? (
        <span style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "var(--font-display)" }}>▶</span>
      ) : (
        <span style={{ fontSize: 16 }}>🔒</span>
      )}
    </div>
  );
}

window.LearnHub = LearnHub;
window.SkillTree = SkillTree;
