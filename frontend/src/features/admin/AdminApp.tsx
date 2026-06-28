import React from "react";

// academia.io — School Admin dashboard

function AdminApp({ user, onLogout }) {
  const [db, setDb] = React.useState(() => window.DB.load());
  const [tab, setTab] = React.useState("overview");
  const [creating, setCreating] = React.useState(null); // 'teacher' | 'student' | null

  function refresh() { setDb({ ...window.DB.load() }); }

  const school = window.DB.schoolById(db, user.schoolId);
  const teachers = window.DB.usersBySchool(db, user.schoolId, "teacher");
  const students = window.DB.usersBySchool(db, user.schoolId, "student");
  const classes = window.DB.classesBySchool(db, user.schoolId);
  const totalXp = students.reduce((a, s) => a + (s.xp || 0), 0);
  const activeToday = students.filter((s) => {
    const tk = window.Engine.todayKey();
    return ((s.todayXP || {})[tk] || 0) > 0;
  }).length;

  return (
    <RoleShell user={user} onLogout={onLogout} roleLabel="Admin" tint={school?.color || "#3B82F6"}>
      <RoleTabs current={tab} onChange={setTab} tabs={[
        { id: "overview", label: "Overview" },
        { id: "teachers", label: "Teachers", badge: teachers.length },
        { id: "students", label: "Students", badge: students.length },
        { id: "classes", label: "Classes", badge: classes.length, group: "OPERATIONS" },
      ]} />

      {tab === "overview" && (
        <div style={{ display: "grid", gap: 18 }}>
          <CockpitBanner
            eyebrow="ADMIN COCKPIT"
            greeting={`Good morning, ${user.name.split(" ")[0]}.`}
            sub={<>You are managing <strong>{teachers.length} teachers</strong> and <strong>{students.length} active students</strong>.</>}
          />

          <div className="stats-grid">
            <BigStat label="Teachers" value={teachers.length} color={school?.color || "var(--accent)"} />
            <BigStat label="Students" value={students.length} color="#F59E0B" />
            <BigStat label="Classes" value={classes.length} color="#EC4899" />
            <BigStat label="Active today" value={activeToday} sub={`of ${students.length}`} color="#10B981" />
          </div>

          <div className="dashboard-grid-2col">
            <div className="card">
              <SectionHeader title="Top performers" eyebrow="This week" />
              <Leaderboard students={students.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 5)} />
            </div>
            <div className="card">
              <SectionHeader title="Class roster" eyebrow="Classes" />
              <div style={{ display: "grid", gap: 10 }}>
                {classes.map((c) => {
                  const t = window.DB.userById(db, c.teacherId);
                  return (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-soft)", borderRadius: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{c.name}</div>
                        <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{c.grade} · {c.studentIds.length} students</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{t ? t.name : "—"}</div>
                        <div className="muted" style={{ fontSize: 10, fontWeight: 700 }}>teacher</div>
                      </div>
                    </div>
                  );
                })}
                {classes.length === 0 && <div className="muted" style={{ textAlign: "center", padding: 18 }}>No classes yet.</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "teachers" && (
        <UserTable
          title="Teachers"
          users={teachers}
          db={db}
          onCreate={() => setCreating("teacher")}
          onChange={refresh}
          createLabel="+ Add teacher"
        />
      )}

      {tab === "students" && (
        <UserTable
          title="Students"
          users={students}
          db={db}
          onCreate={() => setCreating("student")}
          onChange={refresh}
          createLabel="+ Add student"
          showStats
        />
      )}

      {tab === "classes" && (
        <ClassesTab user={user} db={db} onChange={refresh} school={school} />
      )}

      {creating && (
        <CreateUserModal
          role={creating}
          schoolId={user.schoolId}
          creatorId={user.id}
          onClose={() => setCreating(null)}
          onCreate={() => { refresh(); setCreating(null); }}
        />
      )}
    </RoleShell>
  );
}

function UserTable({ title, users, db, onCreate, onChange, createLabel, showStats = false }: { title: any; users: any[]; db: any; onCreate: () => void; onChange: () => void; createLabel: string; showStats?: boolean }) {
  const avatarMap = { hat: "🎓", panda: "🐼", fox: "🦊", cat: "🐱", dog: "🐶", owl: "🦉", penguin: "🐧", bunny: "🐰", bear: "🐻", frog: "🐸", monkey: "🐵", unicorn: "🦄" };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2>{title}</h2>
        <button className="btn" onClick={onCreate}>{createLabel}</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-soft)", textAlign: "left", fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-mute)" }}>
              <th style={{ padding: "12px 18px" }}>Name</th>
              <th>Email</th>
              {showStats && <th>Grade</th>}
              {showStats && <th>XP</th>}
              {showStats && <th>Streak</th>}
              {showStats && <th>Lessons</th>}
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid var(--line)", fontSize: 13 }}>
                <td style={{ padding: "12px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--bg-soft)", display: "grid", placeItems: "center", fontSize: 16 }}>{avatarMap[u.avatar] || "🎓"}</div>
                    <div style={{ fontWeight: 700 }}>{u.name}</div>
                  </div>
                </td>
                <td className="muted" style={{ fontWeight: 600 }}>{u.email}</td>
                {showStats && <td className="muted" style={{ fontWeight: 700 }}>{u.grade || "—"}</td>}
                {showStats && <td style={{ fontWeight: 800 }}>{(u.xp || 0).toLocaleString()}</td>}
                {showStats && <td style={{ fontWeight: 800, color: "#F59E0B" }}>🔥 {u.streak || 0}</td>}
                {showStats && <td className="muted" style={{ fontWeight: 700 }}>{(u.lessonsCompleted || []).length}</td>}
                <td style={{ textAlign: "right", paddingRight: 14 }}>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${u.name}?`)) {
                        window.DB.deleteUser(window.DB.load(), u.id);
                        onChange();
                      }
                    }}
                    style={{ color: "#EF4444", padding: "4px 10px", borderRadius: 8, fontWeight: 800, fontSize: 11 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={7} className="muted" style={{ padding: 20, textAlign: "center", fontWeight: 700 }}>None yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClassesTab({ user, db, onChange, school }) {
  const [creating, setCreating] = React.useState(false);
  const classes = window.DB.classesBySchool(db, user.schoolId);
  const teachers = window.DB.usersBySchool(db, user.schoolId, "teacher");
  const students = window.DB.usersBySchool(db, user.schoolId, "student");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2>Classes</h2>
        <button className="btn" onClick={() => setCreating(true)}>+ New class</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {classes.map((c) => {
          const teacher = window.DB.userById(db, c.teacherId);
          const cStudents = c.studentIds.map((id) => window.DB.userById(db, id)).filter(Boolean);
          const totalXp = cStudents.reduce((a, s) => a + (s.xp || 0), 0);
          return (
            <div key={c.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{c.name}</div>
                  <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>{c.grade}</div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${c.name}?`)) {
                      window.DB.deleteClass(window.DB.load(), c.id);
                      onChange();
                    }
                  }}
                  style={{ color: "#EF4444", padding: "4px 10px", borderRadius: 8, fontWeight: 800, fontSize: 11 }}
                >
                  Delete
                </button>
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
                <Pill label="Teacher" value={teacher ? teacher.name : "—"} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <Pill label="Students" value={cStudents.length} />
                  <Pill label="Class XP" value={totalXp.toLocaleString()} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {creating && (
        <CreateClassModal
          schoolId={user.schoolId}
          teachers={teachers}
          students={students}
          onClose={() => setCreating(false)}
          onCreate={(data) => {
            window.DB.createClass(window.DB.load(), { ...data, schoolId: user.schoolId });
            onChange();
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function CreateUserModal({ role, schoolId, creatorId, onClose, onCreate }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [grade, setGrade] = React.useState("Grade 6");
  const [subjects, setSubjects] = React.useState(["math"]);

  function toggleSubj(s) {
    setSubjects((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  }

  function submit() {
    const db = window.DB.load();
    const data: any = { role, name, email, schoolId, createdBy: creatorId };
    if (role === "student") data.grade = grade;
    if (role === "teacher") data.subjects = subjects;
    window.DB.createUser(db, data);
    onCreate();
  }

  return (
    <Modal title={`Add ${role}`} onClose={onClose}>
      <Field label="Full name" value={name} onChange={setName} placeholder="Aarav Shrestha" />
      <Field label="Email" value={email} onChange={setEmail} placeholder="aarav@school.edu" type="email" />
      {role === "student" && (
        <Select
          label="Grade"
          value={grade}
          onChange={setGrade}
          options={["Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map((g) => ({ value: g, label: g }))}
        />
      )}
      {role === "teacher" && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "var(--ink-soft)" }}>Subjects they teach</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ id: "math", n: "Math" }, { id: "sci", n: "Science" }, { id: "eng", n: "English" }].map((s) => (
              <button
                key={s.id}
                onClick={() => toggleSubj(s.id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: subjects.includes(s.id) ? "2px solid var(--ink)" : "1.5px solid var(--line)",
                  background: subjects.includes(s.id) ? "var(--ink)" : "var(--bg-card)",
                  color: subjects.includes(s.id) ? "var(--bg-card)" : "var(--ink)",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {s.n}
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={!name || !email} onClick={submit}>Create</button>
      </div>
    </Modal>
  );
}

function CreateClassModal({ schoolId, teachers, students, onClose, onCreate }) {
  const [name, setName] = React.useState("");
  const [grade, setGrade] = React.useState("Grade 6");
  const [teacherId, setTeacherId] = React.useState(teachers[0]?.id || "");
  const [selectedStudents, setSelectedStudents] = React.useState([]);

  function toggleS(id) {
    setSelectedStudents((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }

  return (
    <Modal title="Create class" onClose={onClose} width={560}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Class name" value={name} onChange={setName} placeholder="Class 6A" />
        <Select label="Grade" value={grade} onChange={setGrade} options={["Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map((g) => ({ value: g, label: g }))} />
      </div>
      <Select label="Class teacher" value={teacherId} onChange={setTeacherId} options={teachers.map((t) => ({ value: t.id, label: t.name }))} />
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "var(--ink-soft)" }}>Students</div>
      <div style={{ maxHeight: 200, overflowY: "auto", background: "var(--bg-soft)", borderRadius: 10, padding: 8 }}>
        {students.filter((s) => s.grade === grade).map((s) => (
          <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderRadius: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => toggleS(s.id)} />
            <span style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</span>
            <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{s.grade}</span>
          </label>
        ))}
        {students.filter((s) => s.grade === grade).length === 0 && (
          <div className="muted" style={{ padding: 12, fontSize: 12, fontWeight: 700 }}>No students yet for this grade.</div>
        )}
      </div>
      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={!name || !teacherId} onClick={() => onCreate({ name, grade, teacherId, studentIds: selectedStudents })}>Create class</button>
      </div>
    </Modal>
  );
}

function Leaderboard({ students, highlightId = undefined }: { students: any[]; highlightId?: string }) {
  const avatarMap = { hat: "🎓", panda: "🐼", fox: "🦊", cat: "🐱", dog: "🐶", owl: "🦉", penguin: "🐧", bunny: "🐰", bear: "🐻", frog: "🐸", monkey: "🐵", unicorn: "🦄" };
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {students.map((s, i) => {
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
        const isMe = highlightId === s.id;
        return (
          <div
            key={s.id}
            style={{
              display: "grid",
              gridTemplateColumns: "30px 32px 1fr auto auto",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 10,
              background: isMe ? "linear-gradient(135deg, #FEF3C7, #FDE68A)" : "var(--bg-soft)",
              border: isMe ? "2px solid #F59E0B" : "1px solid transparent",
              color: isMe ? "#78350F" : "inherit",
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: isMe ? "#B45309" : "var(--ink-mute)", fontSize: 14 }}>
              {medal || `#${i + 1}`}
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--bg-card)", display: "grid", placeItems: "center", fontSize: 16, color: "var(--ink)" }}>{avatarMap[s.avatar] || "🎓"}</div>
            <div style={{ fontWeight: 800, fontSize: 13 }}>{s.name} {isMe && <span style={{ fontSize: 10, fontWeight: 800, background: "#F59E0B", color: "white", padding: "1px 8px", borderRadius: 99, marginLeft: 4 }}>YOU</span>}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: isMe ? "#B45309" : "#F59E0B" }}>🔥 {s.streak || 0}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{(s.xp || 0).toLocaleString()} XP</div>
          </div>
        );
      })}
      {students.length === 0 && <div className="muted" style={{ padding: 20, textAlign: "center", fontWeight: 700 }}>Nothing here yet.</div>}
    </div>
  );
}

Object.assign(window, { AdminApp, UserTable, ClassesTab, CreateUserModal, CreateClassModal, Leaderboard });
