import { getToken } from "./api";
const API_BASE = "/api";

async function request(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  const d = await res.json();
  if (!d.success) throw new Error(d.error);
  return d.data;
}

export function getPerformance() { return request("/analytics/performance"); }
export function getSummaries() { return request("/analytics/summaries"); }
export function getMlInsights() { return request("/analytics/ml-insights"); }
export default { getPerformance, getSummaries, getMlInsights };
