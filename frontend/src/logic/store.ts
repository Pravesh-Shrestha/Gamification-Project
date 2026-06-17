const KEY = "academia.io::profile::v1";
const LOG_KEY = "academia.io::eventlog::v1";

function defaultProfile() {
  return {
    name: null,
    avatar: null,
    grade: null,
    createdAt: Date.now(),
    xp: 0,
    streak: 0,
    streakDays: [],
    lastActiveDay: null,
    lessonsCompleted: [],
    perfectQuizzes: 0,
    focusMinutes: 0,
    treesGrown: 0,
    badges: [],
    todayXP: {},
    dailyGoal: 50,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProfile();
    return { ...defaultProfile(), ...JSON.parse(raw) };
  } catch (error) {
    return defaultProfile();
  }
}

function save(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch (error) {}
}

function reset() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(LOG_KEY);
}

function loadLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function appendLog(entries) {
  const log = loadLog();
  const now = Date.now();
  for (const entry of entries) log.push({ t: now, m: entry });
  while (log.length > 200) log.shift();
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

function clearLog() {
  localStorage.removeItem(LOG_KEY);
}

const Store = { load, save, reset, loadLog, appendLog, clearLog, defaultProfile };

export { Store, load, save, reset, loadLog, appendLog, clearLog, defaultProfile };

if (typeof window !== "undefined") {
  window.Store = Store;
}
