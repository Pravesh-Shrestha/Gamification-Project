// ============================================================
// academia.io — Stats & Performance Service
// ============================================================
// Provides summary stats, leaderboards, weekly/daily
// performance analytics for students, teachers, and admins.
// ============================================================

import { prisma } from "../lib/prisma.js";
import { levelFromXP, xpForNextLevel } from "./engagement.service.js";

// ── User Summary Stats ────────────────────────────────────
export async function getUserSummary(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: true,
      _count: { select: { lessonsCompleted: true } },
    },
  });

  if (!user) throw new Error("User not found");

  const streakDays: string[] = JSON.parse(user.streakDays);

  return {
    xp: user.xp,
    level: levelFromXP(user.xp),
    levelProgress: xpForNextLevel(user.xp),
    streak: user.streak,
    totalDaysActive: streakDays.length,
    lessonsCompleted: user._count.lessonsCompleted,
    perfectQuizzes: user.perfectQuizzes,
    focusMinutes: user.focusMinutes,
    treesGrown: user.treesGrown,
    badges: user.badges.length,
  };
}

// ── Weekly Stats ──────────────────────────────────────────
export async function getWeeklyStats(userId: string): Promise<{
  days: { date: string; xp: number; lessons: number }[];
  totalXp: number;
  totalLessons: number;
  averagePerDay: number;
  streakBonus: number;
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const todayXp: Record<string, number> = JSON.parse(user.todayXp);
  const today = new Date();

  // Get last 7 days
  const days: { date: string; xp: number; lessons: number }[] = [];
  let totalXp = 0;
  let totalLessons = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // Count lessons completed on that day
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const lessonCount = await prisma.lessonProgress.count({
      where: {
        userId,
        completedAt: { gte: startOfDay, lt: endOfDay },
      },
    });

    const xp = todayXp[key] || 0;
    days.push({ date: key, xp, lessons: lessonCount });
    totalXp += xp;
    totalLessons += lessonCount;
  }

  // Streak bonus calculation
  const streakBonus = user.streak >= 5 ? user.streak * 2 : 0;

  return {
    days,
    totalXp,
    totalLessons,
    averagePerDay: Math.round(totalXp / 7),
    streakBonus,
  };
}

// ── Leaderboard (by school) ───────────────────────────────
export async function getLeaderboard(schoolId?: string, limit: number = 20) {
  const where = schoolId ? { schoolId, role: "student" as const } : { role: "student" as const };

  const students = await prisma.user.findMany({
    where,
    orderBy: { xp: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      avatar: true,
      grade: true,
      xp: true,
      streak: true,
      schoolId: true,
      _count: { select: { lessonsCompleted: true } },
    },
  });

  return students.map((s, i) => ({
    rank: i + 1,
    ...s,
    level: levelFromXP(s.xp),
    lessonsCompleted: s._count.lessonsCompleted,
  }));
}

// ── Teacher: Class Performance ────────────────────────────
export async function getClassPerformance(schoolId: string) {
  const students = await prisma.user.findMany({
    where: { schoolId, role: "student" },
    orderBy: { xp: "desc" },
    select: {
      id: true,
      name: true,
      avatar: true,
      grade: true,
      xp: true,
      streak: true,
      perfectQuizzes: true,
      focusMinutes: true,
      _count: { select: { lessonsCompleted: true } },
      badges: { select: { badgeId: true } },
    },
  });

  // Aggregate stats
  const totalStudents = students.length;
  const stats = {
    totalStudents,
    averageXp: totalStudents ? Math.round(students.reduce((s, u) => s + u.xp, 0) / totalStudents) : 0,
    averageStreak: totalStudents ? Math.round(students.reduce((s, u) => s + u.streak, 0) / totalStudents) : 0,
    totalLessonsCompleted: students.reduce((s, u) => s + u._count.lessonsCompleted, 0),
    topPerformer: students[0]?.name || "N/A",
    studentsAtRisk: students.filter(s => s.streak === 0 || s.xp < 100).length,
  };

  return { stats, students };
}

// ── Attendance / Activity Heatmap ─────────────────────────
export async function getActivityHeatmap(userId: string, days: number = 30) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const todayXp: Record<string, number> = JSON.parse(user.todayXp);
  const today = new Date();

  const heatmap: { date: string; xp: number; count: number; active: boolean }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const count = await prisma.lessonProgress.count({
      where: {
        userId,
        completedAt: { gte: startOfDay, lt: endOfDay },
      },
    });

    const xp = todayXp[key] || 0;
    heatmap.push({ date: key, xp, count, active: count > 0 || xp > 0 });
  }

  return heatmap;
}
