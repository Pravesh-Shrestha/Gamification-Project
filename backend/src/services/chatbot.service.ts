// Dialog and search companion for student support.
// Handles retrieval of statistics, lesson reviews, and encouragement.

import { prisma } from "../lib/prisma.js";
import { levelFromXP } from "./engagement.service.js";
import { predictStudentPerformance } from "./ml.service.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// ── Types ─────────────────────────────────────────────────
interface Pattern {
  triggers: RegExp[];
  response: (user: any, match?: RegExpMatchArray) => string | Promise<string> | null | Promise<string | null>;
}

// ── Helper: fetch all subjects/chapters/lessons for search ──
async function searchCurriculum(query: string) {
  const lessons = await prisma.lesson.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { id: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      chapter: { include: { subject: true } },
    },
    take: 5,
  });

  if (lessons.length > 0) return lessons;

  // Try searching chapter names
  const chapters = await prisma.chapter.findMany({
    where: { title: { contains: query, mode: "insensitive" } },
    include: {
      subject: true,
      lessons: { take: 3 },
    },
    take: 3,
  });

  if (chapters.length > 0) {
    return chapters.flatMap(ch =>
      ch.lessons.map(l => ({
        ...l,
        chapter: { title: ch.title, subject: ch.subject },
      }))
    );
  }

  // Try searching subject names
  const subjects = await prisma.subject.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    include: {
      chapters: { include: { lessons: { take: 3 } } },
    },
    take: 2,
  });

  return subjects.flatMap(s =>
    s.chapters.flatMap(ch =>
      ch.lessons.map(l => ({
        ...l,
        chapter: { title: ch.title, subject: s },
      }))
    )
  );
}

// ── Helper: extract concept explanation from lesson slides ──
async function explainFromSlides(topic: string): Promise<string | null> {
  const lessons = await prisma.lesson.findMany({
    take: 5,
    include: {
      chapter: { include: { subject: true } },
    },
  });

  // Score lessons by relevance
  const scored = lessons.map(l => {
    const text = [l.title, l.chapter.title, l.chapter.subject.name, JSON.stringify(l.slides)].join(" ").toLowerCase();
    const words = topic.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const score = words.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0);
    return { lesson: l, score };
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const best = scored[0].lesson;
  let slidesArray: any[] = [];
  try { slidesArray = JSON.parse(best.slides as string) || []; } catch { slidesArray = []; }
  const subject = best.chapter.subject.name;
  const chapterTitle = best.chapter.title;

  // Collect explanation text from slides
  const explanations = slidesArray
    .filter((s: any) => s.kind === "content" || s.kind === "explanation")
    .map((s: any) => s.content || s.text || "")
    .filter(Boolean);

  if (explanations.length === 0) {
    // Return lesson info with key points from all slides
    const keyPoints = slidesArray
      .map((s: any) => s.title || s.heading || "")
      .filter(Boolean);

    return [
      `📚 **${best.title}** (${subject} · ${chapterTitle})`,
      "",
      keyPoints.length > 0 ? keyPoints.map(p => `• ${p}`).join("\n") : `I found a lesson about "${topic}" — go to the **Learn** section and open "${best.title}" to see the full explanation!`,
      "",
      `⏱ ${best.mins} min · Ready when you are!`,
    ].join("\n");
  }

  return [
    `📚 **${best.title}** (${subject} · ${chapterTitle})`,
    "",
    explanations.slice(0, 3).join("\n\n"),
    "",
    `⏱ ${best.mins} min · Want me to explain more? Just ask!`,
  ].join("\n");
}

// ── Helper: get today's real-time activity ─────────────────
async function getTodayActivity(user: any) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayLessons = await prisma.lessonProgress.count({
    where: { userId: user.id, completedAt: { gte: todayStart } },
  });

  // Parse todayXP from User model (stored as JSON string)
  let xpToday = 0;
  try {
    const xpMap = JSON.parse(user.todayXp || "{}");
    xpToday = xpMap[todayKey()] || 0;
  } catch { /* ignore */ }

  return {
    lessonsToday: todayLessons,
    xpToday,
  };
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Helper: get leaderboard position ──────────────────────
async function getLeaderboardPosition(user: any) {
  const students = await prisma.user.findMany({
    where: { schoolId: user.schoolId, role: "student" },
    orderBy: { xp: "desc" },
    select: { id: true, name: true, xp: true },
  });

  const rank = students.findIndex(s => s.id === user.id) + 1;
  const total = students.length;
  return { rank, total, topStudent: students[0] };
}

// ── Helper: get weekly stats ──────────────────────────────
async function getWeeklyStats(userId: string) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const progress = await prisma.lessonProgress.findMany({
    where: { userId, completedAt: { gte: weekAgo } },
    include: { lesson: { include: { chapter: { include: { subject: true } } } } },
    orderBy: { completedAt: "desc" },
  });

  return progress;
}

// ── Helper: get weakest subject ───────────────────────────
async function getWeakestSubject(userId: string) {
  const progress = await prisma.lessonProgress.findMany({
    where: { userId },
    include: { lesson: { include: { chapter: { include: { subject: true } } } } },
  });

  const bySubject: Record<string, { correct: number; total: number; lessonsDone: number }> = {};
  for (const p of progress) {
    const subj = p.lesson.chapter.subject.name;
    if (!bySubject[subj]) bySubject[subj] = { correct: 0, total: 0, lessonsDone: 0 };
    bySubject[subj].total += p.total || 0;
    bySubject[subj].correct += p.score || 0;
    bySubject[subj].lessonsDone += 1;
  }

  const entries = Object.entries(bySubject)
    .map(([name, data]) => ({
      name,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      lessonsDone: data.lessonsDone,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  return entries;
}

// ── Helper: get available badges with status ──────────────
async function getAllBadgesWithStatus(userId: string) {
  const allBadges = await prisma.badge.findMany();
  const earned = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  });
  const earnedIds = new Set(earned.map(e => e.badgeId));

  return allBadges.map(b => ({
    ...b,
    earned: earnedIds.has(b.id),
  }));
}

// ============================================================
// ── RESPONSE PATTERNS ─────────────────────────────────────
// ============================================================

const patterns: Pattern[] = [
  // ── Greetings ─────────────────────────────────────────
  {
    triggers: [/^(hi|hello|hey|hola|namaste|namaskar|wassup)\b/i],
    response: (user) => {
      const hour = new Date().getHours();
      const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
      return `${timeGreeting}, ${user.name}! 👋 I'm your study companion. Ask me about:\n• 📚 **Lessons & concepts** — "Explain fractions"\n• ⭐ **Your stats** — "How am I doing?"\n• 🏆 **Leaderboard** — "What's my rank?"\n• 💡 **Study tips** — "Help me focus"\n• 🎯 **Recommendations** — "What should I study?"`;
    },
  },

  // ── How are you ───────────────────────────────────────
  {
    triggers: [/how are you/i, /how('s| is) it going/i, /what'?s up/i],
    response: () => "I'm doing great, ready to help you learn! 🚀 How are your studies going today?",
  },

  // ── Name / who are you ────────────────────────────────
  {
    triggers: [/who are you|what (are|is) you|your name/i],
    response: () => "I'm **Academia Companion** — your study partner! 📚 I'm here to help you understand lessons, track your progress, earn XP, and stay motivated. Ask me anything about your studies!",
  },

  // ── XP & Earning Points ───────────────────────────────
  {
    triggers: [/\bxp\b|experience points|how (do|can) i (earn|get) (xp|points|more)/i],
    response: async (user) => {
      const level = levelFromXP(user.xp);
      const nextLevel = 50 * level * (level + 1) / 2;
      const remaining = nextLevel - user.xp;
      const todayActivity = await getTodayActivity(user);

      return [
        `⭐ **${user.xp} XP** — Level ${level}`,
        `📊 **${remaining} XP** to Level ${level + 1}`,
        `📅 **Today:** ${todayActivity.lessonsToday} lessons, ${todayActivity.xpToday} XP earned`,
        "",
        "**🎯 Ways to earn XP:**",
        "• Complete a lesson: **+50 XP** base",
        "• Correct quiz answers: **+10 XP each**",
        "• Perfect quiz bonus: **+25 XP**",
        "• Streak (5+ days): **+10 XP per lesson**",
        "• Focus session: **+2 XP per minute**",
        "• Daily quests: **bonus XP**",
        "",
        "💡 *Try the Focus mode for passive XP!*",
      ].join("\n");
    },
  },

  // ── Streak ────────────────────────────────────────────
  {
    triggers: [/streak|daily streak|how many days|on fire|chain/i],
    response: async (user) => {
      if (user.streak === 0) {
        return "You don't have an active streak yet. 🔥\nComplete **one lesson today** to start your streak! Even 5 minutes counts!";
      }
      const advice = user.streak >= 7
        ? "🏆 **Incredible!** You're on fire! Keep the momentum going!"
        : user.streak >= 3
          ? "💪 **Great work!** Almost to a full week!"
          : "🌟 **Nice start!** Reach 3 days for the 'On a Roll' badge!";

      const bonus = user.streak >= 5 ? "✅ You're earning **streak bonus XP** (+10 per lesson)!" : "🔒 Unlock **streak bonus XP** at 5 days!";

      return `🔥 **${user.streak}-day streak!**\n${advice}\n${bonus}\n\n📅 Do **1 lesson today** to keep it alive!`;
    },
  },

  // ── Badges / Achievements ─────────────────────────────
  {
    triggers: [/badge|badges|achievements|medal|accomplishment/i],
    response: async (user) => {
      const badges = await getAllBadgesWithStatus(user.id);
      const earned = badges.filter(b => b.earned);

      if (earned.length === 0) {
        return [
          "🏅 **You haven't earned any badges yet!**",
          "",
          "Here are badges you can unlock:",
          ...badges.map(b => `  ${b.icon} **${b.name}** — ${b.desc}`),
          "",
          "💡 *Complete lessons and build streaks to earn them!*",
        ].join("\n");
      }

      return [
        `🏅 **${earned.length} badge${earned.length > 1 ? "s" : ""}** earned!`,
        "",
        ...earned.map(b => `  ✅ ${b.icon} **${b.name}** — ${b.desc}`),
        "",
        "**Still available:**",
        ...badges.filter(b => !b.earned).map(b => `  ${b.icon} **${b.name}** — ${b.desc}`),
        "",
        "Keep learning to collect them all! 🎯",
      ].join("\n");
    },
  },

  // ── Level ─────────────────────────────────────────────
  {
    triggers: [/level|what level|my level/i],
    response: (user) => {
      const level = levelFromXP(user.xp);
      const next = 50 * level * (level + 1) / 2;
      const prev = level === 1 ? 0 : 50 * (level - 1) * level / 2;
      const progress = Math.round(((user.xp - prev) / (next - prev)) * 100);

      return [
        `⭐ **Level ${level}**`,
        `📊 Progress: **${progress}%** (${user.xp - prev}/${next - prev} XP)`,
        "",
        "**Level rewards:**",
        "• Each level = **new cosmetic unlock** 🎨",
        "• Higher level = **class leaderboard boost** 🏆",
        "• Keep learning to level up faster! 🚀",
      ].join("\n");
    },
  },

  // ── Leaderboard / Rank ────────────────────────────────
  {
    triggers: [/leaderboard|rank|ranking|how (am i )?rank(ed|ing)|position/i],
    response: async (user) => {
      const { rank, total, topStudent } = await getLeaderboardPosition(user);

      return [
        `🏆 **Class Leaderboard**`,
        `Your rank: **#${rank}** of ${total} students`,
        rank === 1 ? "🎉 **You're #1!** Amazing work!" : rank <= 3
          ? `🥉 You're in the **top 3**! Keep pushing!`
          : rank <= total * 0.25
            ? `👏 **Top 25%** — great job!`
            : `📈 You can climb higher! Complete lessons to earn XP.`,
        "",
        `🥇 Class leader: **${topStudent.name}** (${topStudent.xp.toLocaleString()} XP)`,
        rank > 1 ? `📊 You need **${topStudent.xp - user.xp} more XP** to reach #1!` : "",
        "",
        "💡 *Every lesson counts toward your rank!*",
      ].join("\n");
    },
  },

  // ── Progress Summary (enhanced) ───────────────────────
  {
    triggers: [/progress|summary|how am i doing|my stats|performance|overview|dashboard/i],
    response: async (user) => {
      const badges = await prisma.userBadge.count({ where: { userId: user.id } });
      const lessonsCompleted = await prisma.lessonProgress.count({ where: { userId: user.id } });
      const level = levelFromXP(user.xp);
      const { rank, total } = await getLeaderboardPosition(user);
      const todayActivity = await getTodayActivity(user);
      const weeklyStats = await getWeeklyStats(user.id);

      return [
        `📊 **${user.name}'s Learning Dashboard**`,
        "",
        "**🎮 Stats**",
        `• ⭐ Level ${level} · ${user.xp.toLocaleString()} XP`,
        `• 🔥 ${user.streak}-day streak`,
        `• 🏅 ${badges} badges · ${user.perfectQuizzes} perfect quizzes`,
        "",
        "**📚 Activity**",
        `• 📖 ${lessonsCompleted} lessons completed`,
        `• 🌳 ${user.focusMinutes} focus minutes · ${user.treesGrown} trees grown`,
        `• 📅 Today: ${todayActivity.lessonsToday} lessons, ${todayActivity.xpToday} XP`,
        `• 📈 Weekly: ${weeklyStats.length} lessons this week`,
        "",
        `**🏆 Class rank: #${rank}** of ${total} students`,
        "",
        `**🎯 Next milestone:** ${level < 10 ? `Level ${level + 1} ⭐` : "Keep maintaining your progress!"}`,
        "",
        "💡 *Ask me for study recommendations or concept help!*",
      ].join("\n");
    },
  },

  // ── Today's Activity ──────────────────────────────────
  {
    triggers: [/today|what (have|did) i (done|learn|complete) today|my day|daily activity/i],
    response: async (user) => {
      const todayActivity = await getTodayActivity(user);
      const weeklyStats = await getWeeklyStats(user.id);
      const todayLessons = weeklyStats.filter(l => {
        const d = new Date(l.completedAt);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      });

      if (todayLessons.length === 0) {
        return [
          `📅 **${user.name}'s Day**`,
          "",
          "You haven't done any lessons today yet!",
          "Here's a quick plan:",
          "• 📖 Complete **1 lesson** to keep your streak",
          "• 🎯 Try a **focus session** for bonus XP",
          "• ⚡ Check your **daily quests**",
          "",
          "Every small step counts! 🚀",
        ].join("\n");
      }

      return [
        `📅 **Today's Activity**`,
        `• 📖 ${todayLessons.length} lesson${todayLessons.length > 1 ? "s" : ""} completed`,
        `• ⭐ ${todayActivity.xpToday} XP earned today`,
        "",
        "**Recent:**",
        ...todayLessons.slice(0, 5).map(l =>
          `  ✅ **${l.lesson.title}** — ${l.score}/${l.total} ${l.perfect ? "💎" : ""}`
        ),
        "",
        "Great work! Keep it up! 🔥",
      ].join("\n");
    },
  },

  // ── Weekly Stats ──────────────────────────────────────
  {
    triggers: [/week|weekly|this week|last 7 days|past week/i],
    response: async (user) => {
      const weeklyStats = await getWeeklyStats(user.id);
      const totalScore = weeklyStats.reduce((a, l) => a + (l.score || 0), 0);
      const totalQ = weeklyStats.reduce((a, l) => a + (l.total || 0), 0);

      return [
        `📆 **This Week's Summary**`,
        `• 📖 ${weeklyStats.length} lessons completed`,
        `• ✅ ${totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0}% average accuracy`,
        `• 💎 ${weeklyStats.filter(l => l.perfect).length} perfect quizzes`,
        "",
        weeklyStats.length > 0
          ? ["**Completed lessons:**", ...weeklyStats.slice(0, 8).map(l =>
              `  ${l.perfect ? "💎" : "✅"} **${l.lesson.title}** — ${l.score}/${l.total}`
            )].join("\n")
          : "No lessons completed this week yet. Start one today! 📚",
        "",
        weeklyStats.length >= 5
          ? "🔥 **Consistent week!** Keep the momentum going!"
          : "💪 Try to complete at least 5 lessons this week!",
      ].join("\n");
    },
  },

  // ── Weak Areas / Subject Performance ──────────────────
  {
    triggers: [/weak|struggl|difficult|worst|lowest score|need help|improve/i],
    response: async (user) => {
      const subjects = await getWeakestSubject(user.id);

      if (subjects.length === 0) {
        return "You haven't completed enough lessons for me to analyze your weak areas. Start some lessons and I'll help you improve! 📚";
      }

      const weakest = subjects[0];

      return [
        "📊 **Your Performance by Subject**",
        "",
        ...subjects.map(s =>
          `  ${s.accuracy >= 80 ? "✅" : s.accuracy >= 50 ? "⚠️" : "🔴"} **${s.name}**: ${s.accuracy}% accuracy (${s.lessonsDone} lessons)`
        ),
        "",
        weakest.accuracy < 80
          ? `🎯 **Focus area: ${weakest.name}** (${weakest.accuracy}% accuracy)`
          : "🌟 **You're doing well across all subjects!**",
        "",
        "💡 *Try re-taking lessons in your weak areas to improve!*",
      ].join("\n");
    },
  },

  // ── Study Recommendations ─────────────────────────────
  {
    triggers: [/recommend|what should (i|we) (study|learn|do|focus)|suggest|next lesson/i],
    response: async (user) => {
      const allProgress = await prisma.lessonProgress.findMany({
        where: { userId: user.id },
        select: { lessonId: true },
      });
      const completedIds = new Set(allProgress.map(p => p.lessonId));

      const subjects = await getWeakestSubject(user.id);
      const weakestSubject = subjects[0];

      // Find incomplete lessons
      const allLessons = await prisma.lesson.findMany({
        take: 20,
        include: { chapter: { include: { subject: true } } },
      });

      const incomplete = allLessons.filter(l => !completedIds.has(l.id));
      const weakSubjectLessons = incomplete.filter(l =>
        l.chapter.subject.name === weakestSubject?.name
      );

      const recs = weakSubjectLessons.length > 0
        ? weakSubjectLessons.slice(0, 3)
        : incomplete.slice(0, 3);

      if (recs.length === 0) {
        return "You've completed all available lessons! 🎉 Amazing work! Check back when new content is added.";
      }

      return [
        "🎯 **Personalized Study Recommendations**",
        "",
        weakestSubject && weakestSubject.accuracy < 80
          ? `📌 **Priority:** Improve **${weakestSubject.name}** (${weakestSubject.accuracy}% accuracy)`
          : "📌 Keep exploring new subjects!",
        "",
        "**Next lessons to try:**",
        ...recs.map((l, i) =>
          `  ${i + 1}. 📖 **${l.title}** (${l.chapter.subject.name} · ${l.chapter.title}) — ${l.mins} min`
        ),
        "",
        "💡 *Start with the first one to build momentum!*",
      ].join("\n");
    },
  },

  // ── Lesson Help (existing improved) ───────────────────
  {
    triggers: [/help (me )?(with|understand|learn|study) (.+)/i, /(teach|guide) (me about )?(.+)/i],
    response: async (user, match) => {
      const topic = (match?.[3] || match?.[match?.length - 1] || "").trim();
      if (!topic) return "What would you like help with? Try: *\"Help me with fractions\"* 📚";

      const explanation = await explainFromSlides(topic);
      if (explanation) return explanation;

      const lessons = await searchCurriculum(topic);
      if (lessons.length === 0) {
        return [
          `I couldn't find a lesson about "${topic}". 🤔`,
          "Try asking about: fractions, algebra, plants, forces, grammar, vocabulary, computers, geography, or history!",
        ].join("\n");
      }

      return [
        `📚 **Lessons about "${topic}"**`,
        "",
        ...lessons.map(l => `• **${l.title}** (${(l as any).chapter?.subject?.name || ""}) — ${l.mins} min`),
        "",
        "Go to **Learn** to start one! Want me to explain a specific concept?",
      ].join("\n");
    },
  },

  // ── Quiz / Test Help ──────────────────────────────────
  {
    triggers: [/quiz|test|exam|practice|question|mcq/i],
    response: async (user) => {
      const progress = await prisma.lessonProgress.findMany({
        where: { userId: user.id },
        orderBy: { completedAt: "desc" },
        take: 10,
        include: { lesson: { include: { chapter: { include: { subject: true } } } } },
      });

      const perfectCount = progress.filter(p => p.perfect).length;
      const totalScore = progress.reduce((a, p) => a + (p.score || 0), 0);
      const totalQ = progress.reduce((a, p) => a + (p.total || 0), 0);

      return [
        "📝 **Quiz Performance**",
        "",
        progress.length > 0
          ? [
              `• 📊 **${progress.length} quizzes** attempted`,
              `• ✅ **${totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0}%** average accuracy`,
              `• 💎 **${perfectCount} perfect** quizzes`,
              `• 🎯 **${user.perfectQuizzes}** lifetime perfect scores`,
            ].join("\n")
          : "You haven't attempted any quizzes yet! Complete a lesson to try one.",
        "",
        "💡 *Tip: Read each question carefully. You can retry lessons anytime!*",
      ].join("\n");
    },
  },

  // ── Motivation (enhanced) ─────────────────────────────
  {
    triggers: [/motivat|encourage|inspire|tired|bored|demotivat|cheer|lazy/i],
    response: (user) => {
      const quotes = [
        `🌟 **${user.name}**, you've already earned **${user.xp.toLocaleString()} XP**! Think how far you've come — keep going! 🚀`,
        `💪 **You can do this!** Every expert was once a beginner. One lesson at a time!`,
        `📚 **Small steps = big results.** Just 15 minutes of learning today builds tomorrow's success!`,
        `🔥 Your **${user.streak > 0 ? `${user.streak}-day streak` : "learning journey"}** proves you have what it takes!`,
        `🎯 **Remember your goals!** Every lesson gets you closer to mastery. You've got this!`,
        `🌱 **Growth mindset:** You don't have to be perfect, you just have to keep trying!`,
        `⭐ **You are capable of amazing things!** Start a lesson and prove it to yourself!`,
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    },
  },

  // ── Focus / Timer ─────────────────────────────────────
  {
    triggers: [/focus|pomodoro|timer|concentrat|distract/i],
    response: (user) => {
      return [
        "🎯 **Focus Mode** helps you concentrate!",
        "",
        "• ⏱ **25-minute** focus session with tree growing 🌱",
        "• 🌳 Watch your tree grow — leave = it withers",
        "• ⭐ Earn **2 XP per minute** of focus",
        "• 🏅 Unlock **Focused Mind** badge at 25 min",
        `• 🌲 You've grown **${user.treesGrown} trees** so far!`,
        "",
        "Go to the **Focus** tab to start growing your forest!",
      ].join("\n");
    },
  },

  // ── Daily Goal ────────────────────────────────────────
  {
    triggers: [/daily goal|today'?s goal|what should i (do|achieve) today/i],
    response: async (user) => {
      const todayActivity = await getTodayActivity(user);
      const remaining = Math.max(0, (user.dailyGoal || 50) - todayActivity.xpToday);

      return [
        "🎯 **Today's Learning Plan**",
        "",
        `• ⭐ Daily goal: **${user.dailyGoal || 50} XP**`,
        `• ✅ Earned today: **${todayActivity.xpToday} XP**`,
        remaining > 0 ? `• 📊 **${remaining} XP** remaining to reach goal` : "• 🎉 **Goal reached!** Amazing!",
        `• 📖 **${todayActivity.lessonsToday}** lessons complete today`,
        "",
        remaining > 0
          ? "💡 *A quick 5-min lesson or focus session will help close the gap!*"
          : "🌟 *Try exceeding your goal for extra rewards!*",
      ].join("\n");
    },
  },

  // ── Concept / Lesson Explanation (after specific feature queries like rank/streak/badges) ──
  {
    triggers: [/^explain\b|^what is\b|^what are\b|^define\b|^meaning\b|^how (does|do|can|to)\b|^tell me about\b|^describe\b/i],
    response: async (user, match) => {
      const msg = match?.input || "";
      const topic = msg
        .replace(/^(explain|what is|what are|define|meaning of|meaning|tell me about|describe|how (does|do|can|to) )/i, "")
        .replace(/[?]+$/g, "")
        .trim();

      // Skip system-related queries that have their own patterns
      if (/^(my (rank|streak|level|progress|stats|badge|badges|class|school|teacher)|rank |leaderboard|streak|class|school)/i.test(topic)) return null;

      if (!topic || topic.length < 2) {
        return "What concept would you like me to explain? Try: *\"Explain fractions\"*, *\"What is photosynthesis?\"*, or *\"Tell me about algebra\"* 📚";
      }

      const explanation = await explainFromSlides(topic);
      if (explanation) return explanation;

      const curriculum = await searchCurriculum(topic);
      if (curriculum.length > 0) {
        return [
          `📚 **Search results for "${topic}"**`,
          "",
          ...curriculum.map(l =>
            `• **${l.title}** — ${(l as any).chapter?.subject?.name || ""} · ${(l as any).chapter?.title || ""} (${l.mins} min)`
          ),
          "",
          "Open these in the **Learn** section for full explanations with slides!",
        ].join("\n");
      }

      return [
        `I couldn't find a specific lesson about "${topic}". 🤔`,
        "",
        "Try one of these topics:",
        "• 🔢 **Fractions** — numerators, denominators, equivalents",
        "• 🔣 **Algebra** — variables, equations, expressions",
        "• 🌿 **Plants** — photosynthesis, cells, growth",
        "• ⚡ **Forces** — gravity, friction, motion",
        "• 📝 **Grammar** — tenses, punctuation, sentence structure",
        "• 📖 **Vocabulary** — word meanings, antonyms, synonyms",
        "• 💻 **Computer Basics** — hardware, software, internet",
        "• 🌍 **Geography** — continents, maps, climate",
        "• 🏛️ **History** — ancient civilizations, timelines",
      ].join("\n");
    },
  },

  // ── Study Tips ────────────────────────────────────────
  {
    triggers: [/study tip|how to study|learning tip|best way|study technique|advice/i],
    response: () => [
      "📚 **Study Tips for Better Learning**",
      "",
      "1️⃣ **Spaced repetition** — Review topics at increasing intervals",
      "2️⃣ **Active recall** — Test yourself instead of re-reading",
      "3️⃣ **Pomodoro technique** — 25 min focus, 5 min break",
      "4️⃣ **Teach someone** — Explaining a concept helps you master it",
      "5️⃣ **Stay consistent** — 15 min daily beats 3 hours weekly",
      "",
      "🎯 *Try the Focus mode to practice Pomodoro!*",
    ].join("\n"),
  },

  // ── Curriculum / Subjects overview ────────────────────
  {
    triggers: [/what (subject|topic|lesson)s? (are |do )?(available|exist|we have)|show (me )?(all )?(subject|lesson)/i, /curriculum/i],
    response: async () => {
      const subjects = await prisma.subject.findMany({
        include: {
          chapters: {
            include: { lessons: true },
          },
        },
      });

      if (subjects.length === 0) {
        return "No subjects available yet. Check back soon! 📚";
      }

      return [
        "📚 **Available Curriculum**",
        "",
        ...subjects.map(s =>
          `  ${s.icon} **${s.name}** — ${s.chapters.length} chapters, ${s.chapters.reduce((a, c) => a + c.lessons.length, 0)} lessons\n  ${s.blurb || ""}`
        ),
        "",
        "Go to the **Learn** tab to explore!",
      ].join("\n");
    },
  },

  // ── Cosmetic / Locker questions ───────────────────────
  {
    triggers: [/cosmetic|locker|avatar|skin|outfit|appearance|hat|accessory/i],
    response: () => [
      "🎨 **Cosmetics & Locker**",
      "",
      "• Unlock new cosmetics as you **level up**!",
      "• Each level grants a **new item** for your avatar",
      "• Visit the **Locker** tab to equip your favorites",
      "• Collect them all — there are **12 unique items**!",
      "",
      "💡 *Level up by completing lessons to unlock more cosmetics!*",
    ].join("\n"),
  },

  // ── Notifications ─────────────────────────────────────
  {
    triggers: [/notification|alerts|bell|notif/i],
    response: () => [
      "🔔 **Notifications** keep you updated on:",
      "",
      "• 📢 **Announcements** from your teacher",
      "• 📝 **New assignments** for your class",
      "• 🏅 **Badges** you've unlocked",
      "• 🔥 **Streak milestones**",
      "• ⭐ **Level-ups** and achievements",
      "",
      "Check the 🔔 bell icon in your top bar!",
    ].join("\n"),
  },

  // ── Class / School info ───────────────────────────────
  {
    triggers: [/class|school|my (class|school|teacher)/i],
    response: async (user) => {
      const school = await prisma.school.findUnique({ where: { id: user.schoolId } });
      const classInfo = await prisma.class.findFirst({
        where: { users: { some: { id: user.id } } },
      });

      return [
        `🏫 **${school?.name || "Your School"}**`,
        classInfo ? `📚 **Class:** ${classInfo.name} (${classInfo.grade})` : "",
        `👤 **Role:** ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`,
        "",
        "Ask me about your **class leaderboard** or **teacher assignments**!",
      ].join("\n");
    },
  },

  // ── Teacher / Assignment questions ────────────────────
  {
    triggers: [/teacher|assignment|homework|task/i],
    response: async (user) => {
      const assignments = await prisma.lessonProgress.findMany({
        where: { userId: user.id },
        orderBy: { completedAt: "desc" },
        take: 5,
        include: { lesson: true },
      });

      const recent = assignments.slice(0, 3);

      return [
        "📋 **Assignments & Recent Work**",
        "",
        recent.length > 0
          ? ["**Recently completed:**", ...recent.map(l =>
              `  ✅ **${l.lesson.title}** — ${l.score}/${l.total} ${l.perfect ? "💎" : ""}`
            )].join("\n")
          : "No assignments completed yet.",
        "",
        "📌 Check the **Learn** tab for available lessons!",
      ].join("\n");
    },
  },

  // ── Time / Schedule ───────────────────────────────────
  {
    triggers: [/time|how long|schedule|plan/i],
    response: () => [
      "⏱ **Learning Schedule Tips**",
      "",
      "• Aim for **15-30 minutes** of study per day",
      "• Best time: when you feel most alert!",
      "• **Consistency** matters more than session length",
      "• Use **Focus mode** for timed sessions",
      "",
      "💡 Even 5 minutes of a lesson keeps your streak alive!",
    ].join("\n"),
  },

  // ── Thank you ─────────────────────────────────────────
  {
    triggers: [/thank|thanks|dhanyavad|thank you/i],
    response: () => "You're welcome! 🙏 I'm always here when you need help. Keep up the amazing work! 🚀",
  },

  // ── Goodbye ───────────────────────────────────────────
  {
    triggers: [/bye|goodbye|see you|exit|logout/i],
    response: () => "Goodbye! 👋 Happy learning! Remember: **every lesson makes you smarter!** 📚 Come back anytime!",
  },
];

// ============================================================
// ── FALLBACK: Curriculum Search ────────────────────────────
// ============================================================
async function smartFallback(user: any, message: string): Promise<string> {
  // Try to find any matching lesson content
  const words = message.split(/\s+/).filter(w => w.length > 3);
  for (const word of words) {
    const explanation = await explainFromSlides(word);
    if (explanation) return explanation;
  }

  // Try curriculum search
  for (const word of words) {
    const results = await searchCurriculum(word);
    if (results.length > 0) {
      return [
        `📚 **I found these lessons related to your question:**`,
        "",
        ...results.map(l =>
          `• **${l.title}** — ${(l as any).chapter?.subject?.name || ""} (${l.mins} min)`
        ),
        "",
        `💡 *Try asking me to "explain ${words[0]}" for a detailed answer!*`,
      ].join("\n");
    }
  }

  // Generic helpful response with suggestions
  const suggestions = [
    "📊 **My stats** — 'How am I doing?'",
    "📚 **Explain concepts** — 'What is photosynthesis?'",
    "🏆 **Leaderboard** — 'What's my rank?'",
    "🎯 **Recommendations** — 'What should I study?'",
    "📅 **Today's activity** — 'What did I do today?'",
    "💪 **Motivation** — 'Motivate me!'",
  ];

  return [
    `Hi ${user.name}! I'm not sure I understand "${message.slice(0, 50)}" 🤔`,
    "",
    "Here's what I can help with:",
    ...suggestions.map(s => `  • ${s}`),
    "",
    "Try asking me something from the list above! 😊",
  ].join("\n");
}

// ============================================================
// ── GEMINI RAG INTEGRATION ─────────────────────────────────
// ============================================================
async function generateGeminiRagResponse(user: any, message: string, history: any[]): Promise<string> {
  if (!genAI) throw new Error("Gemini AI not initialized");

  // 1. Gather student context
  const level = levelFromXP(user.xp);
  const badges = await prisma.userBadge.findMany({
    where: { userId: user.id },
    include: { badge: true }
  });
  const earnedBadgeList = badges.map(b => `${b.badge.icon} ${b.badge.name} (${b.badge.desc})`).join(", ");

  const todayActivity = await getTodayActivity(user);
  const position = await getLeaderboardPosition(user);
  const performance = await getWeakestSubject(user.id);
  const weakestSubj = performance[0] ? `${performance[0].name} (${performance[0].accuracy}% accuracy)` : "None yet";

  // Fetch ML disengagement and flow zone info
  const mlPerformance = await predictStudentPerformance(user.id);

  // 2. Query curriculum context
  let curriculumContext = "";
  if (message.length > 5 && !/my rank|my streak|xp|badge|recommend|leaderboard|level/i.test(message)) {
    const matchedLessons = await searchCurriculum(message);
    if (matchedLessons.length > 0) {
      curriculumContext = "Here is some context from our curriculum:\n";
      for (const lesson of matchedLessons) {
        let slides: any[] = [];
        try { slides = JSON.parse(lesson.slides); } catch {}
        const slideText = slides
          .filter((s: any) => s.kind === "content" || s.kind === "intro" || s.kind === "tip")
          .map((s: any) => s.content || s.body || "")
          .join(" ");
        curriculumContext += `- Lesson "${lesson.title}" (${lesson.chapter.subject.name}): ${slideText.slice(0, 300)}\n`;
      }
    }
  }

  // 3. Prepare system instructions
  const lowercaseMsg = message.toLowerCase();
  const cheatingKeywords = ["give me the answer", "what is the answer to question", "solve this quiz", "correct option for", "answer key", "cheat on"];
  const asksForQuizAnswer = cheatingKeywords.some(w => lowercaseMsg.includes(w)) || 
                            (lowercaseMsg.includes("answer") && (lowercaseMsg.includes("quiz") || lowercaseMsg.includes("question") || lowercaseMsg.includes("fraction")));

  // Check if query matches database quiz content
  const allLessons = await prisma.lesson.findMany({ select: { quiz: true } });
  let matchesExactQuizQuestion = false;
  for (const lesson of allLessons) {
    let quizArray: any[] = [];
    try { quizArray = JSON.parse(lesson.quiz); } catch {}
    for (const qObj of quizArray) {
      if (qObj.q && lowercaseMsg.includes(qObj.q.toLowerCase())) {
        matchesExactQuizQuestion = true;
        break;
      }
    }
    if (matchesExactQuizQuestion) break;
  }

  let cheatPreventionDirective = "";
  if (asksForQuizAnswer || matchesExactQuizQuestion) {
    cheatPreventionDirective = `
⚠️ ACADEMIC INTEGRITY DIRECTIVE:
The student is asking for a direct answer to a quiz or exam question.
You are STRICTLY FORBIDDEN from giving the final answer, option numbers (1, 2, 3, etc.), or exact correct choice text.
Instead, you must:
1. Explain that you cannot provide answers to quiz questions.
2. Teach the underlying educational concept step-by-step.
3. Show an equivalent, simplified example to help them solve it themselves.
`;
  }

  const systemPrompt = `You are the study companion, a friendly, encouraging, and helpful learning guide for students in primary and secondary levels in Kathmandu Valley.
Your goal is to optimize their engagement, learning, and performance, based on Flow Theory (balancing challenge and skill) and Self-Determination Theory (building competence and autonomy).

The student's name is ${user.name}. They are in ${user.grade || "their class"}.
Here are their current real-time learning stats from the database:
- XP: ${user.xp} (Level ${level})
- Active Streak: ${user.streak} days
- Focus Minutes: ${user.focusMinutes} minutes (Trees grown: ${user.treesGrown})
- Today's XP earned: ${todayActivity.xpToday} XP (Daily Goal: ${user.dailyGoal} XP)
- Class Leaderboard Rank: #${position.rank} of ${position.total} students
- Weakest Subject: ${weakestSubj}
- Badges Unlocked: ${earnedBadgeList || "No badges unlocked yet."}

Here are their ML-Engine diagnostics and predictive disengagement risk profile (Flow State insights):
- Predicted Disengagement Risk: ${mlPerformance.disengagementRisk} (${mlPerformance.disengagementProb}% probability)
- Quiz Success Likelihood for next lesson: ${mlPerformance.successProbability}%
- Current Flow Zone: ${mlPerformance.flowState}
- ML Recommendation for this student: "${mlPerformance.recommendation}"

${curriculumContext ? curriculumContext : ""}

${cheatPreventionDirective}

Guidelines:
1. Explain academic concepts simply and step-by-step. Use fun examples, analogies, or kid-friendly metaphors suitable for their grade.
2. If they ask about their stats, leaderboard rank, or streak, retrieve the details above and provide coaching, motivation, and tips to improve.
3. Be supportive and encouraging. If they show frustration or anxiety (e.g. if their Current Flow Zone is "Anxiety (Over-challenged)"), adapt your tone to be extremely soothing and suggest starting a Pomodoro focus session or reviewing simpler lessons. If they are in "Boredom (Under-challenged)", encourage them to try more challenging subjects or daily quests.
4. Keep your responses formatted nicely with bold text and bullet points. Keep paragraph lengths short to avoid cognitive overload.
5. Nepal/Kathmandu references (e.g., Mount Everest, Lalitpur, local school culture) are welcomed occasionally to make the companion feel local and relatable.
6. CONTENT SAFETY: Do not answer questions containing toxic words, insults, or unsafe topics. Advise them to keep focused on learning.`;

  // 4. Construct content format for Gemini Chat API
  const contents = history.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }]
  }));

  // Append current user message
  contents.push({
    role: "user",
    parts: [{ text: message }]
  });

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const chatResult = await model.generateContent({
    contents,
    generationConfig: {
      temperature: 0.7,
    }
  });

  // Inject system prompt context directly or simulate it via system instruction
  // gemini-1.5-flash supports systemInstruction:
  const modelWithSystem = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
  });

  const chatResultWithSystem = await modelWithSystem.generateContent({
    contents,
  });

  return chatResultWithSystem.response.text();
}

// ============================================================
// ── EXPORTS ────────────────────────────────────────────────
// ============================================================

export async function getChatHistory(userId: string, limit: number = 20) {
  return prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function processMessage(userId: string, message: string) {
  // Save user message
  await prisma.chatMessage.create({
    data: { userId, role: "user", content: message },
  });

  // Local Pre-filter: Content safety check (moderation)
  const lowercaseMsg = message.toLowerCase();
  const toxicKeywords = ["abuse", "kill", "dumb", "stupid bot", "hate", "suicide", "cheat code"];
  if (toxicKeywords.some(w => lowercaseMsg.includes(w))) {
    const warningReply = "I am designed to be a safe study guide! Let's keep our chat respectful and focused on school, learning, or study skills. 📚✨";
    await prisma.chatMessage.create({
      data: { userId, role: "assistant", content: warningReply },
    });
    
    const updatedHistory = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return {
      reply: warningReply,
      history: updatedHistory.reverse().map(h => ({ role: h.role, content: h.content })),
    };
  }

  // Get user data for context-aware responses
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  // Get past history for conversational context
  const history = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  
  // Sort ascending for proper chronological context (history query returns desc)
  const orderedHistory = history.reverse();
  // Filter out the last message (which is the one we just saved)
  const pastHistory = orderedHistory.filter(h => h.content !== message);

  let reply: string | null = null;

  if (genAI) {
    try {
      reply = await generateGeminiRagResponse(user, message, pastHistory);
    } catch (e) {
      console.error("🧠 [AI CHATBOT] Gemini RAG failed, falling back to rule-based engine:", e);
    }
  }

  // Fallback to pattern-based matching if Gemini is not available or failed
  if (!reply) {
    for (const pattern of patterns) {
      for (const trigger of pattern.triggers) {
        const match = message.match(trigger);
        if (match) {
          reply = await pattern.response(user, match);
          break;
        }
      }
      if (reply) break;
    }
  }

  // Smart fallback — search curriculum, explain concepts, or suggest
  if (!reply) {
    reply = await smartFallback(user, message);
  }

  // Save assistant response
  await prisma.chatMessage.create({
    data: { userId, role: "assistant", content: reply },
  });

  // Get updated history
  const updatedHistory = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    reply,
    history: updatedHistory.reverse().map(h => ({
      role: h.role,
      content: h.content,
    })),
  };
}
