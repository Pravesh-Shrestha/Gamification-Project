import React from "react";
import { getClassClusters } from "../../services/teacher";

// academia.io - Teacher dashboard

function TeacherApp({ user, onLogout }) {
  const [db, setDb] = React.useState(() => window.DB.load());
  const [tab, setTab] = React.useState("overview");
  const [selectedClass, setSelectedClass] = React.useState(null);
  const [assigning, setAssigning] = React.useState(null);
  const [myAssignments, setMyAssignments] = React.useState([]);

  function refresh() { setDb({ ...window.DB.load() }); }

  React.useEffect(() => {
    import("../../services/teacher").then(({ getClassOverview }) => {
      getClassOverview()
        .then((studentsData) => {
          setDb((prev) => {
            const next = { ...prev };
            next.users = next.users.map((u) => {
              const realS = studentsData.find((s) => s.id === u.id);
              if (realS) {
                return {
                  ...u,
                  xp: realS.xp,
                  streak: realS.streak,
                  perfectQuizzes: realS.perfectQuizzes,
                  focusMinutes: realS.focusMinutes,
                  treesGrown: realS.treesGrown,
                  badges: realS.badges.map((b) => b.badgeId),
                  lessonsCompleted: realS.lessonsCompleted || u.lessonsCompleted,
                };
              }
              return u;
            });
            return next;
          });
        })
        .catch((err) => console.error("Failed to load real teacher class data:", err));
    });
  }, []);

  React.useEffect(() => {
    import("../../services/teacher").then(({ listAssignments }) => {
      listAssignments()
        .then((data) => {
          setMyAssignments(data || []);
        })
        .catch((err) => console.error("Failed to load assignments:", err));
    });
  }, [db]);

  const school = window.DB.schoolById(db, user.schoolId);
  const myClasses = window.DB.classesByTeacher(db, user.id);
  const allStudents = myClasses.flatMap((c) => c.studentIds.map((id) => window.DB.userById(db, id))).filter(Boolean) as any[];
  const uniqueStudents = Array.from(new Map(allStudents.map((s) => [s.id, s])).values());

  const totalLessons = uniqueStudents.reduce((a, s) => a + (s.lessonsCompleted || []).length, 0);
  const activeToday = uniqueStudents.filter((s) => ((s.todayXP || {})[window.Engine.todayKey()] || 0) > 0).length;

  return (
    <RoleShell user={user} onLogout={onLogout} roleLabel="Teacher" tint={school?.color || "#10B981"}>
      <RoleTabs current={tab} onChange={setTab} tabs={[
        { id: "overview", label: "Overview" },
        { id: "classes", label: "My classes", badge: myClasses.length },
        { id: "assignments", label: "Assignments", badge: myAssignments.length },
        { id: "curriculum", label: "Curriculum Hub", group: "OPERATIONS" },
        { id: "leaderboard", label: "Leaderboard" },
      ]} />

      {tab === "overview" && (
        <div style={{ display: "grid", gap: 18 }}>
          <CockpitBanner
            eyebrow="INSTRUCTOR COCKPIT"
            greeting={`Good morning, ${user.name.split(" ")[0]}.`}
            sub={<>You have <strong>{myClasses.length} active classes</strong> with <strong>{uniqueStudents.length} students</strong> enrolled.</>}
            actions={
              <button className="btn" onClick={() => setTab("assignments")} style={{ fontSize: 13 }}>+ Quick Assignment</button>
            }
          />
          <div className="stats-grid">
            <BigStat label="My classes" value={myClasses.length} color={school?.color} />
            <BigStat label="Total students" value={uniqueStudents.length} color="#A855F7" />
            <BigStat label="Active today" value={activeToday} color="#10B981" sub={`of ${uniqueStudents.length}`} />
            <BigStat label="Lessons done" value={totalLessons} color="#F59E0B" sub="by your students" />
          </div>

          <div className="dashboard-grid-2col">
            <div className="card">
              <SectionHeader title="Students who need attention" eyebrow="Heads up" />
              <div style={{ display: "grid", gap: 8 }}>
                {uniqueStudents
                  .filter((s) => (s.streak || 0) <= 1 || ((s.todayXP || {})[window.Engine.todayKey()] || 0) === 0)
                  .sort((a, b) => (a.xp || 0) - (b.xp || 0))
                  .slice(0, 5)
                  .map((s) => <StudentRow key={s.id} student={s} />)}
                {uniqueStudents.every((s) => (s.streak || 0) > 1 && ((s.todayXP || {})[window.Engine.todayKey()] || 0) > 0) && (
                  <div className="muted" style={{ padding: 14, textAlign: "center", fontWeight: 700 }}>Everyone's on track today! ✨</div>
                )}
              </div>
            </div>

            <div className="card">
              <SectionHeader title="Recent assignments" eyebrow="What you set" />
              <div style={{ display: "grid", gap: 8 }}>
                {myAssignments.slice(0, 4).map((a) => {
                  const lesson = window.findLesson(a.lessonId);
                  const cls = db.classes.find((c) => c.id === a.classId);
                  const daysLeft = Math.max(0, Math.ceil((a.dueAt - Date.now()) / (1000 * 60 * 60 * 24)));
                  return (
                    <div key={a.id} style={{ padding: "12px 14px", background: "var(--bg-soft)", borderRadius: 10 }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{lesson?.title}</div>
                      <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginTop: 2 }}>
                        {cls?.name} · due in {daysLeft}d
                      </div>
                    </div>
                  );
                })}
                {myAssignments.length === 0 && <div className="muted" style={{ padding: 14, textAlign: "center", fontWeight: 700 }}>No assignments yet.</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "classes" && (
        <div>
          {!selectedClass && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2>Your classes</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {myClasses.map((c) => {
                  const cStudents = c.studentIds.map((id) => window.DB.userById(db, id)).filter(Boolean);
                  const xp = cStudents.reduce((a, s) => a + (s.xp || 0), 0);
                  return (
                    <button key={c.id} onClick={() => setSelectedClass(c.id)} className="card" style={{ padding: 20, textAlign: "left", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 18 }}>{c.name}</div>
                          <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>{c.grade} · {cStudents.length} students</div>
                        </div>
                        <span style={{ fontSize: 22 }}>📚</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        {cStudents.slice(0, 5).map((s) => {
                          const avatarMap = { hat: "🎓", panda: "🐼", fox: "🦊", cat: "🐱", dog: "🐶", owl: "🦉", penguin: "🐧", bunny: "🐰", bear: "🐻", frog: "🐸", monkey: "🐵", unicorn: "🦄" };
                          return (
                            <div key={s.id} style={{ width: 28, height: 28, borderRadius: 99, background: "var(--bg-soft)", display: "grid", placeItems: "center", fontSize: 14 }}>{avatarMap[s.avatar] || "🎓"}</div>
                          );
                        })}
                        {cStudents.length > 5 && <div className="muted" style={{ fontSize: 11, fontWeight: 700, alignSelf: "center" }}>+{cStudents.length - 5}</div>}
                      </div>
                      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px dashed var(--line)", display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div className="muted" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>Class XP</div>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>{xp.toLocaleString()}</div>
                        </div>
                        <div style={{ alignSelf: "end", fontSize: 12, fontWeight: 800, color: "var(--ink-mute)" }}>Open →</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedClass && <ClassDetail classId={selectedClass} db={db} user={user} onBack={() => setSelectedClass(null)} onAssign={(lessonId) => setAssigning({ classId: selectedClass, lessonId })} onChange={refresh} />}
        </div>
      )}

      {tab === "assignments" && (
        <AssignmentsTab user={user} db={db} assignments={myAssignments} onChange={refresh} onAssign={() => setAssigning({ classId: myClasses[0]?.id, lessonId: null })} />
      )}

      {tab === "curriculum" && (
        <CurriculumHub onChange={refresh} />
      )}

      {tab === "leaderboard" && (
        <div className="card">
          <SectionHeader title="All your students" eyebrow="Across your classes" />
          <Leaderboard students={uniqueStudents.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0))} />
        </div>
      )}

      {assigning && (
        <AssignModal
          classId={assigning.classId}
          presetLessonId={assigning.lessonId}
          classes={myClasses}
          user={user}
          onClose={() => setAssigning(null)}
          onAssign={(data) => {
            import("../../services/teacher").then(({ createAssignment }) => {
              createAssignment(data.classId, data.lessonId, data.dueAt, data.note)
                .then(() => {
                  refresh();
                  setAssigning(null);
                })
                .catch((err) => alert("Failed to assign: " + err.message));
            });
          }}
        />
      )}
    </RoleShell>
  );
}

function StudentRow({ student }) {
  const avatarMap = { hat: "🎓", panda: "🐼", fox: "🦊", cat: "🐱", dog: "🐶", owl: "🦉", penguin: "🐧", bunny: "🐰", bear: "🐻", frog: "🐸", monkey: "🐵", unicorn: "🦄" };
  const todayXp = (student.todayXP || {})[window.Engine.todayKey()] || 0;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "32px 1fr auto auto", gap: 12, alignItems: "center", padding: "8px 12px", background: "var(--bg-soft)", borderRadius: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--bg-card)", display: "grid", placeItems: "center", fontSize: 16 }}>{avatarMap[student.avatar] || "🎓"}</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13 }}>{student.name}</div>
        <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{student.grade}</div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 800, color: todayXp > 0 ? "#10B981" : "#EF4444" }}>
        {todayXp > 0 ? `${todayXp} XP today` : "Idle today"}
      </div>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#F59E0B" }}>🔥 {student.streak || 0}</div>
    </div>
  );
}

function ClassDetail({ classId, db, user, onBack, onAssign, onChange }) {
  const cls = db.classes.find((c) => c.id === classId);
  if (!cls) return <div>Class not found.</div>;
  const cStudents = cls.studentIds.map((id) => window.DB.userById(db, id)).filter(Boolean);
  const sorted = cStudents.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const assignments = db.assignments.filter((a) => a.classId === classId);

  const [clusters, setClusters] = React.useState([]);

  React.useEffect(() => {
    getClassClusters(classId)
      .then((data) => setClusters(data))
      .catch((err) => console.error("Failed to load clusters:", err));
  }, [classId]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <button className="btn ghost" onClick={onBack} style={{ alignSelf: "flex-start" }}>← Back to classes</button>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="eyebrow">Class</div>
            <h1>{cls.name}</h1>
            <div className="muted" style={{ fontWeight: 700 }}>{cls.grade} · {cStudents.length} students</div>
          </div>
          <button className="btn" onClick={() => onAssign(null)}>+ Assign a lesson</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card">
          <SectionHeader title="Leaderboard" eyebrow="Class ranking" />
          <Leaderboard students={sorted} />
        </div>

        <div className="card">
          <SectionHeader title="Per-lesson completion" eyebrow="Progress matrix" />
          <ProgressMatrix students={cStudents} />
        </div>
      </div>

      {/* ML Clustering Analytics */}
      {clusters.length > 0 && (
        <div className="card" style={{ padding: 24, background: "linear-gradient(135deg, rgba(124, 58, 237, 0.02) 0%, rgba(59, 130, 246, 0.02) 100%)" }}>
          <SectionHeader title="ML Class Cohorts (K-Means Clustering)" eyebrow="Cognitive grouping" />
          <div className="cohort-grid-3col">
            
            {/* Cluster 0: High-Achieving Explorers */}
            <div style={{ padding: 16, background: "var(--bg-soft)", borderRadius: 12, border: "1.5px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: "#10B981" }}>🚀 High-Achieving Explorers</span>
                <span className="badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981", fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>
                  {clusters.filter(c => c.clusterLabel === "High-Achieving Explorers").length}
                </span>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {clusters.filter(c => c.clusterLabel === "High-Achieving Explorers").map(c => (
                  <StudentClusterRow key={c.id} student={c} color="#10B981" />
                ))}
                {clusters.filter(c => c.clusterLabel === "High-Achieving Explorers").length === 0 && (
                  <div className="muted" style={{ padding: 8, textAlign: "center", fontSize: 11 }}>No students in this group.</div>
                )}
              </div>
            </div>

            {/* Cluster 1: Steady Learners */}
            <div style={{ padding: 16, background: "var(--bg-soft)", borderRadius: 12, border: "1.5px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: "#3B82F6" }}>Steady Learners</span>
                <span className="badge" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6", fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>
                  {clusters.filter(c => c.clusterLabel === "Steady Learners").length}
                </span>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {clusters.filter(c => c.clusterLabel === "Steady Learners").map(c => (
                  <StudentClusterRow key={c.id} student={c} color="#3B82F6" />
                ))}
                {clusters.filter(c => c.clusterLabel === "Steady Learners").length === 0 && (
                  <div className="muted" style={{ padding: 8, textAlign: "center", fontSize: 11 }}>No students in this group.</div>
                )}
              </div>
            </div>

            {/* Cluster 2: Struggling / At Risk */}
            <div style={{ padding: 16, background: "var(--bg-soft)", borderRadius: 12, border: "1.5px solid #EF4444" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: "#EF4444" }}>⚠️ Struggling / At Risk</span>
                <span className="badge" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>
                  {clusters.filter(c => c.clusterLabel === "Struggling / At Risk").length}
                </span>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {clusters.filter(c => c.clusterLabel === "Struggling / At Risk").map(c => (
                  <StudentClusterRow key={c.id} student={c} color="#EF4444" />
                ))}
                {clusters.filter(c => c.clusterLabel === "Struggling / At Risk").length === 0 && (
                  <div className="muted" style={{ padding: 8, textAlign: "center", fontSize: 11 }}>No students in this group.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="card">
        <SectionHeader title="Class assignments" eyebrow={`${assignments.length} active`} />
        <AssignmentList
          assignments={assignments}
          db={db}
          students={cStudents}
          onDelete={(id) => {
            window.DB.deleteAssignment(window.DB.load(), id);
            onChange();
          }}
        />
      </div>
    </div>
  );
}

function StudentClusterRow({ student, color }) {
  const avatarMap = { hat: "🎓", panda: "🐼", fox: "🦊", cat: "🐱", dog: "🐶", owl: "🦉", penguin: "🐧", bunny: "🐰", bear: "🐻", frog: "🐸", monkey: "🐵", unicorn: "🦄" };
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", background: "var(--bg)", borderRadius: 8, borderLeft: `3px solid ${color}` }}>
      <span style={{ fontSize: 14 }}>{avatarMap[student.avatar] || "🎓"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 800 }}>{student.name}</div>
        <div className="muted" style={{ fontSize: 8, fontWeight: 700, marginTop: 1 }}>
          Acc: {student.features?.accuracy || 0}% · Active: {student.features?.consistency || 0}%
        </div>
      </div>
    </div>
  );
}

function ProgressMatrix({ students }) {
  const lessons = window.allLessons();
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `120px repeat(${lessons.length}, 18px)`, gap: 3, alignItems: "center" }}>
        <div></div>
        {lessons.map((l) => (
          <div key={l.id} title={l.title} style={{ height: 18, background: l.color, opacity: 0.18, borderRadius: 3 }} />
        ))}
        {students.map((s) => (
          <React.Fragment key={s.id}>
            <div style={{ fontSize: 11, fontWeight: 700, paddingRight: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
            {lessons.map((l) => {
              const done = (s.lessonsCompleted || []).includes(l.id);
              return <div key={l.id} title={l.title} style={{ width: 18, height: 18, borderRadius: 3, background: done ? l.color : "var(--bg-soft)" }} />;
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function AssignmentsTab({ user, db, assignments, onChange, onAssign }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2>All assignments</h2>
        <button className="btn" onClick={onAssign}>+ New assignment</button>
      </div>
      <div className="card">
        <AssignmentList
          assignments={assignments}
          db={db}
          students={db.users.filter((u) => u.role === "student")}
          onDelete={(id) => {
            import("../../services/teacher").then(({ deleteAssignment }) => {
              deleteAssignment(id)
                .then(() => onChange())
                .catch((err) => alert("Failed to delete: " + err.message));
            });
          }}
        />
      </div>
    </div>
  );
}

function AssignmentList({ assignments, db, students, onDelete }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {assignments.map((a) => {
        const lesson = window.findLesson(a.lessonId);
        const cls = db.classes.find((c) => c.id === a.classId);
        const classStudents = cls ? cls.studentIds.map((id) => window.DB.userById(db, id)).filter(Boolean) : [];
        const completed = classStudents.filter((s) => (s.lessonsCompleted || []).includes(a.lessonId)).length;
        const daysLeft = Math.ceil((a.dueAt - Date.now()) / (1000 * 60 * 60 * 24));
        const overdue = daysLeft < 0;
        return (
          <div key={a.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px auto", gap: 14, alignItems: "center", padding: "14px 18px", background: "var(--bg-soft)", borderRadius: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{lesson?.title}</div>
              <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{cls?.name} · {lesson?.subjectName}</div>
              {a.note && <div className="muted" style={{ fontSize: 11, fontWeight: 600, fontStyle: "italic", marginTop: 4 }}>"{a.note}"</div>}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Completion</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ height: 6, background: "var(--line)", borderRadius: 99, flex: 1, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: classStudents.length ? `${(completed / classStudents.length) * 100}%` : "0%", background: "#10B981" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800 }}>{completed}/{classStudents.length}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Due</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: overdue ? "#EF4444" : "var(--ink)" }}>{overdue ? `${-daysLeft}d ago` : `in ${daysLeft}d`}</div>
            </div>
            <button onClick={() => onDelete(a.id)} style={{ color: "#EF4444", padding: "4px 10px", borderRadius: 8, fontWeight: 800, fontSize: 11 }}>Delete</button>
          </div>
        );
      })}
      {assignments.length === 0 && <div className="muted" style={{ padding: 22, textAlign: "center", fontWeight: 700 }}>No assignments yet.</div>}
    </div>
  );
}

function AssignModal({ classId, presetLessonId, classes, user, onClose, onAssign }) {
  const [chosenClass, setChosenClass] = React.useState(classId || classes[0]?.id);
  const [lessonId, setLessonId] = React.useState(presetLessonId || "");
  const [days, setDays] = React.useState(5);
  const [note, setNote] = React.useState("");

  const allLessons = window.allLessons();
  // optionally filter by teacher subjects
  const filtered = user.subjects && user.subjects.length ? allLessons.filter((l) => user.subjects.includes(l.subjectId)) : allLessons;

  function submit() {
    const due = Date.now() + days * 24 * 60 * 60 * 1000;
    onAssign({ classId: chosenClass, lessonId, dueAt: due, note });
  }

  return (
    <Modal title="Assign a lesson" onClose={onClose} width={520}>
      <Select label="Class" value={chosenClass} onChange={setChosenClass} options={classes.map((c) => ({ value: c.id, label: c.name }))} />
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "var(--ink-soft)" }}>Lesson</div>
        <div style={{ maxHeight: 220, overflowY: "auto", background: "var(--bg-soft)", borderRadius: 10, padding: 8 }}>
          {filtered.map((l) => (
            <label key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: lessonId === l.id ? "var(--bg-card)" : "transparent" }}>
              <input type="radio" name="lesson" checked={lessonId === l.id} onChange={() => setLessonId(l.id)} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{l.title}</div>
                <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{l.subjectName} · {l.chapterTitle}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <Select label="Due in" value={days} onChange={(v) => setDays(Number(v))} options={[1, 3, 5, 7, 14].map((d) => ({ value: d, label: `${d} day${d === 1 ? "" : "s"}` }))} />
      <Field label="Note (optional)" value={note} onChange={setNote} placeholder="Read carefully before quiz." />
      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={!chosenClass || !lessonId} onClick={submit}>Assign</button>
      </div>
    </Modal>
  );
}

function CurriculumHub({ onChange }) {
  const [subjects, setSubjects] = React.useState(() => window.CURRICULUM || []);
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("");
  const [selectedChapterId, setSelectedChapterId] = React.useState("");
  
  const [showAddSubject, setShowAddSubject] = React.useState(false);
  const [showAddChapter, setShowAddChapter] = React.useState(false);
  const [showAddLesson, setShowAddLesson] = React.useState(false);

  const [subjId, setSubjId] = React.useState("");
  const [subjName, setSubjName] = React.useState("");
  const [subjColor, setSubjColor] = React.useState("#3B82F6");
  const [subjIcon, setSubjIcon] = React.useState("📚");
  const [subjBlurb, setSubjBlurb] = React.useState("");

  const [chapId, setChapId] = React.useState("");
  const [chapTitle, setChapTitle] = React.useState("");
  const [chapOrder, setChapOrder] = React.useState(1);

  const [lesId, setLesId] = React.useState("");
  const [lesTitle, setLesTitle] = React.useState("");
  const [lesMins, setLesMins] = React.useState(5);
  const [lesOrder, setLesOrder] = React.useState(1);

  const [slides, setSlides] = React.useState<any[]>([{ kind: "intro", body: "" }]);
  const [quiz, setQuiz] = React.useState<any[]>([{ kind: "mcq", q: "", choices: ["", "", "", ""], answer: 0, hint: "" }]);

  React.useEffect(() => {
    setSubjects(window.CURRICULUM || []);
    const handleCurriculum = () => {
      setSubjects(window.CURRICULUM || []);
    };
    window.addEventListener("curriculum_loaded", handleCurriculum);
    return () => window.removeEventListener("curriculum_loaded", handleCurriculum);
  }, []);

  async function handleAddSubject(e) {
    e.preventDefault();
    if (!subjId || !subjName) return;
    try {
      const { content } = await import("../../services/api");
      const data = { id: subjId, name: subjName, color: subjColor, icon: subjIcon, blurb: subjBlurb };
      await content.createSubject(data);

      const formattedSubj = { ...data, chapters: [], accent: subjColor + "1A" };
      window.CURRICULUM = [...window.CURRICULUM, formattedSubj];
      window.dispatchEvent(new Event("curriculum_loaded"));
      
      setShowAddSubject(false);
      setSubjId("");
      setSubjName("");
      setSubjBlurb("");
    } catch (err) {
      alert("Failed to create subject: " + err.message);
    }
  }

  async function handleAddChapter(e) {
    e.preventDefault();
    if (!chapId || !chapTitle || !selectedSubjectId) return;
    try {
      const { content } = await import("../../services/api");
      const data = { id: chapId, title: chapTitle, order: chapOrder, subjectId: selectedSubjectId };
      await content.createChapter(data);

      const updatedCurriculum = window.CURRICULUM.map((s) => {
        if (s.id === selectedSubjectId) {
          return { ...s, chapters: [...(s.chapters || []), { id: chapId, title: chapTitle, order: chapOrder, lessons: [] }].sort((a,b) => a.order - b.order) };
        }
        return s;
      });
      window.CURRICULUM = updatedCurriculum;
      window.dispatchEvent(new Event("curriculum_loaded"));

      setShowAddChapter(false);
      setChapId("");
      setChapTitle("");
    } catch (err) {
      alert("Failed to create chapter: " + err.message);
    }
  }

  async function handleAddLesson(e) {
    e.preventDefault();
    if (!lesId || !lesTitle || !selectedSubjectId || !selectedChapterId) return;
    try {
      const { content } = await import("../../services/api");
      const data = {
        id: lesId,
        title: lesTitle,
        mins: lesMins,
        order: lesOrder,
        chapterId: selectedChapterId,
        subjectId: selectedSubjectId,
        slides,
        quiz
      };
      await content.createLesson(data);

      const updatedCurriculum = window.CURRICULUM.map((s) => {
        if (s.id === selectedSubjectId) {
          const updatedChapters = s.chapters.map((c) => {
            if (c.id === selectedChapterId) {
              return { ...c, lessons: [...(c.lessons || []), { id: lesId, title: lesTitle, mins: lesMins, order: lesOrder, slides, quiz }].sort((a,b) => a.order - b.order) };
            }
            return c;
          });
          return { ...s, chapters: updatedChapters };
        }
        return s;
      });
      window.CURRICULUM = updatedCurriculum;
      window.dispatchEvent(new Event("curriculum_loaded"));

      setShowAddLesson(false);
      setLesId("");
      setLesTitle("");
      setSlides([{ kind: "intro", body: "" }]);
      setQuiz([{ kind: "mcq", q: "", choices: ["", "", "", ""], answer: 0, hint: "" }]);
    } catch (err) {
      alert("Failed to create lesson: " + err.message);
    }
  }

  const activeSubject = subjects.find(s => s.id === selectedSubjectId);
  const activeChapter = activeSubject?.chapters?.find(c => c.id === selectedChapterId);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Curriculum Hub</h2>
          <div className="muted" style={{ fontWeight: 700 }}>Build and assign interactive courses dynamically.</div>
        </div>
        <button className="btn" onClick={() => setShowAddSubject(true)}>+ New Subject</button>
      </div>

      <div className="curriculum-grid">
        
        <div style={{ display: "grid", gap: 12 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="eyebrow">Subjects</span>
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSubjectId(s.id); setSelectedChapterId(""); }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    textAlign: "left",
                    fontWeight: 800,
                    fontSize: 13,
                    borderLeft: `4px solid ${s.color}`,
                    background: selectedSubjectId === s.id ? "var(--bg-soft)" : "transparent",
                    color: selectedSubjectId === s.id ? "var(--ink)" : "var(--ink-soft)"
                  }}
                >
                  <span style={{ marginRight: 6 }}>{s.icon}</span> {s.name}
                </button>
              ))}
            </div>
          </div>

          {activeSubject && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span className="eyebrow">Chapters</span>
                <button style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4 }} onClick={() => setShowAddChapter(true)}>+ Add</button>
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                {activeSubject.chapters?.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChapterId(c.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      textAlign: "left",
                      fontWeight: 700,
                      fontSize: 12,
                      background: selectedChapterId === c.id ? "var(--bg-soft)" : "transparent",
                      color: selectedChapterId === c.id ? "var(--ink)" : "var(--ink-mute)"
                    }}
                  >
                    Ch.{c.order}: {c.title}
                  </button>
                ))}
                {(!activeSubject.chapters || activeSubject.chapters.length === 0) && (
                  <div className="muted" style={{ padding: 8, textAlign: "center", fontSize: 11 }}>No chapters yet.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          {activeChapter ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px dashed var(--line)", paddingBottom: 12 }}>
                <div>
                  <div className="eyebrow">Subject: {activeSubject.name} · Chapter {activeChapter.order}</div>
                  <h2 style={{ margin: "2px 0 0" }}>{activeChapter.title}</h2>
                </div>
                <button className="btn" onClick={() => setShowAddLesson(true)}>+ Add Lesson</button>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {(activeChapter.lessons || []).map((le) => (
                  <div key={le.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "var(--bg-soft)", borderRadius: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{le.title}</div>
                      <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>
                        {le.slides?.length || 0} slides · {le.quiz?.length || 0} quiz items · {le.mins} mins
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-mute)" }}>Order {le.order}</span>
                  </div>
                ))}
                {(!activeChapter.lessons || activeChapter.lessons.length === 0) && (
                  <div className="muted" style={{ padding: 24, textAlign: "center", fontWeight: 700 }}>No lessons in this chapter. Create the first one!</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <span style={{ fontSize: 40 }}>📚</span>
              <h3 style={{ marginTop: 12, marginBottom: 4 }}>Select a subject and chapter</h3>
              <p className="soft" style={{ margin: 0, fontSize: 13 }}>Choose from the left navigation list to manage lessons.</p>
            </div>
          )}
        </div>

      </div>

      {showAddSubject && (
        <Modal title="Create New Subject" onClose={() => setShowAddSubject(false)} width={460}>
          <form onSubmit={handleAddSubject}>
            <Field label="Subject Unique ID (lowercase, e.g. history)" value={subjId} onChange={setSubjId} placeholder="e.g. history" />
            <Field label="Subject Name" value={subjName} onChange={setSubjName} placeholder="e.g. World History" />
            <Field label="Subject Color (Hex)" value={subjColor} onChange={setSubjColor} placeholder="#3B82F6" />
            <Field label="Subject Emoji Icon" value={subjIcon} onChange={setSubjIcon} placeholder="📚" />
            <Field label="Blurb / Description" value={subjBlurb} onChange={setSubjBlurb} placeholder="Short blurb..." />
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="btn ghost" onClick={() => setShowAddSubject(false)}>Cancel</button>
              <button type="submit" className="btn" disabled={!subjId || !subjName}>Create</button>
            </div>
          </form>
        </Modal>
      )}

      {showAddChapter && (
        <Modal title={`Add Chapter to ${activeSubject?.name}`} onClose={() => setShowAddChapter(false)} width={460}>
          <form onSubmit={handleAddChapter}>
            <Field label="Chapter Unique ID" value={chapId} onChange={setChapId} placeholder="e.g. h-wars" />
            <Field label="Chapter Title" value={chapTitle} onChange={setChapTitle} placeholder="e.g. World War I" />
            <Field label="Order (Integer)" value={chapOrder} onChange={(v) => setChapOrder(Number(v))} type="number" />
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="btn ghost" onClick={() => setShowAddChapter(false)}>Cancel</button>
              <button type="submit" className="btn" disabled={!chapId || !chapTitle}>Create</button>
            </div>
          </form>
        </Modal>
      )}

      {showAddLesson && (
        <Modal title={`Add Lesson to ${activeChapter?.title}`} onClose={() => setShowAddLesson(false)} width={580}>
          <form onSubmit={handleAddLesson} style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 6 }}>
            <Field label="Lesson Unique ID" value={lesId} onChange={setLesId} placeholder="e.g. h-wars-1" />
            <Field label="Lesson Title" value={lesTitle} onChange={setLesTitle} placeholder="e.g. Causes of the War" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Duration (mins)" value={lesMins} onChange={(v) => setLesMins(Number(v))} type="number" />
              <Field label="Order index" value={lesOrder} onChange={(v) => setLesOrder(Number(v))} type="number" />
            </div>

            <div style={{ marginTop: 14, borderTop: "1px dashed var(--line)", paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 13 }}>Instruction Slides ({slides.length})</span>
                <button type="button" style={{ fontSize: 11, padding: "2px 6px" }} onClick={() => setSlides([...slides, { kind: "content", body: "" }])}>+ Add Slide</button>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {slides.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "start", background: "var(--bg-soft)", padding: 10, borderRadius: 8 }}>
                    <select
                      value={s.kind}
                      onChange={(e) => {
                        const newSlides = [...slides];
                        newSlides[i].kind = e.target.value;
                        setSlides(newSlides);
                      }}
                      style={{ padding: 4, borderRadius: 6, fontSize: 11, fontWeight: 700 }}
                    >
                      <option value="intro">Introduction</option>
                      <option value="content">Content</option>
                      <option value="tip">Study Tip</option>
                      <option value="example">Example</option>
                      <option value="flashcard">Flashcard</option>
                    </select>
                    {s.kind === "flashcard" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                        <input
                          type="text"
                          value={s.front || ""}
                          onChange={(e) => {
                            const newSlides = [...slides];
                            newSlides[i].front = e.target.value;
                            setSlides(newSlides);
                          }}
                          placeholder="Front of Flashcard..."
                          style={{ padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid var(--line)", background: "var(--bg-card)" }}
                        />
                        <input
                          type="text"
                          value={s.back || ""}
                          onChange={(e) => {
                            const newSlides = [...slides];
                            newSlides[i].back = e.target.value;
                            setSlides(newSlides);
                          }}
                          placeholder="Back of Flashcard..."
                          style={{ padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid var(--line)", background: "var(--bg-card)" }}
                        />
                      </div>
                    ) : (
                      <textarea
                        value={s.body || s.content || ""}
                        onChange={(e) => {
                          const newSlides = [...slides];
                          newSlides[i].body = e.target.value;
                          setSlides(newSlides);
                        }}
                        rows={2}
                        placeholder="Slide narrative body text..."
                        style={{ flex: 1, padding: 8, fontSize: 12, borderRadius: 6, border: "1px solid var(--line)" }}
                      />
                    )}
                    <button type="button" style={{ color: "#EF4444", fontSize: 12 }} onClick={() => setSlides(slides.filter((_, idx) => idx !== i))}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18, borderTop: "1px dashed var(--line)", paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 13 }}>Quiz Questions ({quiz.length})</span>
                <button type="button" style={{ fontSize: 11, padding: "2px 6px" }} onClick={() => setQuiz([...quiz, { kind: "mcq", q: "", choices: ["", "", "", ""], answer: 0, hint: "" }])}>+ Add Question</button>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {quiz.map((q, i) => (
                  <div key={i} style={{ background: "var(--bg-soft)", padding: 12, borderRadius: 8, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <select
                        value={q.kind}
                        onChange={(e) => {
                          const newQuiz = [...quiz];
                          newQuiz[i].kind = e.target.value;
                          setQuiz(newQuiz);
                        }}
                        style={{ padding: 4, borderRadius: 6, fontSize: 11, fontWeight: 700 }}
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="tf">True / False</option>
                        <option value="fill">Fill in the Blank</option>
                      </select>
                      <button type="button" style={{ color: "#EF4444", fontSize: 12 }} onClick={() => setQuiz(quiz.filter((_, idx) => idx !== i))}>Remove</button>
                    </div>

                    <input
                      type="text"
                      value={q.q}
                      onChange={(e) => {
                        const newQuiz = [...quiz];
                        newQuiz[i].q = e.target.value;
                        setQuiz(newQuiz);
                      }}
                      placeholder="Question Text?"
                      style={{ width: "100%", padding: 6, fontSize: 12, marginBottom: 6, borderRadius: 6, border: "1px solid var(--line)" }}
                    />

                    {q.kind === "mcq" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                        {q.choices.map((c, cIdx) => (
                          <input
                            key={cIdx}
                            type="text"
                            value={c}
                            onChange={(e) => {
                              const newQuiz = [...quiz];
                              newQuiz[i].choices[cIdx] = e.target.value;
                              setQuiz(newQuiz);
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + cIdx)}`}
                            style={{ padding: 4, fontSize: 11, borderRadius: 6, border: "1px solid var(--line)" }}
                          />
                        ))}
                      </div>
                    )}

                    {q.kind === "mcq" && (
                      <div style={{ fontSize: 11, marginBottom: 6 }}>
                        <span>Correct choice: </span>
                        <input
                          type="number"
                          value={q.answer}
                          onChange={(e) => {
                            const newQuiz = [...quiz];
                            newQuiz[i].answer = Number(e.target.value);
                            setQuiz(newQuiz);
                          }}
                          min={0}
                          max={3}
                          style={{ width: 50, padding: 2, borderRadius: 4 }}
                        />
                      </div>
                    )}

                    {q.kind === "tf" && (
                      <div style={{ fontSize: 11, marginBottom: 6 }}>
                        <span>Answer: </span>
                        <select
                          value={q.answer ? "true" : "false"}
                          onChange={(e) => {
                            const newQuiz = [...quiz];
                            newQuiz[i].answer = e.target.value === "true";
                            setQuiz(newQuiz);
                          }}
                          style={{ padding: 2, borderRadius: 4 }}
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      </div>
                    )}

                    {q.kind === "fill" && (
                      <input
                        type="text"
                        value={q.answer}
                        onChange={(e) => {
                          const newQuiz = [...quiz];
                          newQuiz[i].answer = e.target.value;
                          setQuiz(newQuiz);
                        }}
                        placeholder="Expected text answer..."
                        style={{ width: "100%", padding: 6, fontSize: 12, marginBottom: 6, borderRadius: 6, border: "1px solid var(--line)" }}
                      />
                    )}

                    <input
                      type="text"
                      value={q.hint || ""}
                      onChange={(e) => {
                        const newQuiz = [...quiz];
                        newQuiz[i].hint = e.target.value;
                        setQuiz(newQuiz);
                      }}
                      placeholder="Hint (optional)..."
                      style={{ width: "100%", padding: 4, fontSize: 11, borderRadius: 4, border: "1px solid var(--line)" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="btn ghost" onClick={() => setShowAddLesson(false)}>Cancel</button>
              <button type="submit" className="btn" disabled={!lesId || !lesTitle}>Create Lesson</button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}

Object.assign(window, { TeacherApp });
