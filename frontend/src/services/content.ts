// ============================================================
// academia.io - Content & Subject Management API
// ============================================================

import { getToken } from "./api";

const API_BASE = "/api";

async function request(endpoint: string, options: any = {}) {
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Request failed");
  return data.data;
}

// ── Subjects ────────────────────────────────────────────
export function listSubjects() {
  return request("/content/subjects");
}

export function createSubject(data) {
  return request("/content/subjects", { method: "POST", body: JSON.stringify(data) });
}

export function updateSubject(id, data) {
  return request(`/content/subjects/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteSubject(id) {
  return request(`/content/subjects/${id}`, { method: "DELETE" });
}

// ── Chapters & Lessons ──────────────────────────────────
export function createChapter(data) {
  return request("/content/chapters", { method: "POST", body: JSON.stringify(data) });
}

export function createLesson(data) {
  return request("/content/lessons", { method: "POST", body: JSON.stringify(data) });
}

export function updateLesson(id, data) {
  return request(`/content/lessons/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

// ── File Upload ─────────────────────────────────────────
export function uploadFile(file, title, lessonId) {
  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);
  if (lessonId) form.append("lessonId", lessonId);
  return request("/content/upload", { method: "POST", body: form });
}

export function listUploads() {
  return request("/content/uploads");
}

// ── Excel Quiz Import ──────────────────────────────────
export function importQuiz(lessonId, file) {
  const form = new FormData();
  form.append("file", file);
  return request(`/content/import-quiz/${lessonId}`, { method: "POST", body: form });
}

// ── Interaction Logging (ML data) ──────────────────────
export function logInteraction(kind, metadata = {}, sessionId) {
  return request("/content/interact", {
    method: "POST",
    body: JSON.stringify({ kind, metadata, sessionId }),
  });
}

export default { listSubjects, createSubject, updateSubject, deleteSubject,
  createChapter, createLesson, updateLesson,
  uploadFile, listUploads, importQuiz, logInteraction };
