// ============================================================
// academia.io — Admin API Client (User Management)
// ============================================================
// Super Admin → creates School Admins
// Admin       → creates Teachers & Students
// Teacher     → creates Students
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

/**
 * Get creation rules for the current user's role.
 */
export function getRules() {
  return request("/admin/rules");
}

// ── Users ──────────────────────────────────────────────
export function listUsers(filters: any = {}) {
  const params = new URLSearchParams();
  if (filters.role) params.set("role", filters.role);
  if (filters.schoolId) params.set("schoolId", filters.schoolId);
  const qs = params.toString();
  return request(`/admin/users${qs ? `?${qs}` : ""}`);
}

export function createUser(data) {
  return request("/admin/users", { method: "POST", body: JSON.stringify(data) });
}

export function updateUser(id, data) {
  return request(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteUser(id) {
  return request(`/admin/users/${id}`, { method: "DELETE" });
}

// ── Schools ────────────────────────────────────────────
export function createSchool(data) {
  return request("/admin/schools", { method: "POST", body: JSON.stringify(data) });
}

export function updateSchool(id, data) {
  return request(`/admin/schools/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteSchool(id) {
  return request(`/admin/schools/${id}`, { method: "DELETE" });
}

// ── Classes ────────────────────────────────────────────
export function listClasses(schoolId) {
  const params = schoolId ? `?schoolId=${schoolId}` : "";
  return request(`/admin/classes${params}`);
}

export function createClass(data) {
  return request("/admin/classes", { method: "POST", body: JSON.stringify(data) });
}

export function updateClass(id, data) {
  return request(`/admin/classes/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteClass(id) {
  return request(`/admin/classes/${id}`, { method: "DELETE" });
}

export function resetPassword(userId) {
  return request(`/admin/reset-password/${userId}`, { method: "POST" });
}

export default { getRules, listUsers, createUser, updateUser, deleteUser, resetPassword, createSchool, updateSchool, deleteSchool, listClasses, createClass, updateClass, deleteClass };
