import { todayKey } from "./engine";

const COSMETICS = [
  { id: "frame_gold", name: "Gold Frame", kind: "frame", rarity: "rare", icon: "Medal", color: "#F59E0B" },
  { id: "frame_silver", name: "Silver Frame", kind: "frame", rarity: "common", icon: "Medal", color: "#94A3B8" },
  { id: "frame_neon", name: "Neon Frame", kind: "frame", rarity: "epic", icon: "Sparkles", color: "#EC4899" },
  { id: "frame_galaxy", name: "Galaxy Frame", kind: "frame", rarity: "epic", icon: "Sparkles", color: "#7C3AED" },
  { id: "hat_crown", name: "Crown", kind: "hat", rarity: "rare", icon: "Crown" },
  { id: "hat_party", name: "Party Hat", kind: "hat", rarity: "common", icon: "PartyPopper" },
  { id: "hat_wizard", name: "Wizard Hat", kind: "hat", rarity: "epic", icon: "Wand2" },
  { id: "pet_dragon", name: "Pet Dragon", kind: "pet", rarity: "legend", icon: "Flame" },
  { id: "pet_robot", name: "Pet Robot", kind: "pet", rarity: "rare", icon: "Bot" },
  { id: "pet_star", name: "Pet Star", kind: "pet", rarity: "common", icon: "Star" },
  { id: "title_genius", name: "“Genius” title", kind: "title", rarity: "rare", icon: "Brain" },
  { id: "title_wise", name: "“Wise One” title", kind: "title", rarity: "common", icon: "Bird" },
];

const RARITY_WEIGHTS = { common: 60, rare: 28, epic: 10, legend: 2 };
const RARITY_COLORS = { common: "#94A3B8", rare: "#3B82F6", epic: "#A855F7", legend: "#F59E0B" };

function rollLootbox(unlocked = []) {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let rarity = "common";
  for (const [k, w] of Object.entries(RARITY_WEIGHTS)) {
    if (r < w) { rarity = k; break; }
    r -= w;
  }
  const pool = COSMETICS.filter((c) => c.rarity === rarity && !unlocked.includes(c.id));
  if (pool.length === 0) {
    const fallback = COSMETICS.filter((c) => c.rarity === rarity);
    return { duplicate: true, item: fallback[Math.floor(Math.random() * fallback.length)], xpInstead: rarity === "legend" ? 100 : rarity === "epic" ? 40 : rarity === "rare" ? 20 : 10 };
  }
  return { duplicate: false, item: pool[Math.floor(Math.random() * pool.length)], xpInstead: 0 };
}

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

function todaysQuests(userId) {
  const today = todayKey();
  const seed = (today + "::" + userId).split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0x7fffffff, 7);
  const pool = QUEST_POOL.slice();
  const out = [];
  let s = seed;
  while (out.length < 3 && pool.length) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % pool.length;
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function questProgress(profile, quest) {
  const tk = todayKey();
  const todayState = (profile.questsState && profile.questsState[tk]) || {};
  return todayState[quest.id] || 0;
}

function questDone(profile, quest) {
  return questProgress(profile, quest) >= quest.goal;
}

function bumpQuest(profile, quest, by) {
  const tk = todayKey();
  profile.questsState = profile.questsState || {};
  profile.questsState[tk] = profile.questsState[tk] || {};
  const before = profile.questsState[tk][quest.id] || 0;
  if (before >= quest.goal) return { changed: false, completed: false };
  profile.questsState[tk][quest.id] = Math.min(quest.goal, before + by);
  const completed = profile.questsState[tk][quest.id] >= quest.goal && before < quest.goal;
  return { changed: true, completed };
}

function applyQuestsForLesson(profile, lessonId, perfect, subjectId, comboMax) {
  const quests = todaysQuests(profile.id || "anon");
  const completed = [];
  let bonusXp = 0;

  for (const quest of quests) {
    if (questDone(profile, quest)) continue;
    let by = 0;
    if (quest.kind === "lessons") by = 1;
    else if (quest.kind === "perfect" && perfect) by = 1;
    else if (quest.kind === "subject" && quest.subject === subjectId) by = 1;
    else if (quest.kind === "xp") by = 0;
    else if (quest.kind === "combo" && comboMax >= quest.goal) by = quest.goal;
    if (by) {
      const result = bumpQuest(profile, quest, by);
      if (result.completed) {
        bonusXp += quest.reward;
        completed.push(quest);
      }
    }
  }
  return { completed, bonusXp };
}

function applyQuestsForXp(profile, xpGain) {
  const quests = todaysQuests(profile.id || "anon");
  const completed = [];
  let bonusXp = 0;
  for (const quest of quests) {
    if (quest.kind !== "xp") continue;
    if (questDone(profile, quest)) continue;
    const result = bumpQuest(profile, quest, xpGain);
    if (result.completed) { bonusXp += quest.reward; completed.push(quest); }
  }
  return { completed, bonusXp };
}

function applyQuestsForFocus(profile, minutes) {
  const quests = todaysQuests(profile.id || "anon");
  const completed = [];
  let bonusXp = 0;
  for (const quest of quests) {
    if (quest.kind !== "focus_min") continue;
    if (questDone(profile, quest)) continue;
    const result = bumpQuest(profile, quest, minutes);
    if (result.completed) { bonusXp += quest.reward; completed.push(quest); }
  }
  return { completed, bonusXp };
}

function comboMultiplier(streak) {
  if (streak >= 5) return 3;
  if (streak === 4) return 2;
  if (streak === 3) return 1.5;
  return 1;
}

function weekKey() {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const wk = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${wk}`;
}

function ensureFreezes(profile) {
  profile.freezes = profile.freezes || { count: 0, lastWeek: null };
  if (profile.freezes.lastWeek !== weekKey()) {
    profile.freezes.count = Math.min(2, (profile.freezes.count || 0) + 1);
    profile.freezes.lastWeek = weekKey();
  }
  return profile.freezes;
}

const Gamify = {
  COSMETICS,
  RARITY_WEIGHTS,
  RARITY_COLORS,
  rollLootbox,
  QUEST_POOL,
  todaysQuests,
  questProgress,
  questDone,
  bumpQuest,
  applyQuestsForLesson,
  applyQuestsForXp,
  applyQuestsForFocus,
  comboMultiplier,
  ensureFreezes,
  weekKey,
};

export {
  Gamify,
  COSMETICS,
  RARITY_WEIGHTS,
  RARITY_COLORS,
  rollLootbox,
  QUEST_POOL,
  todaysQuests,
  questProgress,
  questDone,
  bumpQuest,
  applyQuestsForLesson,
  applyQuestsForXp,
  applyQuestsForFocus,
  comboMultiplier,
  ensureFreezes,
  weekKey,
};

if (typeof window !== "undefined") {
  window.Gamify = Gamify;
}
