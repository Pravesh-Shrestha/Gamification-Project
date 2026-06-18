import { CURRICULUM } from "./curriculum";

const DAILY_GOAL_DEFAULT = 50;
const XP_PER_CORRECT = 10;
const XP_PER_LESSON = 50;
const XP_PERFECT_BONUS = 25;
const XP_FOCUS_PER_MIN = 2;

const BADGES = [
  { id: "first_steps", name: "First Steps", desc: "Complete your first lesson", icon: "🌱" },
  { id: "streak_3", name: "On a Roll", desc: "3-day learning streak", icon: "🔥" },
  { id: "streak_7", name: "Week Warrior", desc: "7-day learning streak", icon: "🏆" },
  { id: "perfectionist", name: "Perfectionist", desc: "Score 100% on 3 quizzes", icon: "💎" },
  { id: "math_master", name: "Math Master", desc: "Finish every Math lesson", icon: "📐" },
  { id: "sci_master", name: "Science Sage", desc: "Finish every Science lesson", icon: "🧪" },
  { id: "eng_master", name: "Word Wizard", desc: "Finish every English lesson", icon: "📚" },
  { id: "focused_mind", name: "Focused Mind", desc: "Complete a 25-min focus session", icon: "🌳" },
  { id: "early_bird", name: "Early Bird", desc: "Study before 9am", icon: "🐦" },
  { id: "night_owl", name: "Night Owl", desc: "Study after 9pm", icon: "🦉" },
  { id: "century", name: "Century", desc: "Earn 500 XP total", icon: "💯" },
];

function levelFromXP(xp) {
  let lvl = 1;
  while (50 * lvl * (lvl + 1) / 2 <= xp) lvl++;
  return lvl;
}

function xpForNextLevel(xp) {
  const lvl = levelFromXP(xp);
  const need = 50 * lvl * (lvl + 1) / 2;
  const prev = lvl === 1 ? 0 : 50 * (lvl - 1) * lvl / 2;
  return { lvl, prev, need, into: xp - prev, span: need - prev };
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isYesterday(key) {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return key === yk;
}

function bumpStreak(profile) {
  const today = todayKey();
  if (profile.lastActiveDay === today) return profile.streak;
  if (profile.lastActiveDay && isYesterday(profile.lastActiveDay)) {
    profile.streak = (profile.streak || 0) + 1;
  } else {
    profile.streak = 1;
  }
  profile.lastActiveDay = today;
  profile.streakDays = profile.streakDays || [];
  if (!profile.streakDays.includes(today)) profile.streakDays.push(today);
  return profile.streak;
}

function checkBadges(profile, hint: any = {}) {
  const earned = new Set(profile.badges || []);
  const newOnes = [];

  function award(id) {
    if (!earned.has(id)) {
      earned.add(id);
      newOnes.push(BADGES.find((b) => b.id === id));
    }
  }

  if ((profile.lessonsCompleted || []).length >= 1) award("first_steps");
  if (profile.streak >= 3) award("streak_3");
  if (profile.streak >= 7) award("streak_7");
  if ((profile.perfectQuizzes || 0) >= 3) award("perfectionist");
  if (profile.xp >= 500) award("century");

  for (const subject of CURRICULUM) {
    const subjLessons = subject.chapters.flatMap((chapter) => chapter.lessons.map((lesson) => lesson.id));
    if (subjLessons.every((id) => (profile.lessonsCompleted || []).includes(id))) {
      if (subject.id === "math") award("math_master");
      if (subject.id === "sci") award("sci_master");
      if (subject.id === "eng") award("eng_master");
    }
  }

  if (hint.focusMinutes >= 25) award("focused_mind");
  const hour = new Date().getHours();
  if (hour < 9 && hint.studied) award("early_bird");
  if (hour >= 21 && hint.studied) award("night_owl");

  profile.badges = Array.from(earned);
  return newOnes;
}

function processLessonComplete(profile, lessonId, score, total, opts: any = {}) {
  const log = [];
  const mult = opts.xpMultiplier || 1;
  const perfect = score === total;
  const xpFromQs = score * XP_PER_CORRECT;
  const xpLesson = XP_PER_LESSON;
  const xpBonus = perfect ? XP_PERFECT_BONUS : 0;
  const xpGain = Math.round((xpFromQs + xpLesson + xpBonus) * mult);

  profile.xp = (profile.xp || 0) + xpGain;
  profile.todayXP = (profile.todayXP || {});
  const tk = todayKey();
  profile.todayXP[tk] = (profile.todayXP[tk] || 0) + xpGain;

  profile.lessonsCompleted = profile.lessonsCompleted || [];
  if (!profile.lessonsCompleted.includes(lessonId)) {
    profile.lessonsCompleted.push(lessonId);
    log.push(`Lesson "${lessonId}" marked complete`);
  } else {
    log.push(`Lesson "${lessonId}" already done — re-played for review`);
  }

  if (perfect) {
    profile.perfectQuizzes = (profile.perfectQuizzes || 0) + 1;
    log.push(`Perfect score — bonus +${XP_PERFECT_BONUS} XP`);
  }

  log.push(`+${xpGain} XP awarded (${xpFromQs} from answers + ${xpLesson} lesson${perfect ? " + " + XP_PERFECT_BONUS + " bonus" : ""}${mult !== 1 ? ` × ${mult}` : ""})`);

  const streakBefore = profile.streak || 0;
  bumpStreak(profile);
  if (profile.streak !== streakBefore) {
    log.push(`Streak now ${profile.streak} day${profile.streak === 1 ? "" : "s"}`);
  }

  const newBadges = checkBadges(profile, { studied: true });
  for (const b of newBadges) log.push(`Badge unlocked: ${b.icon} ${b.name}`);

  return { xpGain, perfect, newBadges, log };
}

function processFocusComplete(profile, minutes, opts: any = {}) {
  const log = [];
  const mult = opts.xpMultiplier || 1;
  const xp = Math.round(minutes * XP_FOCUS_PER_MIN * mult);
  profile.xp = (profile.xp || 0) + xp;
  const tk = todayKey();
  profile.todayXP = profile.todayXP || {};
  profile.todayXP[tk] = (profile.todayXP[tk] || 0) + xp;
  profile.focusMinutes = (profile.focusMinutes || 0) + minutes;
  profile.treesGrown = (profile.treesGrown || 0) + 1;
  log.push(`Focus session: +${minutes} min, +${xp} XP, 1 tree planted 🌳`);
  bumpStreak(profile);
  const newBadges = checkBadges(profile, { focusMinutes: minutes, studied: true });
  for (const b of newBadges) log.push(`Badge unlocked: ${b.icon} ${b.name}`);
  return { xp, newBadges, log };
}

function dailyProgress(profile, goal) {
  const tk = todayKey();
  const earned = (profile.todayXP || {})[tk] || 0;
  const g = goal || profile.dailyGoal || DAILY_GOAL_DEFAULT;
  return { earned, goal: g, pct: Math.min(100, Math.round((earned / g) * 100)) };
}

function balanceCheck(profile, mode = "balanced") {
  const tk = todayKey();
  const earned = (profile.todayXP || {})[tk] || 0;
  const cap = mode === "strict" ? 120 : mode === "relaxed" ? 400 : 200;
  if (earned >= cap) {
    return {
      warn: true,
      message:
        mode === "strict"
          ? "You've done a lot today. Take a real break — close the app and stretch."
          : "Great work today! Consider stopping here to keep learning healthy.",
    };
  }
  return { warn: false };
}

function recommendNext(profile) {
  const done = new Set(profile.lessonsCompleted || []);
  for (const subject of CURRICULUM) {
    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        if (!done.has(lesson.id)) {
          return { ...lesson, subjectId: subject.id, subjectName: subject.name, color: subject.color, chapterTitle: chapter.title };
        }
      }
    }
  }
  return null;
}

const Engine = {
  BADGES,
  XP_PER_CORRECT,
  XP_PER_LESSON,
  XP_PERFECT_BONUS,
  DAILY_GOAL_DEFAULT,
  levelFromXP,
  xpForNextLevel,
  todayKey,
  bumpStreak,
  checkBadges,
  processLessonComplete,
  processFocusComplete,
  dailyProgress,
  balanceCheck,
  recommendNext,
};

export {
  Engine,
  BADGES,
  XP_PER_CORRECT,
  XP_PER_LESSON,
  XP_PERFECT_BONUS,
  DAILY_GOAL_DEFAULT,
  levelFromXP,
  xpForNextLevel,
  todayKey,
  bumpStreak,
  checkBadges,
  processLessonComplete,
  processFocusComplete,
  dailyProgress,
  balanceCheck,
  recommendNext,
};

if (typeof window !== "undefined") {
  window.Engine = Engine;
}
