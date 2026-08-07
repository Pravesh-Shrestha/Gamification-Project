import { Engine } from "./engine";

const KEY = "academia.io::db::v2";
const LOG_KEY = "academia.io::eventlog::v2";
const AUTH_KEY = "academia.io::auth::v2";

const AVATARS = ["hat", "panda", "fox", "cat", "dog", "owl", "penguin", "bunny", "bear", "frog", "monkey", "unicorn"];

function uid(prefix) { return prefix + "_" + Math.random().toString(36).slice(2, 9); }
function now() { return Date.now(); }

function seed() {
  const db = {
    users: [],
    schools: [],
    classes: [],
    assignments: [],
    lootbox: {},
    quests: {},
    streakFreeze: {},
    feed: [],
    announcements: [],
    notifications: {},
  };

  const su = { id: "u_superadmin", role: "super_admin", name: "Dr. R. Sharma", email: "ceo@academia.io", avatar: "hat", createdAt: now() };
  db.users.push(su);

  const schools = [
    { id: "sch_galaxy", name: "Galaxy Academy", city: "Lalitpur", color: "#3B82F6", motto: "Reach for the stars" },
    { id: "sch_himalaya", name: "Himalaya Public School", city: "Kathmandu", color: "#10B981", motto: "Rise & learn" },
    // Mirror of the schools added to the backend by seed-extended.mts
    { id: "sch_sunrise", name: "Sunrise Academy", city: "Pokhara", color: "#F59E0B", motto: "Rise with the sun" },
    { id: "sch_wisdom", name: "Wisdom International", city: "Biratnagar", color: "#8B5CF6", motto: "Knowledge is power" },
    { id: "sch_valley", name: "Valley View School", city: "Lalitpur", color: "#EF4444", motto: "Learn, grow, lead" },
    { id: "sch_everest", name: "Everest Model School", city: "Kathmandu", color: "#06B6D4", motto: "Peak of excellence" },
    { id: "sch_indra", name: "Indra Memorial School", city: "Butwal", color: "#10B981", motto: "Education for all" },
  ];

  const seedAdmins = [
    { id: "u_admin_galaxy", role: "admin", name: "Anita Pradhan", email: "anita@galaxy.edu", schoolId: "sch_galaxy", avatar: "owl" },
    { id: "u_admin_himalaya", role: "admin", name: "Suman KC", email: "suman@himalaya.edu", schoolId: "sch_himalaya", avatar: "fox" },
    { id: "u_admin_sunrise", role: "admin", name: "Pratap Gurung", email: "admin@sunrise.edu", schoolId: "sch_sunrise", avatar: "owl" },
    { id: "u_admin_wisdom", role: "admin", name: "Kamala Thapa", email: "admin@wisdom.edu", schoolId: "sch_wisdom", avatar: "fox" },
    { id: "u_admin_valley", role: "admin", name: "Rajendra Basnet", email: "admin@valley.edu", schoolId: "sch_valley", avatar: "bear" },
    { id: "u_admin_everest", role: "admin", name: "Meena Magar", email: "admin@everest.edu", schoolId: "sch_everest", avatar: "penguin" },
    { id: "u_admin_indra", role: "admin", name: "Suresh Dahal", email: "admin@indra.edu", schoolId: "sch_indra", avatar: "hat" },
  ];

  const seedTeachers = [
    { id: "u_t_galaxy_1", role: "teacher", name: "Prakash Joshi", email: "prakash@galaxy.edu", schoolId: "sch_galaxy", avatar: "bear", subjects: ["math"] },
    { id: "u_t_galaxy_2", role: "teacher", name: "Maya Tamang", email: "maya@galaxy.edu", schoolId: "sch_galaxy", avatar: "cat", subjects: ["sci"] },
    { id: "u_t_galaxy_3", role: "teacher", name: "Rajesh Thapa", email: "rajesh@galaxy.edu", schoolId: "sch_galaxy", avatar: "penguin", subjects: ["eng", "math"] },
    { id: "u_t_galaxy_4", role: "teacher", name: "Sunita Rai", email: "sunita@galaxy.edu", schoolId: "sch_galaxy", avatar: "owl", subjects: ["sci", "eng"] },
    { id: "u_t_himalaya_1", role: "teacher", name: "Bibek Rai", email: "bibek@himalaya.edu", schoolId: "sch_himalaya", avatar: "frog", subjects: ["eng", "sci"] },
    { id: "u_t_himalaya_2", role: "teacher", name: "Anju Sharma", email: "anju@himalaya.edu", schoolId: "sch_himalaya", avatar: "bunny", subjects: ["math"] },
    { id: "u_t_himalaya_3", role: "teacher", name: "Kiran Adhikari", email: "kiran@himalaya.edu", schoolId: "sch_himalaya", avatar: "monkey", subjects: ["sci"] },
    // Teachers for the new schools
    { id: "u_t_sunrise_1", role: "teacher", name: "Bibek Poudel", email: "bibek.sir@sunrise.edu", schoolId: "sch_sunrise", avatar: "panda", subjects: ["math"] },
    { id: "u_t_sunrise_2", role: "teacher", name: "Sarita Mishra", email: "sarita.m@sunrise.edu", schoolId: "sch_sunrise", avatar: "cat", subjects: ["sci"] },
    { id: "u_t_sunrise_3", role: "teacher", name: "Ram Kumar KC", email: "ram.k@sunrise.edu", schoolId: "sch_sunrise", avatar: "dog", subjects: ["eng"] },
    { id: "u_t_wisdom_1", role: "teacher", name: "Anjali Tamang", email: "anjali.t@wisdom.edu", schoolId: "sch_wisdom", avatar: "bunny", subjects: ["math"] },
    { id: "u_t_wisdom_2", role: "teacher", name: "Santosh Mahat", email: "santosh.m@wisdom.edu", schoolId: "sch_wisdom", avatar: "monkey", subjects: ["sci"] },
    { id: "u_t_valley_1", role: "teacher", name: "Krishna Dahal", email: "krishna.d@valley.edu", schoolId: "sch_valley", avatar: "frog", subjects: ["math"] },
    { id: "u_t_valley_2", role: "teacher", name: "Sunita Oli", email: "sunita.o@valley.edu", schoolId: "sch_valley", avatar: "unicorn", subjects: ["sci"] },
    { id: "u_t_valley_3", role: "teacher", name: "Himal Rana", email: "himal.r@valley.edu", schoolId: "sch_valley", avatar: "owl", subjects: ["eng"] },
    { id: "u_t_everest_1", role: "teacher", name: "Deepak Ghimire", email: "deepak.g@everest.edu", schoolId: "sch_everest", avatar: "bear", subjects: ["math"] },
    { id: "u_t_everest_2", role: "teacher", name: "Namrata Parajuli", email: "namrata.p@everest.edu", schoolId: "sch_everest", avatar: "fox", subjects: ["sci"] },
    { id: "u_t_indra_1", role: "teacher", name: "Gopal Sharma", email: "gopal.s@indra.edu", schoolId: "sch_indra", avatar: "hat", subjects: ["math"] },
    { id: "u_t_indra_2", role: "teacher", name: "Roshani Chhetri", email: "roshani.c@indra.edu", schoolId: "sch_indra", avatar: "penguin", subjects: ["sci"] },
  ];

  const seedStudents = [
    { id: "u_s_g1", name: "Aarav Shrestha", schoolId: "sch_galaxy", grade: "Grade 1", avatar: "panda", xp: 120, streak: 2, perfectQuizzes: 1, lessonsCompleted: ["m-frac-1", "e-gram-1"] },
    { id: "u_s_g2", name: "Sita Karki", schoolId: "sch_galaxy", grade: "Grade 1", avatar: "unicorn", xp: 180, streak: 4, perfectQuizzes: 2, lessonsCompleted: ["m-frac-1", "m-frac-2", "e-gram-1"] },
    { id: "u_s_g3", name: "Rahul Adhikari", schoolId: "sch_galaxy", grade: "Grade 2", avatar: "monkey", xp: 220, streak: 2, perfectQuizzes: 1, lessonsCompleted: ["m-frac-1", "e-gram-1"] },
    { id: "u_s_g4", name: "Priya Tamang", schoolId: "sch_galaxy", grade: "Grade 2", avatar: "bunny", xp: 340, streak: 5, perfectQuizzes: 3, lessonsCompleted: ["m-frac-1", "m-frac-2", "e-gram-1", "e-vocab-1"] },
    { id: "u_s_g5", name: "Bishnu Lama", schoolId: "sch_galaxy", grade: "Grade 3", avatar: "penguin", xp: 320, streak: 3, perfectQuizzes: 2, lessonsCompleted: ["m-frac-1", "m-frac-2", "e-gram-1"] },
    { id: "u_s_g6", name: "Gita Poudel", schoolId: "sch_galaxy", grade: "Grade 3", avatar: "fox", xp: 460, streak: 6, perfectQuizzes: 4, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "e-gram-1", "e-vocab-1"] },
    { id: "u_s_g7", name: "Hari Bhattarai", schoolId: "sch_galaxy", grade: "Grade 4", avatar: "bear", xp: 510, streak: 7, perfectQuizzes: 5, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "s-plants-1", "e-gram-1"] },
    { id: "u_s_g8", name: "Indira Gurung", schoolId: "sch_galaxy", grade: "Grade 4", avatar: "cat", xp: 670, streak: 8, perfectQuizzes: 6, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "s-plants-1", "s-plants-2", "e-gram-1", "e-gram-2"] },
    { id: "u_s_g9", name: "Janak Maharjan", schoolId: "sch_galaxy", grade: "Grade 5", avatar: "dog", xp: 800, streak: 10, perfectQuizzes: 7, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "s-plants-1", "s-plants-2", "e-gram-1", "e-vocab-1"] },
    { id: "u_s_g10", name: "Kavi Shrestha", schoolId: "sch_galaxy", grade: "Grade 5", avatar: "owl", xp: 420, streak: 4, perfectQuizzes: 3, lessonsCompleted: ["m-frac-1", "m-frac-2", "s-plants-1", "e-gram-1"] },
    { id: "u_s_g11", name: "Laxmi Thapa", schoolId: "sch_galaxy", grade: "Grade 6", avatar: "frog", xp: 950, streak: 12, perfectQuizzes: 8, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "m-alg-1", "s-plants-1", "s-plants-2", "s-forces-1", "e-gram-1", "e-gram-2"] },
    { id: "u_s_g12", name: "Manish KC", schoolId: "sch_galaxy", grade: "Grade 6", avatar: "monkey", xp: 600, streak: 6, perfectQuizzes: 5, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "s-plants-1", "e-gram-1"] },
    { id: "u_s_g13", name: "Nisha Rai", schoolId: "sch_galaxy", grade: "Grade 7", avatar: "panda", xp: 1100, streak: 14, perfectQuizzes: 9, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "m-alg-1", "m-alg-2", "s-plants-1", "s-plants-2", "s-forces-1", "e-gram-1", "e-gram-2"] },
    { id: "u_s_g14", name: "Om Pradhan", schoolId: "sch_galaxy", grade: "Grade 7", avatar: "fox", xp: 760, streak: 8, perfectQuizzes: 6, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "m-alg-1", "s-plants-1", "s-plants-2", "e-gram-1"] },
    { id: "u_s_g15", name: "Pooja Sharma", schoolId: "sch_galaxy", grade: "Grade 8", avatar: "unicorn", xp: 1350, streak: 18, perfectQuizzes: 11, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "m-alg-1", "m-alg-2", "m-geo-1", "s-plants-1", "s-plants-2", "s-forces-1", "s-forces-2", "e-gram-1", "e-gram-2"] },
    { id: "u_s_g16", name: "Rabi Acharya", schoolId: "sch_galaxy", grade: "Grade 8", avatar: "bear", xp: 900, streak: 9, perfectQuizzes: 7, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "m-alg-1", "s-plants-1", "s-plants-2", "s-forces-1", "e-gram-1", "e-gram-2"] },
    { id: "u_s_h1", name: "Nisha Magar", schoolId: "sch_himalaya", grade: "Grade 1", avatar: "fox", xp: 100, streak: 1, perfectQuizzes: 0, lessonsCompleted: ["m-frac-1"] },
    { id: "u_s_h2", name: "Dipesh Khadka", schoolId: "sch_himalaya", grade: "Grade 1", avatar: "dog", xp: 160, streak: 3, perfectQuizzes: 1, lessonsCompleted: ["m-frac-1", "e-gram-1"] },
    { id: "u_s_h3", name: "Sneha Gurung", schoolId: "sch_himalaya", grade: "Grade 2", avatar: "cat", xp: 280, streak: 4, perfectQuizzes: 2, lessonsCompleted: ["m-frac-1", "m-frac-2", "e-gram-1"] },
    { id: "u_s_h4", name: "Tika Shrestha", schoolId: "sch_himalaya", grade: "Grade 2", avatar: "penguin", xp: 390, streak: 5, perfectQuizzes: 3, lessonsCompleted: ["m-frac-1", "m-frac-2", "e-gram-1", "e-vocab-1"] },
    { id: "u_s_h5", name: "Uma KC", schoolId: "sch_himalaya", grade: "Grade 3", avatar: "monkey", xp: 450, streak: 6, perfectQuizzes: 4, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "e-gram-1"] },
    { id: "u_s_h6", name: "Bikram Lama", schoolId: "sch_himalaya", grade: "Grade 3", avatar: "bear", xp: 310, streak: 3, perfectQuizzes: 2, lessonsCompleted: ["m-frac-1", "m-frac-2", "e-gram-1"] },
    { id: "u_s_h7", name: "Chandra Thapa", schoolId: "sch_himalaya", grade: "Grade 4", avatar: "owl", xp: 570, streak: 7, perfectQuizzes: 5, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "s-plants-1", "e-gram-1"] },
    { id: "u_s_h8", name: "Durga Rai", schoolId: "sch_himalaya", grade: "Grade 4", avatar: "frog", xp: 430, streak: 5, perfectQuizzes: 3, lessonsCompleted: ["m-frac-1", "m-frac-2", "s-plants-1", "e-gram-1"] },
    { id: "u_s_h9", name: "Esha Pradhan", schoolId: "sch_himalaya", grade: "Grade 5", avatar: "bunny", xp: 680, streak: 8, perfectQuizzes: 6, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "s-plants-1", "s-plants-2", "e-gram-1", "e-vocab-1"] },
    { id: "u_s_h10", name: "Firoj Ansari", schoolId: "sch_himalaya", grade: "Grade 5", avatar: "fox", xp: 520, streak: 6, perfectQuizzes: 4, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "s-plants-1", "e-gram-1"] },
    { id: "u_s_h11", name: "Gopal Acharya", schoolId: "sch_himalaya", grade: "Grade 6", avatar: "panda", xp: 820, streak: 10, perfectQuizzes: 7, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "m-alg-1", "s-plants-1", "s-plants-2", "e-gram-1", "e-gram-2"] },
    { id: "u_s_h12", name: "Hima Shrestha", schoolId: "sch_himalaya", grade: "Grade 6", avatar: "unicorn", xp: 640, streak: 7, perfectQuizzes: 5, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "s-plants-1", "e-gram-1", "e-vocab-1"] },
    { id: "u_s_h13", name: "Ishwor Tamang", schoolId: "sch_himalaya", grade: "Grade 7", avatar: "cat", xp: 1050, streak: 13, perfectQuizzes: 8, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "m-alg-1", "m-alg-2", "s-plants-1", "s-plants-2", "s-forces-1", "e-gram-1", "e-gram-2"] },
    { id: "u_s_h14", name: "Jaya Gurung", schoolId: "sch_himalaya", grade: "Grade 7", avatar: "dog", xp: 730, streak: 8, perfectQuizzes: 6, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "m-alg-1", "s-plants-1", "s-plants-2", "e-gram-1"] },
    { id: "u_s_h15", name: "Krishna Thapa", schoolId: "sch_himalaya", grade: "Grade 8", avatar: "penguin", xp: 1280, streak: 16, perfectQuizzes: 10, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "m-alg-1", "m-alg-2", "m-geo-1", "s-plants-1", "s-plants-2", "s-forces-1", "e-gram-1", "e-gram-2"] },
    { id: "u_s_h16", name: "Lalita Maharjan", schoolId: "sch_himalaya", grade: "Grade 8", avatar: "bear", xp: 870, streak: 9, perfectQuizzes: 7, lessonsCompleted: ["m-frac-1", "m-frac-2", "m-frac-3", "m-alg-1", "s-plants-1", "s-plants-2", "s-forces-1", "e-gram-1", "e-gram-2"] },
  ];

  for (const admin of seedAdmins) db.users.push({ ...admin, role: "admin", createdBy: su.id, createdAt: now() });
  for (const teacher of seedTeachers) db.users.push({ ...teacher, role: "teacher", createdBy: "u_admin_" + teacher.schoolId.slice(4), createdAt: now() });

  function spreadHistory(xpTotal, days = 10) {
    const out = {};
    let left = xpTotal;
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const portion = i === 0 ? Math.round(left * 0.18) : Math.round(left / (days - i) * (0.6 + Math.random() * 0.8));
      out[key] = Math.max(0, portion);
      left = Math.max(0, left - portion);
    }
    return out;
  }

  for (const student of seedStudents) {
    const schoolPrefix = student.schoolId === "sch_galaxy" ? "u_admin_galaxy" : "u_admin_himalaya";
    const profile = {
      id: student.id,
      role: "student",
      name: student.name,
      avatar: student.avatar,
      email: student.name.toLowerCase().split(" ")[0] + "@" + (student.schoolId === "sch_galaxy" ? "galaxy.edu" : "himalaya.edu"),
      schoolId: student.schoolId,
      grade: student.grade,
      createdBy: schoolPrefix,
      createdAt: now(),
      xp: student.xp,
      streak: student.streak,
      streakDays: [],
      lastActiveDay: Engine ? Engine.todayKey() : null,
      lessonsCompleted: student.lessonsCompleted,
      perfectQuizzes: student.perfectQuizzes,
      focusMinutes: Math.floor(student.xp / 12),
      treesGrown: Math.floor(student.xp / 80),
      badges: [],
      todayXP: spreadHistory(student.xp),
      dailyGoal: 50,
      cosmetics: [],
      combos: 0,
    };
    if (Engine) Engine.checkBadges(profile, { studied: false });
    db.users.push(profile);
  }

  for (const school of schools) db.schools.push({ ...school, createdBy: su.id, createdAt: now() });

  db.classes.push(
    { id: "cls_g1a", schoolId: "sch_galaxy", name: "Grade 1A", grade: "Grade 1", teacherId: "u_t_galaxy_3", studentIds: ["u_s_g1", "u_s_g2"] },
    { id: "cls_g2a", schoolId: "sch_galaxy", name: "Grade 2A", grade: "Grade 2", teacherId: "u_t_galaxy_3", studentIds: ["u_s_g3", "u_s_g4"] },
    { id: "cls_g3a", schoolId: "sch_galaxy", name: "Grade 3A", grade: "Grade 3", teacherId: "u_t_galaxy_4", studentIds: ["u_s_g5", "u_s_g6"] },
    { id: "cls_g4a", schoolId: "sch_galaxy", name: "Grade 4A", grade: "Grade 4", teacherId: "u_t_galaxy_4", studentIds: ["u_s_g7", "u_s_g8"] },
    { id: "cls_g5a", schoolId: "sch_galaxy", name: "Grade 5A", grade: "Grade 5", teacherId: "u_t_galaxy_1", studentIds: ["u_s_g9", "u_s_g10"] },
    { id: "cls_g6a", schoolId: "sch_galaxy", name: "Grade 6A", grade: "Grade 6", teacherId: "u_t_galaxy_2", studentIds: ["u_s_g11", "u_s_g12"] },
    { id: "cls_g7a", schoolId: "sch_galaxy", name: "Grade 7A", grade: "Grade 7", teacherId: "u_t_galaxy_1", studentIds: ["u_s_g13", "u_s_g14"] },
    { id: "cls_g8a", schoolId: "sch_galaxy", name: "Grade 8A", grade: "Grade 8", teacherId: "u_t_galaxy_2", studentIds: ["u_s_g15", "u_s_g16"] },
    { id: "cls_h1a", schoolId: "sch_himalaya", name: "Grade 1A", grade: "Grade 1", teacherId: "u_t_himalaya_2", studentIds: ["u_s_h1", "u_s_h2"] },
    { id: "cls_h2a", schoolId: "sch_himalaya", name: "Grade 2A", grade: "Grade 2", teacherId: "u_t_himalaya_2", studentIds: ["u_s_h3", "u_s_h4"] },
    { id: "cls_h3a", schoolId: "sch_himalaya", name: "Grade 3A", grade: "Grade 3", teacherId: "u_t_himalaya_3", studentIds: ["u_s_h5", "u_s_h6"] },
    { id: "cls_h4a", schoolId: "sch_himalaya", name: "Grade 4A", grade: "Grade 4", teacherId: "u_t_himalaya_3", studentIds: ["u_s_h7", "u_s_h8"] },
    { id: "cls_h5a", schoolId: "sch_himalaya", name: "Grade 5A", grade: "Grade 5", teacherId: "u_t_himalaya_1", studentIds: ["u_s_h9", "u_s_h10"] },
    { id: "cls_h6a", schoolId: "sch_himalaya", name: "Grade 6A", grade: "Grade 6", teacherId: "u_t_himalaya_1", studentIds: ["u_s_h11", "u_s_h12"] },
    { id: "cls_h7a", schoolId: "sch_himalaya", name: "Grade 7A", grade: "Grade 7", teacherId: "u_t_himalaya_2", studentIds: ["u_s_h13", "u_s_h14"] },
    { id: "cls_h8a", schoolId: "sch_himalaya", name: "Grade 8A", grade: "Grade 8", teacherId: "u_t_himalaya_3", studentIds: ["u_s_h15", "u_s_h16"] },
  );

  // ── Generate classes + students for the extra schools (leaderboards) ──
  const EXTRA_FIRST = ["Aarav","Sita","Rahul","Priya","Bishnu","Anjana","Kiran","Roshan","Mina","Nisha","Dipesh","Sneha","Mohan","Sabina","Krishna","Arjun","Puja","Ramesh","Saraswati","Ganesh","Laxmi","Hari","Savitri","Ram","Janaki","Bhim","Kunti","Yubaraj","Sharmila","Pradip","Gita","Sanjay","Rupa","Sunil","Manju","Bibek","Alisha","Sandip","Kriti","Rajesh"];
  const EXTRA_LAST = ["Shrestha","Karki","Adhikari","Tamang","Lama","Rai","Thapa","Magar","Khadka","Gurung","Maharjan","Joshi","Bhattarai","Gautam","Pandey","Dahal","Bhandari","Basnet","Acharya","Giri"];
  let extraIdx = 0;
  for (const school of schools) {
    const prefix = school.id.replace("sch_", "");
    if (prefix === "galaxy" || prefix === "himalaya") continue; // already seeded above
    const schoolTeachers = seedTeachers.filter((t: any) => t.schoolId === school.id);
    for (let g = 1; g <= 8; g++) {
      const gradeLabel = `Grade ${g}`;
      const teacher = schoolTeachers[(g - 1) % Math.max(1, schoolTeachers.length)];
      const studentIds: string[] = [];
      for (let k = 1; k <= 6; k++) {
        extraIdx++;
        const sid = `u_s_${prefix}_${extraIdx}`;
        const first = EXTRA_FIRST[(extraIdx * 13) % EXTRA_FIRST.length];
        const last = EXTRA_LAST[(extraIdx * 7) % EXTRA_LAST.length];
        const name = `${first} ${last}`;
        const xp = 120 + ((extraIdx * 137) % 900);
        const streak = (extraIdx * 7) % 16;
        studentIds.push(sid);
        db.users.push({
          id: sid, role: "student", name, avatar: AVATARS[(extraIdx * 5) % AVATARS.length],
          email: `${first.toLowerCase()}.${sid}@${prefix}.edu`, schoolId: school.id, grade: gradeLabel,
          createdBy: `u_admin_${prefix}`, createdAt: now(),
          xp, streak, streakDays: [], lastActiveDay: Engine ? Engine.todayKey() : null,
          lessonsCompleted: [], perfectQuizzes: (extraIdx * 3) % 8, focusMinutes: Math.floor(xp / 12),
          treesGrown: Math.floor(xp / 80), badges: [], todayXP: spreadHistory(xp), dailyGoal: 50,
          cosmetics: [], combos: 0,
        });
      }
      db.classes.push({
        id: `cls_${prefix}${g}a`, schoolId: school.id, name: `Grade ${g}A`, grade: gradeLabel,
        teacherId: teacher ? teacher.id : null, studentIds,
      });
    }
  }

  // ── Boost the original Galaxy & Himalaya classes with more students ──
  // (each class had only 2 students; add 4 more so leaderboards look alive)
  let boostIdx = 0;
  for (const school of schools) {
    const prefix = school.id.replace("sch_", "");
    if (prefix !== "galaxy" && prefix !== "himalaya") continue;
    const schoolTeachers = seedTeachers.filter((t: any) => t.schoolId === school.id);
    for (let g = 1; g <= 8; g++) {
      const gradeLabel = `Grade ${g}`;
      const cls = db.classes.find((c: any) => c.schoolId === school.id && c.grade === gradeLabel);
      if (!cls) continue;
      const teacher = schoolTeachers[(g - 1) % Math.max(1, schoolTeachers.length)];
      for (let k = 1; k <= 4; k++) {
        boostIdx++;
        const sid = `u_s_${prefix}${g}_b${k}`;
        const first = EXTRA_FIRST[(boostIdx * 13 + g * 7) % EXTRA_FIRST.length];
        const last = EXTRA_LAST[(boostIdx * 7 + g * 3) % EXTRA_LAST.length];
        const name = `${first} ${last}`;
        const xp = 90 + ((boostIdx * 137 + g * 50) % 850);
        const streak = (boostIdx * 11 + g) % 18;
        cls.studentIds.push(sid);
        db.users.push({
          id: sid, role: "student", name, avatar: AVATARS[(boostIdx * 7) % AVATARS.length],
          email: `${first.toLowerCase()}.${sid}@${prefix}.edu`, schoolId: school.id, grade: gradeLabel,
          createdBy: `u_admin_${prefix}`, createdAt: now(),
          xp, streak, streakDays: [], lastActiveDay: Engine ? Engine.todayKey() : null,
          lessonsCompleted: [], perfectQuizzes: (boostIdx * 3) % 8, focusMinutes: Math.floor(xp / 12),
          treesGrown: Math.floor(xp / 80), badges: [], todayXP: spreadHistory(xp), dailyGoal: 50,
          cosmetics: [], combos: 0,
        });
      }
    }
  }

  const today = new Date();
  const due = new Date(); due.setDate(today.getDate() + 3);
  const dueLater = new Date(); dueLater.setDate(today.getDate() + 7);
  db.assignments.push(
    { id: uid("asg"), classId: "cls_g5a", lessonId: "m-frac-3", assignedBy: "u_t_galaxy_1", assignedAt: now(), dueAt: due.getTime(), note: "Quick check before quiz Friday." },
    { id: uid("asg"), classId: "cls_g6a", lessonId: "s-plants-2", assignedBy: "u_t_galaxy_2", assignedAt: now(), dueAt: dueLater.getTime(), note: "" },
    { id: uid("asg"), classId: "cls_g7a", lessonId: "m-alg-1", assignedBy: "u_t_galaxy_1", assignedAt: now(), dueAt: due.getTime(), note: "" },
    { id: uid("asg"), classId: "cls_h5a", lessonId: "e-vocab-1", assignedBy: "u_t_himalaya_1", assignedAt: now(), dueAt: dueLater.getTime(), note: "Pair up with your reading buddy." },
    { id: uid("asg"), classId: "cls_h6a", lessonId: "s-plants-2", assignedBy: "u_t_himalaya_1", assignedAt: now(), dueAt: due.getTime(), note: "Lab report due next class." },
  );

  db.feed.push(
    { t: now() - 1000 * 60 * 30, userId: "u_s_g1", kind: "badge", payload: { badge: "perfectionist" } },
    { t: now() - 1000 * 60 * 90, userId: "u_s_g13", kind: "level", payload: { level: 8 } },
    { t: now() - 1000 * 60 * 60 * 4, userId: "u_s_h9", kind: "streak", payload: { days: 11 } },
  );

  db.announcements.push(
    { id: uid("ann"), classId: "cls_g5a", authorId: "u_t_galaxy_1", text: "Fractions test on Friday - please finish all 3 fractions lessons before then.", t: now() - 1000 * 60 * 60 * 20 },
    { id: uid("ann"), classId: "cls_g7a", authorId: "u_t_galaxy_1", text: "Welcome to Algebra Basics! Try the first lesson tonight, even just 5 minutes.", t: now() - 1000 * 60 * 60 * 30 },
    { id: uid("ann"), classId: "cls_h5a", authorId: "u_t_himalaya_1", text: "Reading buddy pairs are posted. Be kind, help each other!", t: now() - 1000 * 60 * 60 * 8 },
    { id: uid("ann"), classId: "cls_h6a", authorId: "u_t_himalaya_1", text: "Science quiz next week - review plant and animal cells!", t: now() - 1000 * 60 * 60 * 10 },
  );

  function notif(userId, kind, title, body, time) {
    db.notifications[userId] = db.notifications[userId] || [];
    db.notifications[userId].push({ id: uid("n"), kind, title, body, t: time || now(), read: false });
  }
  notif("u_s_g1", "assignment", "New assignment", "Mr. Joshi posted “Comparing fractions”. Due in 3 days.", now() - 1000 * 60 * 60 * 2);
  notif("u_s_g1", "announcement", "Class message", "Fractions test on Friday - please finish all 3 fractions lessons before then.", now() - 1000 * 60 * 60 * 20);
  notif("u_s_g2", "badge", "Badge unlocked", "You earned “Perfectionist”! 3 perfect quizzes in a row.", now() - 1000 * 60 * 30);
  notif("u_s_g13", "level", "Level up!", "You reached Level 8. Keep going!", now() - 1000 * 60 * 90);
  notif("u_s_h9", "streak", "11-day streak", "You're on fire. Don't break the chain!", now() - 1000 * 60 * 60 * 4);

  return db;
}

const DB_VERSION = 5; // bump to force reseed when schema changes

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === DB_VERSION) return parsed;
    }
  } catch (error) {}
  const fresh: any = seed();
  fresh.version = DB_VERSION;
  save(fresh);
  return fresh;
}

function save(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (error) {}
}

function reseed() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(LOG_KEY);
  localStorage.removeItem(AUTH_KEY);
  return load();
}

function loadAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch (error) { return null; }
}

function saveAuth(userId) {
  if (userId) localStorage.setItem(AUTH_KEY, JSON.stringify({ userId, t: now() }));
  else localStorage.removeItem(AUTH_KEY);
}

function loadLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); } catch (error) { return []; }
}

function appendLog(entries) {
  const log = loadLog();
  const t = now();
  for (const entry of entries) log.push({ t, m: entry });
  while (log.length > 200) log.shift();
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

function clearLog() { localStorage.removeItem(LOG_KEY); }

function userById(db, id) { return db.users.find((user) => user.id === id); }
function usersByRole(db, role) { return db.users.filter((user) => user.role === role); }
function usersBySchool(db, schoolId, role) { return db.users.filter((user) => user.schoolId === schoolId && (!role || user.role === role)); }
function schoolById(db, id) { return db.schools.find((school) => school.id === id); }
function classesBySchool(db, schoolId) { return db.classes.filter((cls) => cls.schoolId === schoolId); }
function classesByTeacher(db, teacherId) { return db.classes.filter((cls) => cls.teacherId === teacherId); }
function classesByStudent(db, studentId) { return db.classes.filter((cls) => cls.studentIds.includes(studentId)); }
function assignmentsForStudent(db, studentId) { return db.assignments.filter((assignment) => classesByStudent(db, studentId).map((cls) => cls.id).includes(assignment.classId)); }
function assignmentsByTeacher(db, teacherId) { return db.assignments.filter((assignment) => classesByTeacher(db, teacherId).map((cls) => cls.id).includes(assignment.classId)); }

function updateUser(db, userId, patch) {
  const user = userById(db, userId);
  if (!user) return null;
  Object.assign(user, patch);
  save(db);
  return user;
}

function createUser(db, data) {
  const user = { id: uid("u"), createdAt: now(), avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)], ...data };
  if (user.role === "student") {
    // Fill defaults ONLY for fields the caller didn't provide - never wipe real
    // gamification values (xp/streak/questsState/…) passed in `data`.
    const defaults = {
      xp: 0, streak: 0, streakDays: [], lessonsCompleted: [], perfectQuizzes: 0,
      focusMinutes: 0, treesGrown: 0, badges: [], todayXP: {}, dailyGoal: 50,
      cosmetics: [], combos: 0,
    };
    for (const k of Object.keys(defaults)) {
      if (user[k] == null) user[k] = defaults[k];
    }
  }
  db.users.push(user);
  save(db);
  return user;
}

function deleteUser(db, userId) {
  db.users = db.users.filter((user) => user.id !== userId);
  for (const cls of db.classes) cls.studentIds = cls.studentIds.filter((id) => id !== userId);
  save(db);
}

function createSchool(db, data, creatorId) {
  const id = uid("sch");
  db.schools.push({ id, createdAt: now(), createdBy: creatorId, color: "#3B82F6", ...data });
  save(db);
  return id;
}

function deleteSchool(db, schoolId) {
  db.schools = db.schools.filter((school) => school.id !== schoolId);
  db.users = db.users.filter((user) => user.schoolId !== schoolId);
  db.classes = db.classes.filter((cls) => cls.schoolId !== schoolId);
  save(db);
}

function createClass(db, data) {
  const id = uid("cls");
  db.classes.push({ id, studentIds: [], ...data });
  save(db);
  return id;
}

function deleteClass(db, classId) {
  db.classes = db.classes.filter((cls) => cls.id !== classId);
  db.assignments = db.assignments.filter((assignment) => assignment.classId !== classId);
  save(db);
}

function createAssignment(db, data) {
  const assignment = { id: uid("asg"), assignedAt: now(), note: "", ...data };
  db.assignments.push(assignment);
  save(db);
  return assignment.id;
}

function deleteAssignment(db, assignmentId) {
  db.assignments = db.assignments.filter((assignment) => assignment.id !== assignmentId);
  save(db);
}

function pushFeed(db, evt) {
  db.feed.unshift({ t: now(), ...evt });
  db.feed = db.feed.slice(0, 200);
  save(db);
}

function notificationsFor(db, userId) { return db.notifications[userId] || []; }
function notify(db, userId, entry) {
  db.notifications[userId] = db.notifications[userId] || [];
  db.notifications[userId].unshift({ id: uid("n"), t: now(), read: false, ...entry });
  save(db);
}

function markAllRead(db, userId) {
  db.notifications[userId] = (db.notifications[userId] || []).map((item) => ({ ...item, read: true }));
  save(db);
}

function clearNotifications(db, userId) {
  db.notifications[userId] = [];
  save(db);
}

const DB = {
  load,
  save,
  reseed,
  loadAuth,
  saveAuth,
  loadLog,
  appendLog,
  clearLog,
  userById,
  usersByRole,
  usersBySchool,
  schoolById,
  classesBySchool,
  classesByTeacher,
  classesByStudent,
  assignmentsForStudent,
  assignmentsByTeacher,
  updateUser,
  createUser,
  deleteUser,
  createSchool,
  deleteSchool,
  createClass,
  deleteClass,
  createAssignment,
  deleteAssignment,
  pushFeed,
  notificationsFor,
  notify,
  markAllRead,
  clearNotifications,
};

export {
  DB,
  AVATARS,
  load,
  save,
  reseed,
  loadAuth,
  saveAuth,
  loadLog,
  appendLog,
  clearLog,
  userById,
  usersByRole,
  usersBySchool,
  schoolById,
  classesBySchool,
  classesByTeacher,
  classesByStudent,
  assignmentsForStudent,
  assignmentsByTeacher,
  updateUser,
  createUser,
  deleteUser,
  createSchool,
  deleteSchool,
  createClass,
  deleteClass,
  createAssignment,
  deleteAssignment,
  pushFeed,
  notificationsFor,
  notify,
  markAllRead,
  clearNotifications,
};

if (typeof window !== "undefined") {
  window.DB = DB;
}
