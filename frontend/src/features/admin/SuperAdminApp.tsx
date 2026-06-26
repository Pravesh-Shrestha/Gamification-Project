import React from "react";
import adminApi from "../../services/admin";
import { auth as authApi } from "../../services/api";
import ResearchAnalytics from "./ResearchAnalytics";

// System-wide root administration and tenant onboarding console.

function SuperAdminApp({ user, onLogout }) {
  const [tab, setTab] = React.useState("overview");
  const [schools, setSchools] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [showCreateSchool, setShowCreateSchool] = React.useState(false);
  const [showCreateUser, setShowCreateUser] = React.useState(false);
  const [editSchool, setEditSchool] = React.useState(null);
  const [editUser, setEditUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [schoolList, userList] = await Promise.all([
        authApi.schools(),
        adminApi.listUsers(),
      ]);
      setSchools(schoolList);
      setUsers(userList);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { loadData(); }, []);

  const students = users.filter(u => u.role === "student");
  const teachers = users.filter(u => u.role === "teacher");
  const admins = users.filter(u => u.role === "admin");
  const totalXp = students.reduce((a, s) => a + (s.xp || 0), 0);

  if (loading) {
    return (
      <RoleShell user={user} onLogout={onLogout} roleLabel="Super Admin" tint="#1F1B16">
        <div style={{ padding: 40, textAlign: "center" }} className="muted">Loading platform data...</div>
      </RoleShell>
    );
  }

  return (
    <RoleShell user={user} onLogout={onLogout} roleLabel="Super Admin" tint="#1F1B16">
      <RoleTabs current={tab} onChange={setTab} tabs={[
          { id: "overview", label: "Overview" },
          { id: "schools", label: "Schools", badge: schools.length },
          { id: "users", label: "All users", badge: users.length },
          { id: "research", label: "Research Analytics" },
          { id: "logs", label: "System logs", group: "AUDIT" },
        ]} />
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {tab === "schools" && (
            <button className="btn ghost" onClick={() => setShowCreateSchool(true)} style={{ fontSize: 13 }}>
              + New school
            </button>
          )}
          {(tab === "users" || tab === "schools") && (
            <button className="btn" onClick={() => setShowCreateUser(true)} style={{ fontSize: 13 }}>+ Create user</button>
          )}
        </div>

      {tab === "overview" && (
        <OverviewTab schools={schools} users={users} students={students} teachers={teachers} admins={admins} totalXp={totalXp} />
      )}

      {tab === "schools" && (
        <SchoolsTab schools={schools} users={users} onEdit={(s) => setEditSchool(s)} onRefresh={loadData} />
      )}

      {tab === "users" && (
        <UsersTab users={users} schools={schools} onRefresh={loadData} onEdit={(u) => setEditUser(u)} />
      )}

      {tab === "research" && (
        <ResearchAnalytics />
      )}

      {tab === "logs" && (
        <SystemLogsTab users={users} />
      )}

      {showCreateUser && (
        <CreateUserModal
          role="super_admin"
          schools={schools}
          onClose={() => setShowCreateUser(false)}
          onCreated={() => { setShowCreateUser(false); loadData(); }}
        />
      )}

      {showCreateSchool && (
        <CreateSchoolModal
          onClose={() => setShowCreateSchool(false)}
          onCreated={() => { setShowCreateSchool(false); loadData(); }}
        />
      )}

      {editSchool && (
        <EditSchoolModal
          school={editSchool}
          onClose={() => setEditSchool(null)}
          onUpdated={() => { setEditSchool(null); loadData(); }}
        />
      )}

      {editUser && (
        <EditUserModal
          user={editUser}
          schools={schools}
          onClose={() => setEditUser(null)}
          onUpdated={() => { setEditUser(null); loadData(); }}
        />
      )}
    </RoleShell>
  );
}

// ── Overview Tab ──────────────────────────────────────────
function OverviewTab({ schools, users, students, teachers, admins, totalXp }) {
  const totalLessons = students.reduce((a, s) => a + (s._count?.lessonsCompleted || 0), 0);
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <CockpitBanner
        eyebrow="PLATFORM COCKPIT"
        greeting="Welcome back, Administrator."
        sub={<>You are monitoring <strong>{schools.length} schools</strong> and <strong>{users.length} active platform accounts</strong>.</>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <BigStat label="Schools" value={schools.length} color="#3B82F6" sub="active" />
        <BigStat label="Admins" value={admins.length} color="#EC4899" sub="school owners" />
        <BigStat label="Teachers" value={teachers.length} color="#10B981" sub="across schools" />
        <BigStat label="Students" value={students.length} color="#F59E0B" sub={`Σ ${totalXp.toLocaleString()} XP`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <div className="card">
          <SectionHeader title="Schools by activity" eyebrow="Performance" />
          <div style={{ display: "grid", gap: 10 }}>
            {schools.map((s) => {
              const sStudents = users.filter(u => u.role === "student" && u.schoolId === s.id);
              const sXp = sStudents.reduce((a, x) => a + (x.xp || 0), 0);
              const max = Math.max(...schools.map((sc) => users.filter(u => u.role === "student" && u.schoolId === sc.id).reduce((a, x) => a + (x.xp || 0), 0)), 1);
              return (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "200px 1fr 100px", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{s.name}</div>
                    <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{s.city} · {sStudents.length} students</div>
                  </div>
                  <div style={{ height: 10, background: "var(--bg-soft)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(sXp / max) * 100}%`, background: s.color, transition: "width 0.5s" }} />
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "var(--font-display)", fontWeight: 700 }}>{sXp.toLocaleString()} XP</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <SectionHeader title="Platform totals" eyebrow="Insight" />
          <div style={{ display: "grid", gap: 12 }}>
            <RowStat label="Lessons completed" value={totalLessons.toLocaleString()} />
            <RowStat label="Avg XP per student" value={students.length ? Math.round(totalXp / students.length).toLocaleString() : 0} />
            <RowStat label="Active streaks (≥3)" value={students.filter((s) => (s.streak || 0) >= 3).length} />
            <RowStat label="Perfect quizzes" value={students.reduce((a, s) => a + (s.perfectQuizzes || 0), 0)} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Schools Tab ───────────────────────────────────────────
function SchoolsTab({ schools, users, onEdit, onRefresh }) {
  const [detailSchool, setDetailSchool] = React.useState(null);
  const [classes, setClasses] = React.useState([]);
  const [delSchool, setDelSchool] = React.useState(null);
  const avatarMap = { hat: "🎓", panda: "🐼", fox: "🦊", cat: "🐱", dog: "🐶", owl: "🦉", penguin: "🐧", bunny: "🐰", bear: "🐻", frog: "🐸", monkey: "🐵", unicorn: "🦄" };

  React.useEffect(() => {
    if (detailSchool) {
      adminApi.listClasses(detailSchool.id).then(setClasses).catch(() => {});
    }
  }, [detailSchool]);

  if (detailSchool) {
    const s = detailSchool;
    const sUsers = users.filter(u => u.schoolId === s.id);
    const sStudents = sUsers.filter(u => u.role === "student");
    const sTeachers = sUsers.filter(u => u.role === "teacher");
    const sAdmin = sUsers.find(u => u.role === "admin");

    async function handleDeleteSchool() {
      if (!confirm(`Delete "${s.name}" and ALL its users? This cannot be undone.`)) return;
      try { await adminApi.deleteSchool(s.id); onRefresh(); setDetailSchool(null); }
      catch (e) { alert(e.message); }
    }

    return (
      <div>
        <button onClick={() => setDetailSchool(null)} className="btn ghost" style={{ marginBottom: 14 }}>← Back to schools</button>
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "start", marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: s.color, color: "white", display: "grid", placeItems: "center", fontSize: 24, fontWeight: 800 }}>
                {s.name[0]}
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{s.name}</h2>
                <div className="muted" style={{ fontWeight: 700 }}>{s.city}</div>
                <div className="muted" style={{ fontSize: 13, fontStyle: "italic", marginTop: 4 }}>"{s.motto || "No motto"}"</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn ghost" onClick={() => onEdit(s)} style={{ fontSize: 13 }}>✏️ Edit</button>
              <button className="btn ghost" onClick={handleDeleteSchool} style={{ fontSize: 13, color: "#EF4444" }}>🗑 Delete</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <Pill label="Admin" value={sAdmin ? sAdmin.name : "—"} />
            <Pill label="Teachers" value={sTeachers.length} />
            <Pill label="Students" value={sStudents.length} />
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            {sStudents.length > 0 && <Pill label="Total XP" value={sStudents.reduce((a, u) => a + (u.xp || 0), 0).toLocaleString()} />}
            {sStudents.length > 0 && <Pill label="Avg XP" value={Math.round(sStudents.reduce((a, u) => a + (u.xp || 0), 0) / sStudents.length).toLocaleString()} />}
            {sStudents.length > 0 && <Pill label="Active streaks" value={sStudents.filter(u => (u.streak || 0) >= 3).length} />}
          </div>
        </div>

        {/* Classes section */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12 }}>Classes (Grade 1-8)</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {classes.map((c) => (
              <span key={c.id} style={{ padding: "6px 14px", borderRadius: 99, background: "var(--bg-soft)", fontWeight: 700, fontSize: 13 }}>
                {c.name}
                <span className="muted" style={{ fontSize: 11, marginLeft: 4 }}>Section {c.section}</span>
              </span>
            ))}
          </div>
        </div>

        <h3 style={{ marginBottom: 12 }}>All users in {s.name}</h3>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)", textAlign: "left", fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-mute)" }}>
                <th style={{ padding: "12px 18px" }}>User</th>
                <th>Role</th>
                <th>Grade</th>
                <th>Stats</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sUsers.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: "center" }} className="muted">No users in this school yet.</td></tr>
              )}
              {sUsers.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid var(--line)", fontSize: 13 }}>
                  <td style={{ padding: "12px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--bg-soft)", display: "grid", placeItems: "center", fontSize: 16 }}>
                        {avatarMap[u.avatar] || "🎓"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{u.name}</div>
                        <div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{u.email || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ background: "var(--bg-soft)", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800, textTransform: "capitalize" }}>{u.role.replace("_", " ")}</span></td>
                  <td className="muted" style={{ fontWeight: 700 }}>{u.grade || "—"}</td>
                  <td className="muted" style={{ fontWeight: 700, fontSize: 12 }}>
                    {u.role === "student" ? `${u.xp || 0} XP · 🔥 ${u.streak || 0}` : (u.role === "teacher" ? `${u.xp || 0} XP` : "—")}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <button onClick={() => onEdit(u)} className="muted" style={{ fontSize: 13, padding: "4px 8px" }}>✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div className="eyebrow">Schools</div>
        <h2>All registered schools</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        {schools.map((s) => {
          const sStudents = users.filter(u => u.role === "student" && u.schoolId === s.id);
          const sTeachers = users.filter(u => u.role === "teacher" && u.schoolId === s.id);
          const sAdmin = users.find(u => u.role === "admin" && u.schoolId === s.id);
          return (
            <button key={s.id} onClick={() => setDetailSchool(s)}
              style={{ textAlign: "left", cursor: "pointer", padding: 0, border: "none", background: "none", width: "100%" }}>
              <div className="card" style={{ padding: 20, width: "100%" }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: s.color, color: "white", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>
                    {s.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{s.name}</div>
                    <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>{s.city}</div>
                  </div>
                </div>
                <div className="muted" style={{ fontSize: 12, fontStyle: "italic", marginBottom: 14 }}>"{s.motto || "—"}"</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  <Pill label="Admin" value={sAdmin ? sAdmin.name : "—"} />
                  <Pill label="Teachers" value={sTeachers.length} />
                  <Pill label="Students" value={sStudents.length} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────
function UsersTab({ users, schools, onRefresh, onEdit }) {
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [schoolFilter, setSchoolFilter] = React.useState("all");
  const [q, setQ] = React.useState("");
  const avatarMap = { hat: "🎓", panda: "🐼", fox: "🦊", cat: "🐱", dog: "🐶", owl: "🦉", penguin: "🐧", bunny: "🐰", bear: "🐻", frog: "🐸", monkey: "🐵", unicorn: "🦄" };
  const schoolMap = Object.fromEntries(schools.map(s => [s.id, s.name]));

  const filtered = users.filter((u) =>
    (roleFilter === "all" || u.role === roleFilter) &&
    (schoolFilter === "all" || u.schoolId === schoolFilter) &&
    (q === "" || u.name.toLowerCase().includes(q.toLowerCase()) || (u.email || "").toLowerCase().includes(q.toLowerCase()))
  );

  async function handleDelete(userId, userName) {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    try { await adminApi.deleteUser(userId); onRefresh(); }
    catch (e) { alert(e.message); }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        {["all", "super_admin", "admin", "teacher", "student"].map((f) => (
          <button key={f} onClick={() => setRoleFilter(f)}
            style={{
              padding: "8px 14px", borderRadius: 99,
              background: roleFilter === f ? "var(--ink)" : "var(--bg-card)",
              color: roleFilter === f ? "var(--bg-card)" : "var(--ink)",
              border: "1.5px solid var(--line)", fontWeight: 800, fontSize: 12,
              textTransform: "capitalize",
            }}
          >{f.replace("_", " ")}</button>
        ))}
        <select value={schoolFilter} onChange={e => setSchoolFilter(e.target.value)}
          style={{
            marginLeft: 8, padding: "8px 14px", borderRadius: 99, fontWeight: 700, fontSize: 12,
            border: "1.5px solid var(--line)", background: "var(--bg-card)", appearance: "auto",
          }}>
          <option value="all">All schools</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input placeholder="Search by name or email…" value={q} onChange={e => setQ(e.target.value)}
          style={{ marginLeft: "auto", padding: "8px 14px", borderRadius: 99, border: "1.5px solid var(--line)", background: "var(--bg-card)", fontWeight: 700, fontSize: 13, outline: "none", width: 240 }} />
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-soft)", textAlign: "left", fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-mute)" }}>
              <th style={{ padding: "12px 18px" }}>User</th>
              <th>Role</th>
              <th>School</th>
              <th>Stats</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: "center" }} className="muted">No users match these filters.</td></tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid var(--line)", fontSize: 13 }}>
                <td style={{ padding: "12px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--bg-soft)", display: "grid", placeItems: "center", fontSize: 16 }}>
                      {avatarMap[u.avatar] || "🎓"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{u.email || "—"}</div>
                    </div>
                  </div>
                </td>
                <td><span style={{ background: "var(--bg-soft)", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800, textTransform: "capitalize" }}>{u.role.replace("_", " ")}</span></td>
                <td className="muted" style={{ fontWeight: 700 }}>{schoolMap[u.schoolId] || "—"}</td>
                <td className="muted" style={{ fontWeight: 700, fontSize: 12 }}>
                  {u.role === "student" ? `${u.xp || 0} XP · 🔥 ${u.streak || 0}` : (u.role === "teacher" ? `${u.xp || 0} XP` : "—")}
                </td>
                <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                  <button onClick={() => onEdit(u)} className="muted" style={{ fontSize: 13, padding: "4px 6px" }} title="Edit">✏️</button>
                  {u.role !== "super_admin" && (
                    <button onClick={() => handleDelete(u.id, u.name)} className="muted" style={{ fontSize: 13, padding: "4px 6px", color: "#EF4444" }} title="Delete">🗑</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Create User Modal ─────────────────────────────────────
function CreateUserModal({ role, schools, onClose, onCreated }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [newRole, setNewRole] = React.useState("admin");
  const [schoolId, setSchoolId] = React.useState("");
  const [grade, setGrade] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Super admin can create admins (for any school)
  // Admin can create teachers/students
  const roleOptions = role === "super_admin" ? [{ id: "admin", label: "School Admin" }] : [{ id: "teacher", label: "Teacher" }, { id: "student", label: "Student" }];

  async function handleCreate(e) {
    e.preventDefault();
    if (!name || !email || !schoolId) { setError("Name, email, and school are required"); return; }
    setError("");
    setSaving(true);
    try {
      const result = await adminApi.createUser({ name, email, role: newRole, schoolId, grade: grade || undefined });
      setSaving(false);
      onCreated();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 999, padding: 20 }}>
      <div className="card" style={{ maxWidth: 480, width: "100%", padding: 28, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Create user account</h2>
          <button onClick={onClose} style={{ fontSize: 20, color: "var(--muted)" }}>✕</button>
        </div>

        <form onSubmit={handleCreate}>
          <Field label="Full name" value={name} onChange={setName} placeholder="e.g. Anita Pradhan" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="anita@school.edu" type="email" />

          <div style={{ marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Role</div>
            <div style={{ display: "flex", gap: 8 }}>
              {roleOptions.map(r => (
                <button key={r.id} type="button" onClick={() => setNewRole(r.id)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer",
                    border: newRole === r.id ? "2px solid var(--ink)" : "1.5px solid var(--line)",
                    background: newRole === r.id ? "var(--bg-card)" : "transparent",
                    fontWeight: 700, fontSize: 13,
                  }}
                >{r.label}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="eyebrow" style={{ display: "block", marginBottom: 6 }}>School</label>
            <select value={schoolId} onChange={e => setSchoolId(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid var(--line)", background: "var(--bg-card)", fontWeight: 600, fontSize: 14, appearance: "auto" }}>
              <option value="">— Select school —</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
            </select>
          </div>

          {newRole === "student" && (
            <Field label="Grade" value={grade} onChange={setGrade} placeholder="e.g. Grade 6" />
          )}

          <div className="muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: "var(--bg-soft)" }}>
            Default password: <b>password123</b>. User can change after first login.
          </div>

          {error && <div style={{ color: "#EF4444", fontSize: 13, fontWeight: 700, marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)" }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Creating..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Create School Modal ────────────────────────────────────
function CreateSchoolModal({ onClose, onCreated }) {
  const [name, setName] = React.useState("");
  const [city, setCity] = React.useState("");
  const [motto, setMotto] = React.useState("");
  const [color, setColor] = React.useState("#3B82F6");
  const [adminName, setAdminName] = React.useState("");
  const [adminEmail, setAdminEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name || !city || !adminName || !adminEmail) {
      setError("School name, city, admin name, and admin email are required");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await adminApi.createSchool({ name, city, motto, color, adminName, adminEmail });
      setSaving(false);
      onCreated();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 999, padding: 20 }}>
      <div className="card" style={{ maxWidth: 480, width: "100%", padding: 28, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Create new school</h2>
          <button onClick={onClose} style={{ fontSize: 20, color: "var(--muted)" }}>✕</button>
        </div>

        <form onSubmit={handleCreate}>
          <Field label="School name" value={name} onChange={setName} placeholder="e.g. Galaxy Academy" />
          <Field label="City" value={city} onChange={setCity} placeholder="e.g. Lalitpur" />
          <Field label="Motto (optional)" value={motto} onChange={setMotto} placeholder="Reach for the stars" />

          <div style={{ marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Theme color</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#A855F7", "#EC4899"].map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  style={{ width: 28, height: 28, borderRadius: 99, background: c, border: color === c ? "3px solid var(--ink)" : "3px solid transparent", cursor: "pointer" }} />
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginBottom: 14 }}>
            <div className="muted" style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              School admin account
            </div>
            <Field label="Admin name" value={adminName} onChange={setAdminName} placeholder="e.g. Anita Pradhan" />
            <Field label="Admin email" value={adminEmail} onChange={setAdminEmail} placeholder="anita@school.edu" type="email" />
          </div>

          <div className="muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: "var(--bg-soft)" }}>
            An admin account will be created with default password: <b>password123</b>.
          </div>

          {error && <ErrorBox msg={error} />}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Creating..." : "Create school"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit School Modal ─────────────────────────────────────
function EditSchoolModal({ school, onClose, onUpdated }) {
  const [name, setName] = React.useState(school.name);
  const [city, setCity] = React.useState(school.city);
  const [motto, setMotto] = React.useState(school.motto || "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSave(e) {
    e.preventDefault();
    if (!name || !city) { setError("Name and city are required"); return; }
    setSaving(true); setError("");
    try {
      await adminApi.updateSchool(school.id, { name, city, motto: motto || undefined });
      onUpdated();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 999, padding: 20 }}>
      <div className="card" style={{ maxWidth: 440, width: "100%", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Edit school</h2>
          <button onClick={onClose} style={{ fontSize: 20, color: "var(--muted)" }}>✕</button>
        </div>
        <form onSubmit={handleSave}>
          <Field label="School name" value={name} onChange={setName} />
          <Field label="City" value={city} onChange={setCity} />
          <Field label="Motto" value={motto} onChange={setMotto} />
          {error && <ErrorBox msg={error} />}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit User Modal ───────────────────────────────────────
function EditUserModal({ user, schools, onClose, onUpdated }) {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [grade, setGrade] = React.useState(user.grade || "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSave(e) {
    e.preventDefault();
    if (!name || !email) { setError("Name and email are required"); return; }
    setSaving(true); setError("");
    try {
      await adminApi.updateUser(user.id, { name, email, grade: grade || undefined });
      onUpdated();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 999, padding: 20 }}>
      <div className="card" style={{ maxWidth: 440, width: "100%", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Edit user — {user.name}</h2>
          <button onClick={onClose} style={{ fontSize: 20, color: "var(--muted)" }}>✕</button>
        </div>
        <form onSubmit={handleSave}>
          <Field label="Full name" value={name} onChange={setName} />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="Grade" value={grade} onChange={setGrade} placeholder="e.g. Grade 6" />
          {error && <ErrorBox msg={error} />}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Shared Sub-components ─────────────────────────────────
function ErrorBox({ msg }) {
  return (
    <div style={{ color: "#EF4444", fontSize: 13, fontWeight: 700, marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)" }}>
      {msg}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: any; value: any; onChange: any; placeholder?: string; type?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="eyebrow" style={{ display: "block", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid var(--line)", background: "var(--bg-card)", color: "var(--ink)", fontSize: 14, fontWeight: 600, boxSizing: "border-box" }} />
    </div>
  );
}

function SystemLogsTab({ users }) {
  const mockTimes = [
    "Jun 18 at 11:25 AM",
    "Jun 18 at 11:25 AM",
    "Jun 18 at 11:25 AM",
    "Jun 18 at 11:25 AM",
    "Jun 18 at 11:25 AM",
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
      <div className="card" style={{ padding: 24 }}>
        <SectionHeader title="Recent system activity" eyebrow="Audit log" action={<span className="muted" style={{ fontSize: 12 }}>Full audit trail →</span>} />
        <div style={{ display: "grid", gap: 20, position: "relative", paddingLeft: 20, borderLeft: "2px solid var(--line)", marginLeft: 8 }}>
          {users.slice(0, 5).map((u, i) => (
            <div key={u.id} style={{ position: "relative" }}>
              {/* Timeline circle dot */}
              <div style={{
                position: "absolute", left: -26, top: 4, width: 10, height: 10,
                borderRadius: "50%", background: "var(--accent)", border: "2.5px solid var(--bg-card)"
              }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>New user registered ({u.name})</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                    <span style={{ background: "var(--bg-soft)", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--accent)" }}>{u.role.replace("_", " ")}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{mockTimes[i] || "Just now"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="card" style={{ padding: 24 }}>
          <SectionHeader title="System Status" eyebrow="Realtime" />
          <div style={{ display: "grid", gap: 14 }}>
            <StatusBlock name="Database Instance" details="PostgreSQL 16 · latency: 14ms" status="ONLINE" />
            <StatusBlock name="Gateway API Service" details="Axum (Rust) · ping: 50ms" status="ONLINE" />
            <StatusBlock name="AI Orchestrator" details="Gemini Flash · Agent Core active" status="READY" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBlock({ name, details, status }) {
  const isOnline = status === "ONLINE" || status === "READY";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "var(--bg-soft)", borderRadius: "var(--radius-sm)" }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13, color: "var(--ink)" }}>{name}</div>
        <div className="muted" style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>{details}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: isOnline ? "#10B981" : "#EF4444",
          boxShadow: isOnline ? "0 0 8px #10B981" : "none"
        }} />
        <span style={{ fontSize: 10, fontWeight: 800, color: isOnline ? "#10B981" : "#EF4444" }}>{status}</span>
      </div>
    </div>
  );
}

window.SuperAdminApp = SuperAdminApp;
