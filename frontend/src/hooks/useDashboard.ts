// ============================================================
// academia.io - useDashboard Hook
// ============================================================
// Fetches and caches the full dashboard data (gamification
// stats, badges, recent activity, notifications).
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { engine, stats } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useDashboard() {
  const { isAuthenticated } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [dash, sum, wk] = await Promise.all([
        engine.dashboard(),
        stats.summary(),
        stats.weekly(),
      ]);
      setDashboard(dash);
      setSummary(sum);
      setWeekly(wk);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { dashboard, summary, weekly, loading, error, refresh };
}
