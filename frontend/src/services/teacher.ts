// ============================================================
// academia.io — Teacher API Client
// ============================================================

import { getToken } from "./api";

const API_BASE = "/api";

async function request(endpoint: string, options: any = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Request failed");
  return data.data;
}

export function listLessons(subjectId) {
  const params = subjectId ? `?subjectId=${subjectId}` : "";
  return request(`/teacher/lessons${params}`);
}

export function createQuiz(lessonId, questions) {
  return request("/teacher/quizzes", {
    method: "POST",
    body: JSON.stringify({ lessonId, questions }),
  });
}

export function getLessonProgress(lessonId) {
  return request(`/teacher/progress/${lessonId}`);
}

export function getClassOverview() {
  return request("/teacher/class-overview");
}

export function getClassClusters(classId) {
  return request(`/analytics/class-clusters?classId=${classId}`);
}

export function listAssignments() {
  return request("/teacher/assignments");
}

export function createAssignment(classId, lessonId, dueAt, note) {
  return request("/teacher/assignments", {
    method: "POST",
    body: JSON.stringify({ classId, lessonId, dueAt, note }),
  });
}

export function deleteAssignment(id) {
  return request(`/teacher/assignments/${id}`, {
    method: "DELETE",
  });
}

export default {
  listLessons,
  createQuiz,
  getLessonProgress,
  getClassOverview,
  getClassClusters,
  listAssignments,
  createAssignment,
  deleteAssignment,
};
