// ============================================================
// academia.io - useLeaderboard Hook
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { stats } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useLeaderboard(schoolId, limit = 20) {
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await stats.leaderboard(schoolId, limit);
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, schoolId, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, error, refresh };
}
