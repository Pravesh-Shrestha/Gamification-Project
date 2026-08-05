/**
 * Badge Backfill Script
 * Awards all earned-but-missing badges to existing students based on their
 * current XP, streak, lessons completed, focus minutes, and perfect quizzes.
 * Run once after seeding or when badge logic is added/changed.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const BADGE_DEFS = [
  { id: "first_steps",   check: (u: any) => u.lessons >= 1 },
  { id: "streak_3",      check: (u: any) => u.streak >= 3 },
  { id: "five_streak",   check: (u: any) => u.streak >= 5 },
  { id: "streak_7",      check: (u: any) => u.streak >= 7 },
  { id: "streak_30",     check: (u: any) => u.streak >= 30 },
  { id: "perfectionist", check: (u: any) => u.perfectQuizzes >= 3 },
  { id: "century",       check: (u: any) => u.xp >= 500 },
  { id: "xp_thousand",   check: (u: any) => u.xp >= 1000 },
  { id: "ten_lessons",   check: (u: any) => u.lessons >= 10 },
  { id: "focused_mind",  check: (u: any) => u.focusMinutes >= 25 },
];

async function backfill() {
  console.log("🔄 Starting badge backfill...");

  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: {
      id: true, name: true, xp: true, streak: true,
      perfectQuizzes: true, focusMinutes: true,
      _count: { select: { lessonsCompleted: true } },
    },
  });

  console.log(`Found ${students.length} students to process.`);

  let totalAwarded = 0;
  let studentsUpdated = 0;

  for (const student of students) {
    // Get already-earned badge IDs
    const existing = await prisma.userBadge.findMany({
      where: { userId: student.id },
      select: { badgeId: true },
    });
    const earnedSet = new Set(existing.map((b: any) => b.badgeId));

    const userData = {
      xp: student.xp,
      streak: student.streak,
      perfectQuizzes: student.perfectQuizzes,
      focusMinutes: student.focusMinutes,
      lessons: student._count.lessonsCompleted,
    };

    const toAward: string[] = [];
    for (const badge of BADGE_DEFS) {
      if (!earnedSet.has(badge.id) && badge.check(userData)) {
        toAward.push(badge.id);
      }
    }

    if (toAward.length > 0) {
      for (const badgeId of toAward) {
        try {
          await prisma.userBadge.create({
            data: { userId: student.id, badgeId },
          });
          totalAwarded++;
        } catch (e: any) {
          // Unique constraint - already exists, skip
          if (!e.message?.includes("Unique constraint")) {
            console.error(`  ✗ Error awarding ${badgeId} to ${student.name}:`, e.message);
          }
        }
      }
      console.log(`  ✅ ${student.name}: awarded [${toAward.join(", ")}]`);
      studentsUpdated++;
    }
  }

  console.log(`\n🏅 Backfill complete!`);
  console.log(`   Students updated: ${studentsUpdated} / ${students.length}`);
  console.log(`   Total badges awarded: ${totalAwarded}`);

  await prisma.$disconnect();
  await pool.end();
}

backfill().catch((e) => { console.error("❌ Backfill failed:", e); process.exit(1); });
