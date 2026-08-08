// ============================================================
// academia.io - API Client
// ============================================================
// Centralized fetch wrapper with JWT token management.
// All API calls go through this module.
// ============================================================

const API_BASE = "/api";

let _token = localStorage.getItem("aio_token") || null;
let _refreshHandlers = [];

/**
 * Get the current JWT token
 */
export function getToken() {
  return _token;
}

/**
 * Subscribe to auth state changes (login/logout)
 */
export function onAuthChange(handler) {
  _refreshHandlers.push(handler);
  return () => {
    _refreshHandlers = _refreshHandlers.filter((h) => h !== handler);
  };
}

function notify() {
  _refreshHandlers.forEach((h) => h());
}

/**
 * Store JWT token (both in memory and localStorage)
 */
export function setToken(token) {
  _token = token;
  if (token) {
    localStorage.setItem("aio_token", token);
  } else {
    localStorage.removeItem("aio_token");
  }
  notify();
}

/**
 * Core fetch wrapper - adds auth header, handles errors
 */
async function request(endpoint, options: any = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (_token) {
    headers["Authorization"] = `Bearer ${_token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!data.success) {
    // If 401 (unauthorized), clear token
    if (res.status === 401) {
      setToken(null);
    }
    throw new Error(data.error || "Request failed");
  }

  return data.data;
}

// ── Auth API ────────────────────────────────────────────────

export const auth = {
  login(email, password) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register(data) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  me() {
    return request("/auth/me");
  },

  schools() {
    return request("/auth/schools");
  },
};

// ── Engine API ──────────────────────────────────────────────

export const engine = {
  dashboard() {
    return request("/engine/dashboard");
  },

  completeLesson(lessonId, score, total, subjectId, xpMultiplier = 1, comboMax = 0) {
    return request("/engine/lesson/complete", {
      method: "POST",
      body: JSON.stringify({ lessonId, score, total, subjectId, xpMultiplier, comboMax }),
    });
  },

  completeFocus(minutes) {
    return request("/engine/focus/complete", {
      method: "POST",
      body: JSON.stringify({ minutes }),
    });
  },

  badges() {
    return request("/engine/badges");
  },
};

// ── Curriculum API ──────────────────────────────────────────

export const curriculum = {
  getAll() {
    return request("/curriculum");
  },

  getLesson(lessonId) {
    return request(`/curriculum/lesson/${lessonId}`);
  },

  getProgress() {
    return request("/curriculum/progress");
  },

  getUserProgress(userId) {
    return request(`/curriculum/progress/${userId}`);
  },
};

export const content = {
  createSubject(data) {
    return request("/content/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  createChapter(data) {
    return request("/content/chapters", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  createLesson(data) {
    return request("/content/lessons", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ── Stats API ───────────────────────────────────────────────

export const stats = {
  summary() {
    return request("/stats/summary");
  },

  weekly() {
    return request("/stats/weekly");
  },

  mlInsights() {
    return request("/analytics/ml-insights");
  },

  leaderboard(schoolId, limit = 20) {
    const params = new URLSearchParams();
    if (schoolId) params.set("schoolId", schoolId);
    params.set("limit", limit.toString());
    return request(`/stats/leaderboard?${params}`);
  },

  classPerformance(schoolId) {
    return request(`/stats/class?schoolId=${schoolId}`);
  },

  heatmap(days = 30) {
    return request(`/stats/heatmap?days=${days}`);
  },
};

// ── Chatbot API ─────────────────────────────────────────────

export const chatbot = {
  send(message) {
    return request("/chatbot/message", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  history(limit = 20) {
    return request(`/chatbot/history?limit=${limit}`);
  },
};

// ── Admin API ────────────────────────────────────────────────

export const admin = {
  rules() {
    return request("/admin/rules");
  },

  listUsers(filters: any = {}) {
    const params = new URLSearchParams();
    if (filters.role) params.set("role", filters.role);
    if (filters.schoolId) params.set("schoolId", filters.schoolId);
    const qs = params.toString();
    return request(`/admin/users${qs ? "?" + qs : ""}`);
  },

  createUser(data) {
    return request("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ── Health Check ────────────────────────────────────────────

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  const data = await res.json();
  return data;
}

export default { auth, engine, curriculum, content, stats, chatbot, healthCheck, getToken, setToken, onAuthChange };
