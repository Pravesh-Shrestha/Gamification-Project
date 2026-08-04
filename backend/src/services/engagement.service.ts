// Core progression, XP tracking, and learning milestones system.

import { prisma } from "../lib/prisma.js";

// ── Constants ─────────────────────────────────────────────
const DAILY_GOAL_DEFAULT = 50;
const XP_PER_CORRECT = 10;
const XP_PER_LESSON_COMPLETE = 50;
const XP_PERFECT_BONUS = 25;
const XP_FOCUS_PER_MIN = 2;
const XP_STREAK_BONUS_THRESHOLD = 5; // bonus streak XP after 5 days

// ── Badge Definitions ─────────────────────────────────────
export const BADGE_DEFS = [
  { id: "first_steps",    name: "First Steps",    desc: "Complete your first lesson",        icon: "🌱" },
  { id: "streak_3",       name: "On a Roll",       desc: "3-day learning streak",             icon: "🔥" },
  { id: "streak_7",       name: "Week Warrior",    desc: "7-day learning streak",             icon: "🏆" },
  { id: "streak_30",      name: "Monthly Legend",  desc: "30-day learning streak",            icon: "💫" },
  { id: "perfectionist",  name: "Perfectionist",   desc: "Score 100% on 3 quizzes",           icon: "💎" },
  { id: "math_master",    name: "Math Master",     desc: "Finish every Math lesson",          icon: "📐" },
  { id: "sci_master",     name: "Science Sage",    desc: "Finish every Science lesson",        icon: "🧪" },
  { id: "eng_master",     name: "Word Wizard",     desc: "Finish every English lesson",        icon: "📚" },
  { id: "focused_mind",   name: "Focused Mind",    desc: "Complete a 25-min focus session",   icon: "🌳" },
  { id: "early_bird",     name: "Early Bird",      desc: "Study before 9am",                  icon: "🐦" },
  { id: "night_owl",      name: "Night Owl",       desc: "Study after 9pm",                   icon: "🦉" },
  { id: "century",        name: "Century",         desc: "Earn 500 XP total",                 icon: "💯" },
  { id: "xp_thousand",    name: "XP Champion",     desc: "Earn 1000 XP total",                icon: "🏅" },
  { id: "five_streak",    name: "Consistent",      desc: "Study 5 days in a row",             icon: "📅" },
  { id: "ten_lessons",    name: "Dedicated",       desc: "Complete 10 lessons",               icon: "🎯" },
];

// ── Level Calculation ─────────────────────────────────────
export function levelFromXP(xp: number): number {
  let lvl = 1;
  // Formula: cumulative XP needed = 50 * n * (n+1) / 2
  while (50 * lvl * (lvl + 1) / 2 <= xp) lvl++;
  return lvl;
}

export function xpForNextLevel(xp: number) {
  const lvl = levelFromXP(xp);
  const need = 50 * lvl * (lvl + 1) / 2;
  const prev = lvl === 1 ? 0 : 50 * (lvl - 1) * lvl / 2;
  return { lvl, prev, need, into: xp - prev, span: need - prev };
}

// ── Date Helpers ──────────────────────────────────────────
export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isYesterday(key: string): boolean {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return key === yk;
}

function currentHour(): number {
  return new Date().getHours();
}

// ── Streak Management ─────────────────────────────────────
export function bumpStreak(
  lastActiveDate: string | null,
  currentStreak: number,
  streakDays: string[]
): { streak: number; streakDays: string[]; streakBroken?: boolean } {
  const today = todayKey();

  // Already active today - no change
  if (lastActiveDate === today) {
    return { streak: currentStreak, streakDays };
  }

  let newStreak: number;
  let streakBroken = false;

  if (lastActiveDate && isYesterday(lastActiveDate)) {
    // Consecutive day
    newStreak = currentStreak + 1;
  } else if (lastActiveDate && lastActiveDate !== today) {
    // Missed a day - streak broken
    newStreak = 1;
    streakBroken = true;
  } else {
    // First day ever
    newStreak = 1;
  }

  const updatedDays = streakDays.includes(today) ? streakDays : [...streakDays, today];

  return { streak: newStreak, streakDays: updatedDays, streakBroken };
}

// ── XP Management ─────────────────────────────────────────
export function addTodayXp(todayXpStr: string, xpAmount: number): string {
  const todayXp: Record<string, number> = JSON.parse(todayXpStr);
  const today = todayKey();
  todayXp[today] = (todayXp[today] || 0) + xpAmount;
  return JSON.stringify(todayXp);
}

// ── Quest Management ──────────────────────────────────────
const QUEST_POOL = [
  { id: "q_lessons2", text: "Finish 2 lessons today", goal: 2, kind: "lessons", reward: 30 },
  { id: "q_lessons3", text: "Finish 3 lessons today", goal: 3, kind: "lessons", reward: 50 },
  { id: "q_perfect", text: "Score 100% on 1 quiz", goal: 1, kind: "perfect", reward: 25 },
  { id: "q_focus", text: "Focus for 25 minutes", goal: 25, kind: "focus_min", reward: 30 },
  { id: "q_xp100", text: "Earn 100 XP today", goal: 100, kind: "xp", reward: 25 },
  { id: "q_xp150", text: "Earn 150 XP today", goal: 150, kind: "xp", reward: 40 },
  { id: "q_combo3", text: "Get a 3× combo", goal: 3, kind: "combo", reward: 20 },
  { id: "q_subject_math", text: "Finish a Math lesson", goal: 1, kind: "subject", subject: "math", reward: 20 },
  { id: "q_subject_sci", text: "Finish a Science lesson", goal: 1, kind: "subject", subject: "sci", reward: 20 },
  { id: "q_subject_eng", text: "Finish an English lesson", goal: 1, kind: "subject", subject: "eng", reward: 20 },
];

export function getTodaysQuests(userId: string): any[] {
  const today = todayKey();
  const seed = (today + "::" + userId).split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0x7fffffff, 7);
  const pool = [...QUEST_POOL];
  const out = [];
  let s = seed;
  while (out.length < 3 && pool.length) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % pool.length;
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export async function evaluateQuests(
  userId: string,
  user: any,
  actionType: "lesson" | "focus",
  payload: {
    score?: number;
    total?: number;
    subjectId?: string;
    comboMax?: number;
    minutes?: number;
    totalXpEarned?: number;
  }
): Promise<{ bonusXp: number; updatedState: string; completedQuests: any[] }> {
  const today = todayKey();
  let questsState: Record<string, Record<string, number>> = {};
  try {
    questsState = JSON.parse(user.questsState || "{}");
  } catch {
    questsState = {};
  }
  questsState[today] = questsState[today] || {};

  const todayState = questsState[today];
  const todaysQuestsList = getTodaysQuests(userId);
  const completedQuests: any[] = [];
  let bonusXp = 0;

  for (const quest of todaysQuestsList) {
    const before = todayState[quest.id] || 0;
    if (before >= quest.goal) continue;

    let progress = before;

    if (actionType === "lesson" && payload) {
      if (quest.kind === "lessons") {
        progress += 1;
      } else if (quest.kind === "perfect" && payload.score === payload.total) {
        progress += 1;
      } else if (quest.kind === "combo" && payload.comboMax && payload.comboMax >= quest.goal) {
        progress = quest.goal;
      } else if (quest.kind === "subject" && quest.subject === payload.subjectId) {
        progress += 1;
      }
    } else if (actionType === "focus" && payload) {
      if (quest.kind === "focus_min" && payload.minutes) {
        progress = Math.min(quest.goal, before + payload.minutes);
      }
    }

    if (quest.kind === "xp" && payload.totalXpEarned) {
      let todayXpLog: Record<string, number> = {};
      try {
        todayXpLog = JSON.parse(user.todayXp || "{}");
      } catch {
        todayXpLog = {};
      }
      const todayTotal = (todayXpLog[today] || 0) + payload.totalXpEarned + bonusXp;
      progress = Math.min(quest.goal, todayTotal);
    }

    todayState[quest.id] = progress;

    if (progress >= quest.goal && before < quest.goal) {
      bonusXp += quest.reward;
      completedQuests.push(quest);

      await prisma.notification.create({
        data: {
          userId,
          kind: "quest",
          title: `🎯 Quest Complete: ${quest.text}`,
          body: `Earned +${quest.reward} XP bonus!`,
          link: "/home",
        },
      });
    }
  }

  questsState[today] = todayState;
  return { bonusXp, updatedState: JSON.stringify(questsState), completedQuests };
}

// ── Badge Checking ────────────────────────────────────────
export async function checkNewBadges(userId: string, userData: {
  xp: number;
  streak: number;
  lessonsCompleted: string[];
  perfectQuizzes: number;
  focusMinutes: number;
  studiedBefore9am: boolean;
  studiedAfter9pm: boolean;
}): Promise<string[]> {
  const earnedBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  });
  const earned = new Set(earnedBadges.map(b => b.badgeId));
  const newBadges: string[] = [];

  function tryAward(id: string) {
    if (!earned.has(id)) {
      earned.add(id);
      newBadges.push(id);
    }
  }

  // Check all badge conditions
  if (userData.lessonsCompleted.length >= 1) tryAward("first_steps");
  if (userData.streak >= 3) tryAward("streak_3");
  if (userData.streak >= 5) tryAward("five_streak");
  if (userData.streak >= 7) tryAward("streak_7");
  if (userData.streak >= 30) tryAward("streak_30");
  if (userData.perfectQuizzes >= 3) tryAward("perfectionist");
  if (userData.xp >= 500) tryAward("century");
  if (userData.xp >= 1000) tryAward("xp_thousand");
  if (userData.lessonsCompleted.length >= 10) tryAward("ten_lessons");
  if (userData.focusMinutes >= 25) tryAward("focused_mind");
  if (userData.studiedBefore9am) tryAward("early_bird");
  if (userData.studiedAfter9pm) tryAward("night_owl");

  // Subject mastery badges - check against curriculum
  const allLessons = await prisma.lesson.findMany();
  const completedSet = new Set(userData.lessonsCompleted);

  for (const subjectId of ["math", "sci", "eng"]) {
    const subjLessons = allLessons.filter(l => l.subjectId === subjectId).map(l => l.id);
    if (subjLessons.length > 0 && subjLessons.every(id => completedSet.has(id))) {
      const badgeMap: Record<string, string> = {
        math: "math_master",
        sci: "sci_master",
        eng: "eng_master",
      };
      tryAward(badgeMap[subjectId]);
    }
  }

  // Persist new badges
  for (const badgeId of newBadges) {
    await prisma.userBadge.create({
      data: { userId, badgeId },
    });
  }

  return newBadges;
}

// ── Lesson Completion ─────────────────────────────────────
export async function processLessonComplete(
  userId: string,
  lessonId: string,
  score: number,
  total: number,
  subjectId: string,
  xpMultiplier: number = 1,
  comboMax: number = 0
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const perfect = score === total;

  // Track lessons completed via LessonProgress table
  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  const alreadyCompleted = !!progress;

  // Full XP on the FIRST completion only. Re-completing a lesson is treated as
  // review: it keeps the streak alive but awards no XP (prevents XP farming).
  const xpFromCorrect = score * XP_PER_CORRECT * xpMultiplier;
  const xpFromLesson = XP_PER_LESSON_COMPLETE * xpMultiplier;
  const xpPerfectBonus = perfect ? XP_PERFECT_BONUS * xpMultiplier : 0;
  const streakBonus = user.streak >= XP_STREAK_BONUS_THRESHOLD ? 10 * xpMultiplier : 0;
  const totalXpEarned = alreadyCompleted
    ? 0
    : Math.round(xpFromCorrect + xpFromLesson + xpPerfectBonus + streakBonus);

  // Evaluate quests on backend (only on first completion)
  let bonusXp = 0;
  let updatedState = user.questsState;
  let completedQuests: string[] = [];
  if (!alreadyCompleted) {
    const q = await evaluateQuests(userId, user, "lesson", {
      score,
      total,
      subjectId,
      comboMax,
      totalXpEarned,
    });
    bonusXp = q.bonusXp;
    updatedState = q.updatedState;
    completedQuests = q.completedQuests;
  }

  const finalXpEarned = totalXpEarned + bonusXp;

  // Update streak (always - even review practice keeps the streak alive)
  const streakDays: string[] = JSON.parse(user.streakDays);
  const { streak: newStreak, streakDays: newStreakDays } = bumpStreak(
    user.lastActiveDate, user.streak, streakDays
  );

  if (!progress) {
    await prisma.lessonProgress.create({
      data: { userId, lessonId, score, total, perfect, xpEarned: finalXpEarned },
    });
  }

  // Get all completed lesson IDs for badge check
  const allProgress = await prisma.lessonProgress.findMany({
    where: { userId },
    select: { lessonId: true },
  });
  const completedLessonIds = allProgress.map(p => p.lessonId);

  // Update user gamification fields
  const perfectQuizzes = perfect && !alreadyCompleted ? user.perfectQuizzes + 1 : user.perfectQuizzes;
  const todayXp = addTodayXp(user.todayXp, finalXpEarned);

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: user.xp + finalXpEarned,
      streak: newStreak,
      lastActiveDate: todayKey(),
      streakDays: JSON.stringify(newStreakDays),
      perfectQuizzes,
      todayXp,
      questsState: updatedState,
    },
  });

  // Check for new badges
  const hour = currentHour();
  const newBadgeIds = await checkNewBadges(userId, {
    xp: user.xp + finalXpEarned,
    streak: newStreak,
    lessonsCompleted: completedLessonIds,
    perfectQuizzes,
    focusMinutes: user.focusMinutes,
    studiedBefore9am: hour < 9,
    studiedAfter9pm: hour >= 21,
  });

  // Create notifications for new badges
  for (const badgeId of newBadgeIds) {
    const badgeDef = BADGE_DEFS.find(b => b.id === badgeId);
    await prisma.notification.create({
      data: {
        userId,
        kind: "badge",
        title: `🏅 New Badge: ${badgeDef?.name || badgeId}`,
        body: badgeDef?.desc,
        link: "/profile",
      },
    });
  }

  // Create feed event
  await prisma.feedEvent.create({
    data: {
      userId,
      kind: "lesson_complete",
      payload: JSON.stringify({ lessonId, score, total, perfect, xpEarned: finalXpEarned }),
    },
  });

  return {
    xpEarned: finalXpEarned,
    alreadyCompleted,
    newStreak,
    perfect,
    newBadges: newBadgeIds,
    completedQuests,
    questsState: updatedState,
    level: levelFromXP(user.xp + finalXpEarned),
    levelProgress: xpForNextLevel(user.xp + finalXpEarned),
  };
}

// ── Focus Session ─────────────────────────────────────────
export async function processFocusComplete(userId: string, minutes: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const xpEarned = Math.round(minutes * XP_FOCUS_PER_MIN);
  const treesGrown = 1;

  // Evaluate quests
  const { bonusXp, updatedState, completedQuests } = await evaluateQuests(userId, user, "focus", {
    minutes,
    totalXpEarned: xpEarned,
  });

  const finalXpEarned = xpEarned + bonusXp;
  const todayXp = addTodayXp(user.todayXp, finalXpEarned);

  await prisma.user.update({
    where: { id: userId },
    data: {
      focusMinutes: user.focusMinutes + minutes,
      treesGrown: user.treesGrown + treesGrown,
      xp: user.xp + finalXpEarned,
      todayXp,
      questsState: updatedState,
    },
  });

  // Create feed event
  await prisma.feedEvent.create({
    data: {
      userId,
      kind: "focus_complete",
      payload: JSON.stringify({ minutes, treesGrown, xpEarned: finalXpEarned }),
    },
  });

  return {
    xpEarned: finalXpEarned,
    treesGrown,
    completedQuests,
    questsState: updatedState,
    level: levelFromXP(user.xp + finalXpEarned),
    levelProgress: xpForNextLevel(user.xp + finalXpEarned),
  };
}

// ── Dashboard Stats ───────────────────────────────────────
export async function getDashboard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      lessonsCompleted: { orderBy: { completedAt: "desc" }, take: 5 },
      badges: { include: { badge: true } },
      notifications: { where: { read: false }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!user) throw new Error("User not found");

  const classId = user.classId;
  const dbAssignments = classId
    ? await prisma.assignment.findMany({
        where: { classId },
        orderBy: { assignedAt: "desc" },
      })
    : [];

  const today = todayKey();
  const todayXp: Record<string, number> = JSON.parse(user.todayXp);
  const streakDays: string[] = JSON.parse(user.streakDays);
  const cosmetics: string[] = JSON.parse(user.cosmetics);

  // Calculate today's stats
  const todayStats = {
    xp: todayXp[today] || 0,
    goal: user.dailyGoal,
    progress: Math.min(100, Math.round(((todayXp[today] || 0) / user.dailyGoal) * 100)),
  };

  // Recent activity
  const recentActivity = user.lessonsCompleted.map(lp => ({
    lessonId: lp.lessonId,
    score: lp.score,
    total: lp.total,
    perfect: lp.perfect,
    xpEarned: lp.xpEarned,
    completedAt: lp.completedAt,
  }));

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      grade: user.grade,
      schoolId: user.schoolId,
    },
    gamification: {
      xp: user.xp,
      level: levelFromXP(user.xp),
      levelProgress: xpForNextLevel(user.xp),
      streak: user.streak,
      streakDays: streakDays.length,
      todayStats,
      perfectQuizzes: user.perfectQuizzes,
      focusMinutes: user.focusMinutes,
      treesGrown: user.treesGrown,
      dailyGoal: user.dailyGoal,
    },
    badges: user.badges.map(ub => ub.badge),
    cosmetics,
    recentActivity,
    unreadNotifications: user.notifications.length,
    assignments: dbAssignments.map((a: any) => ({
      id: a.id,
      classId: a.classId,
      lessonId: a.lessonId,
      assignedBy: a.assignedBy,
      assignedAt: a.assignedAt.getTime(),
      dueAt: a.dueAt.getTime(),
      note: a.note,
    })),
  };
}
