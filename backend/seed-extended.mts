/**
 * ============================================================
 * academia.io - Extended Multi-School Seed (Additive)
 * Adds 3 new schools, admins, teachers, and ~300 students
 * with realistic natural engagement distributions.
 * Does NOT wipe existing data.
 * ============================================================
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

// ── Helpers ──────────────────────────────────────────────────
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min: number, max: number) { return Math.random() * (max - min) + min; }
function daysBefore(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// ── Name pools ────────────────────────────────────────────────
const FIRST = [
  "Aarav","Sita","Rahul","Priya","Bishnu","Anjana","Kiran","Roshan","Mina","Nisha",
  "Dipesh","Sneha","Mohan","Sabina","Krishna","Arjun","Puja","Ramesh","Saraswati",
  "Ganesh","Laxmi","Hari","Savitri","Ram","Janaki","Bhim","Kunti","Yubaraj","Sharmila",
  "Pradip","Gita","Sanjay","Rupa","Sunil","Manju","Bibek","Alisha","Sandip","Kriti",
  "Rajesh","Kalpana","Dinesh","Sujata","Prakash","Maya","Suman","Niranjan","Kabita",
  "Pramod","Sarita","Anil","Reema","Sujan","Sunita","Bimal","Kamala","Deepak","Anita",
  "Bikram","Sushmita","Nabin","Smita","Sachin","Rekha","Manish","Binita","Arun","Namrata",
  "Hemanta","Shruti","Suresh","Jyoti","Milan","Sabita","Rohan","Prabha","Santosh","Nirmala",
  "Ujjwal","Srijana","Lokesh","Kumari","Shyam","Menuka","Biplav","Sushma","Rajan","Kopila",
  "Gopal","Rasmita","Tilak","Samjhana","Himal","Chandrika","Saroj","Amrita","Bipin","Roshani",
];
const LAST = [
  "Shrestha","Karki","Adhikari","Tamang","Lama","Rai","Thapa","BK","GC","Pun",
  "Magar","Khadka","Gurung","Pariyar","Maharjan","KC","Joshi","Bhattarai","Gautam",
  "Pandey","Dahal","Bhandari","Basnet","Acharya","Baral","Chhetri","Giri","Koirala",
  "Neupane","Oli","Panta","Regmi","Rimal","Sapkota","Subedi","Wagle","Upreti",
  "Devkota","Ghimire","Budhathoki","Chapagain","Dhakal","Hamal","Lamichhane","Luitel",
  "Mahat","Niroula","Pokharel","Sharma","Timilsina","Yogi","Adhikari","Bista","Dhungana",
];
const AVATARS = ["hat","panda","fox","cat","dog","owl","penguin","bunny","bear","frog","monkey","unicorn"];
const GRADES_NUM = [4,5,6,7,8,9,10];

// ── Badge criteria (mirrors engagement.service) ───────────────
const BADGE_CRITERIA = [
  { id: "first_steps",   pass: (u:any) => u.lessons >= 1 },
  { id: "streak_3",      pass: (u:any) => u.streak >= 3 },
  { id: "five_streak",   pass: (u:any) => u.streak >= 5 },
  { id: "streak_7",      pass: (u:any) => u.streak >= 7 },
  { id: "streak_30",     pass: (u:any) => u.streak >= 30 },
  { id: "perfectionist", pass: (u:any) => u.perfectQuizzes >= 3 },
  { id: "century",       pass: (u:any) => u.xp >= 500 },
  { id: "xp_thousand",   pass: (u:any) => u.xp >= 1000 },
  { id: "ten_lessons",   pass: (u:any) => u.lessons >= 10 },
  { id: "focused_mind",  pass: (u:any) => u.focusMinutes >= 25 },
];

async function awardBadges(userId: string, stats: any) {
  const existing = await prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } });
  const earnedSet = new Set(existing.map((b:any) => b.badgeId));
  for (const badge of BADGE_CRITERIA) {
    if (!earnedSet.has(badge.id) && badge.pass(stats)) {
      try {
        await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
      } catch { /* unique constraint, skip */ }
    }
  }
}

async function getOrCreateClass(schoolId: string, gradeNum: number) {
  let cls = await prisma.class.findFirst({ where: { schoolId, grade: gradeNum } });
  if (!cls) {
    cls = await prisma.class.create({
      data: { name: `Grade ${gradeNum}`, grade: gradeNum, section: "A", schoolId },
    });
  }
  return cls;
}

// ── Engagement archetypes ─────────────────────────────────────
// Returns a realistic engagement profile for a student
function engagementProfile() {
  const roll = Math.random();
  // ~15% high achievers
  if (roll > 0.85) return {
    tier: "high",
    lessonCount: rand(18, 26),
    streakDays: rand(10, 30),
    perfectRate: randFloat(0.65, 0.95),
    focusMinutes: rand(200, 450),
    xpMultiplier: randFloat(1.1, 1.4),
    activityDensity: 0.85, // how often they log activity per day
  };
  // ~35% mid engagers
  if (roll > 0.50) return {
    tier: "mid",
    lessonCount: rand(8, 17),
    streakDays: rand(3, 12),
    perfectRate: randFloat(0.40, 0.70),
    focusMinutes: rand(50, 200),
    xpMultiplier: randFloat(0.9, 1.1),
    activityDensity: 0.55,
  };
  // ~30% low engagers
  if (roll > 0.20) return {
    tier: "low",
    lessonCount: rand(2, 7),
    streakDays: rand(0, 4),
    perfectRate: randFloat(0.20, 0.45),
    focusMinutes: rand(0, 60),
    xpMultiplier: randFloat(0.7, 0.95),
    activityDensity: 0.25,
  };
  // ~20% disengaged / at risk
  return {
    tier: "disengaged",
    lessonCount: rand(0, 2),
    streakDays: 0,
    perfectRate: randFloat(0.10, 0.30),
    focusMinutes: 0,
    xpMultiplier: 0.6,
    activityDensity: 0.05,
  };
}

async function seedStudent(opts: {
  id: string;
  name: string;
  email: string;
  password: string;
  schoolId: string;
  grade: number;
  allLessonIds: string[];
}) {
  const { id, name, email, password, schoolId, grade, allLessonIds } = opts;
  const cls = await getOrCreateClass(schoolId, grade);
  const profile = engagementProfile();
  const avatar = pick(AVATARS);
  const today = todayKey();

  // Build todayXp map - spread XP over last 60 days realistically
  const todayXpMap: Record<string, number> = {};
  const streakDaysArr: string[] = [];

  for (let daysAgo = 60; daysAgo >= 0; daysAgo--) {
    const willStudy = Math.random() < profile.activityDensity;
    if (!willStudy) continue;
    const d = daysBefore(daysAgo);
    const key = dateKey(d);
    const dayXp = rand(20, 120) * profile.xpMultiplier;
    todayXpMap[key] = Math.round(dayXp);
    streakDaysArr.push(key);
  }

  // Compute a natural-feeling streak (consecutive days from today backwards)
  let streak = 0;
  for (let i = 0; i < profile.streakDays; i++) {
    const d = daysBefore(i);
    if (streakDaysArr.includes(dateKey(d))) streak++;
    else break;
  }
  streak = Math.min(streak, profile.streakDays);

  // Choose lessons (spread over time)
  const lessonSample = [...allLessonIds]
    .sort(() => Math.random() - 0.5)
    .slice(0, profile.lessonCount);

  let totalXp = 0;
  let perfectQuizzes = 0;

  // Create user first (xp=0, update later)
  await prisma.user.create({
    data: {
      id, email, password, name, role: "student", avatar,
      schoolId, classId: cls.id, grade: `Grade ${grade}`,
      xp: 0, streak, perfectQuizzes: 0,
      lastActiveDate: today,
      streakDays: JSON.stringify(streakDaysArr.slice(-30)),
      todayXp: JSON.stringify(todayXpMap),
    },
  });

  // Lesson progress - spread over 60 days
  const lessonInterval = lessonSample.length > 0 ? Math.floor(60 / lessonSample.length) : 1;
  for (let i = 0; i < lessonSample.length; i++) {
    const lessonId = lessonSample[i];
    const isPerfect = Math.random() < profile.perfectRate;
    const score = isPerfect ? 3 : rand(1, 2);
    const total = 3;
    if (isPerfect) perfectQuizzes++;

    const daysAgo = Math.max(0, 60 - i * lessonInterval - rand(0, lessonInterval - 1));
    const completedAt = daysBefore(daysAgo);
    const lessonXp = Math.round((score * 10 + 50 + (isPerfect ? 25 : 0)) * profile.xpMultiplier);
    totalXp += lessonXp;

    try {
      await prisma.lessonProgress.create({
        data: { userId: id, lessonId, score, total, perfect: isPerfect, xpEarned: lessonXp, completedAt },
      });
    } catch { /* unique constraint - skip duplicate */ }

    await prisma.interactionLog.create({
      data: {
        userId: id, kind: "quiz_attempt",
        metadata: JSON.stringify({ lessonId, score, total }),
        createdAt: completedAt,
      },
    });
  }

  // Add focus XP
  const focusXp = Math.round(profile.focusMinutes * 2 * profile.xpMultiplier);
  totalXp += focusXp;

  // Add XP from todayXp map on top
  const mapXp = Object.values(todayXpMap).reduce((a: number, b: number) => a + b, 0) as number;
  totalXp += mapXp;

  const treesGrown = Math.floor(profile.focusMinutes / 25);

  // Update user with final stats
  await prisma.user.update({
    where: { id },
    data: { xp: totalXp, perfectQuizzes, focusMinutes: profile.focusMinutes, treesGrown },
  });

  // Seed login interaction logs
  for (let day = 0; day < 30; day++) {
    if (Math.random() < profile.activityDensity) {
      await prisma.interactionLog.create({
        data: {
          userId: id, kind: "login",
          metadata: JSON.stringify({ device: pick(["Web App", "Mobile", "Tablet"]) }),
          createdAt: daysBefore(day),
        },
      });
    }
  }

  // Feed events
  if (lessonSample.length > 0) {
    await prisma.feedEvent.create({
      data: {
        userId: id, kind: "lesson_complete",
        payload: JSON.stringify({ lessonId: lessonSample[0], xpEarned: rand(60, 120) }),
        createdAt: daysBefore(rand(0, 10)),
      },
    });
  }
  if (profile.focusMinutes >= 25) {
    await prisma.feedEvent.create({
      data: {
        userId: id, kind: "focus_complete",
        payload: JSON.stringify({ minutes: rand(25, 50), treesGrown: 1, xpEarned: rand(50, 100) }),
        createdAt: daysBefore(rand(0, 15)),
      },
    });
  }
  if (streak >= 3) {
    await prisma.feedEvent.create({
      data: {
        userId: id, kind: "streak_milestone",
        payload: JSON.stringify({ streak }),
        createdAt: daysBefore(rand(0, 5)),
      },
    });
  }

  // Notifications
  const notifs = [];
  if (profile.tier === "high") {
    notifs.push({ userId: id, kind: "badge", title: "🏅 Keep it up!", body: "You're in the top performers!", read: rand(0,1) === 1 });
  }
  notifs.push({ userId: id, kind: "announcement", title: "New lessons added!", body: "Check out the latest curriculum updates.", read: false });
  if (streak >= 7) {
    notifs.push({ userId: id, kind: "streak", title: `🔥 ${streak}-day streak!`, body: "Amazing consistency! Keep going.", read: rand(0,1) === 1 });
  }
  if (notifs.length > 0) await prisma.notification.createMany({ data: notifs });

  // Award badges
  await awardBadges(id, {
    xp: totalXp, streak, lessons: lessonSample.length,
    perfectQuizzes, focusMinutes: profile.focusMinutes,
  });

  return { tier: profile.tier, xp: totalXp };
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Extended multi-school seed starting (additive - no data wipe)...\n");

  const password = await bcrypt.hash("password123", 10);
  const allLessons = await prisma.lesson.findMany({ select: { id: true } });
  const allLessonIds = allLessons.map((l: any) => l.id);

  if (allLessonIds.length === 0) {
    console.error("❌ No lessons found. Run the base seed first.");
    process.exit(1);
  }
  console.log(`📚 Found ${allLessonIds.length} lessons to assign from.\n`);

  // ── New Schools ─────────────────────────────────────────────
  const newSchools = [
    { id: "sch_sunrise",  name: "Sunrise Academy",         city: "Pokhara",    color: "#F59E0B", motto: "Rise with the sun" },
    { id: "sch_wisdom",   name: "Wisdom International",    city: "Biratnagar", color: "#8B5CF6", motto: "Knowledge is power" },
    { id: "sch_valley",   name: "Valley View School",      city: "Lalitpur",   color: "#EF4444", motto: "Learn, grow, lead" },
    { id: "sch_everest",  name: "Everest Model School",    city: "Kathmandu",  color: "#06B6D4", motto: "Peak of excellence" },
    { id: "sch_indra",    name: "Indra Memorial School",   city: "Butwal",     color: "#10B981", motto: "Education for all" },
  ];

  const schools: Record<string, any> = {};
  for (const s of newSchools) {
    const existing = await prisma.school.findUnique({ where: { id: s.id } });
    if (existing) {
      console.log(`  ⏭  School already exists: ${s.name}`);
      schools[s.id] = existing;
    } else {
      schools[s.id] = await prisma.school.create({ data: s });
      console.log(`  ✅ School created: ${s.name} (${s.city})`);
    }
  }

  // ── Admins per new school ────────────────────────────────────
  const adminDefs = [
    { id: "u_admin_sunrise",  email: "admin@sunrise.edu",   name: "Pratap Gurung",   schoolId: "sch_sunrise",  avatar: "owl" },
    { id: "u_admin_wisdom",   email: "admin@wisdom.edu",    name: "Kamala Thapa",    schoolId: "sch_wisdom",   avatar: "fox" },
    { id: "u_admin_valley",   email: "admin@valley.edu",    name: "Rajendra Basnet", schoolId: "sch_valley",   avatar: "bear" },
    { id: "u_admin_everest",  email: "admin@everest.edu",   name: "Meena Magar",     schoolId: "sch_everest",  avatar: "penguin" },
    { id: "u_admin_indra",    email: "admin@indra.edu",     name: "Suresh Dahal",    schoolId: "sch_indra",    avatar: "hat" },
  ];

  const admins: Record<string, any> = {};
  for (const a of adminDefs) {
    const existing = await prisma.user.findUnique({ where: { id: a.id } });
    if (existing) { admins[a.id] = existing; continue; }
    admins[a.id] = await prisma.user.create({
      data: { id: a.id, email: a.email, password, name: a.name, role: "admin", avatar: a.avatar, schoolId: a.schoolId },
    });
    console.log(`  ✅ Admin: ${a.email}`);
  }

  // ── Teachers per new school ───────────────────────────────────
  const teacherDefs = [
    // Sunrise
    { id: "u_t_sunrise_1", email: "bibek.sir@sunrise.edu",  name: "Bibek Poudel",    schoolId: "sch_sunrise", avatar: "panda" },
    { id: "u_t_sunrise_2", email: "sarita.m@sunrise.edu",   name: "Sarita Mishra",   schoolId: "sch_sunrise", avatar: "cat" },
    { id: "u_t_sunrise_3", email: "ram.k@sunrise.edu",      name: "Ram Kumar KC",    schoolId: "sch_sunrise", avatar: "dog" },
    // Wisdom
    { id: "u_t_wisdom_1",  email: "anjali.t@wisdom.edu",    name: "Anjali Tamang",   schoolId: "sch_wisdom",  avatar: "bunny" },
    { id: "u_t_wisdom_2",  email: "santosh.m@wisdom.edu",   name: "Santosh Mahat",   schoolId: "sch_wisdom",  avatar: "monkey" },
    // Valley
    { id: "u_t_valley_1",  email: "krishna.d@valley.edu",   name: "Krishna Dahal",   schoolId: "sch_valley",  avatar: "frog" },
    { id: "u_t_valley_2",  email: "sunita.o@valley.edu",    name: "Sunita Oli",      schoolId: "sch_valley",  avatar: "unicorn" },
    { id: "u_t_valley_3",  email: "himal.r@valley.edu",     name: "Himal Rana",      schoolId: "sch_valley",  avatar: "owl" },
    // Everest
    { id: "u_t_everest_1", email: "deepak.g@everest.edu",   name: "Deepak Ghimire",  schoolId: "sch_everest", avatar: "bear" },
    { id: "u_t_everest_2", email: "namrata.p@everest.edu",  name: "Namrata Parajuli",schoolId: "sch_everest", avatar: "fox" },
    // Indra
    { id: "u_t_indra_1",   email: "gopal.s@indra.edu",      name: "Gopal Sharma",    schoolId: "sch_indra",   avatar: "hat" },
    { id: "u_t_indra_2",   email: "roshani.c@indra.edu",    name: "Roshani Chhetri", schoolId: "sch_indra",   avatar: "penguin" },
  ];

  const teachers: Record<string, any> = {};
  for (const t of teacherDefs) {
    const existing = await prisma.user.findUnique({ where: { id: t.id } });
    if (existing) { teachers[t.id] = existing; continue; }
    teachers[t.id] = await prisma.user.create({
      data: { id: t.id, email: t.email, password, name: t.name, role: "teacher", avatar: t.avatar, schoolId: t.schoolId },
    });
    console.log(`  ✅ Teacher: ${t.email}`);
  }

  // ── Students per school ───────────────────────────────────────
  const schoolStudentCounts: Record<string, number> = {
    "sch_sunrise": 80,
    "sch_wisdom":  70,
    "sch_valley":  90,
    "sch_everest": 65,
    "sch_indra":   55,
  };

  const usedNames = new Set<string>();
  let totalCreated = 0;
  let tierCounts = { high: 0, mid: 0, low: 0, disengaged: 0 };

  for (const [schoolId, count] of Object.entries(schoolStudentCounts)) {
    const schoolPrefix = schoolId.replace("sch_", "");
    console.log(`\n📍 Seeding ${count} students for ${schools[schoolId].name}...`);
    let schoolCreated = 0;

    for (let i = 1; i <= count; i++) {
      // Generate unique name
      let name = "";
      let attempts = 0;
      do {
        name = `${pick(FIRST)} ${pick(LAST)}`;
        attempts++;
      } while (usedNames.has(name) && attempts < 30);
      usedNames.add(name);

      const grade = pick(GRADES_NUM);
      const nameParts = name.toLowerCase().split(" ");
      const uid = `u_s_${schoolPrefix}_${totalCreated + 1}`;
      const email = `${nameParts[0]}.${nameParts[1]}_s_${grade}@${schoolPrefix}.edu`;

      // Skip if user with this email already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) continue;

      try {
        const result = await seedStudent({
          id: uid, name, email, password,
          schoolId, grade, allLessonIds,
        });
        tierCounts[result.tier as keyof typeof tierCounts]++;
        totalCreated++;
        schoolCreated++;

        if (schoolCreated % 20 === 0) {
          console.log(`    ... ${schoolCreated}/${count} done`);
        }
      } catch (err: any) {
        // Skip duplicates / constraint errors silently
        if (!err.message?.includes("Unique constraint")) {
          console.warn(`  ⚠  Skipped ${name}: ${err.message?.slice(0, 60)}`);
        }
      }
    }
    console.log(`  ✅ ${schoolCreated} students created for ${schools[schoolId].name}`);
  }

  // ── Assignments for new schools ───────────────────────────────
  const assignmentDefs = [
    { schoolId: "sch_sunrise", teacherId: "u_t_sunrise_1", lessonId: "m-alg-1",    daysUntilDue: 5,  note: "Algebra introduction - review before test." },
    { schoolId: "sch_sunrise", teacherId: "u_t_sunrise_2", lessonId: "e-gram-1",   daysUntilDue: 3,  note: "Grammar check for class 6." },
    { schoolId: "sch_wisdom",  teacherId: "u_t_wisdom_1",  lessonId: "s-plants-1", daysUntilDue: 7,  note: "Plant biology chapter review." },
    { schoolId: "sch_wisdom",  teacherId: "u_t_wisdom_2",  lessonId: "cs-code-1",  daysUntilDue: 10, note: "Intro coding - pair with scratch activity." },
    { schoolId: "sch_valley",  teacherId: "u_t_valley_1",  lessonId: "ss-geo-2",   daysUntilDue: 4,  note: "Nepal geography unit." },
    { schoolId: "sch_valley",  teacherId: "u_t_valley_2",  lessonId: "m-frac-2",   daysUntilDue: 2,  note: "Fractions worksheet follow-up." },
    { schoolId: "sch_everest", teacherId: "u_t_everest_1", lessonId: "s-forces-1", daysUntilDue: 6,  note: "Forces unit - Newton's laws intro." },
    { schoolId: "sch_indra",   teacherId: "u_t_indra_1",   lessonId: "health-nut-1",daysUntilDue: 8, note: "Health awareness week activity." },
  ];

  for (const a of assignmentDefs) {
    const cls = await prisma.class.findFirst({ where: { schoolId: a.schoolId } });
    if (!cls) continue;
    const dueAt = new Date(); dueAt.setDate(dueAt.getDate() + a.daysUntilDue);
    await prisma.assignment.create({
      data: { classId: cls.id, lessonId: a.lessonId, assignedBy: a.teacherId, dueAt, note: a.note },
    });
  }
  console.log("\n  ✅ Assignments created for new schools");

  // ── Summary ───────────────────────────────────────────────────
  const totalStudents = await prisma.user.count({ where: { role: "student" } });
  const totalBadges   = await prisma.userBadge.count();
  const totalSchools  = await prisma.school.count();

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Extended seed complete!");
  console.log("=".repeat(60));
  console.log(`📊 Platform totals:`);
  console.log(`   Schools:        ${totalSchools}`);
  console.log(`   Students:       ${totalStudents} (${totalCreated} new)`);
  console.log(`   Badges in DB:   ${totalBadges}`);
  console.log(`\n   Engagement distribution (new students):`);
  console.log(`   🏆 High achievers:  ${tierCounts.high}`);
  console.log(`   📘 Mid engagers:    ${tierCounts.mid}`);
  console.log(`   📉 Low engagers:    ${tierCounts.low}`);
  console.log(`   ⚠  Disengaged:      ${tierCounts.disengaged}`);
  console.log("\n📋 New credentials:");
  console.log("   Admin (Sunrise):  admin@sunrise.edu / password123");
  console.log("   Admin (Wisdom):   admin@wisdom.edu  / password123");
  console.log("   Admin (Valley):   admin@valley.edu  / password123");
  console.log("   Admin (Everest):  admin@everest.edu / password123");
  console.log("   Admin (Indra):    admin@indra.edu   / password123");
  console.log("=".repeat(60));
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
