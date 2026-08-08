// ============================================================
// academia.io - useCurriculum Hook
// ============================================================
// Fetches the full curriculum tree with per-lesson progress,
// and provides helpers for loading individual lessons.
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { curriculum } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useCurriculum() {
  const { isAuthenticated } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [subj, prog] = await Promise.all([
        curriculum.getAll(),
        curriculum.getProgress(),
      ]);
      setSubjects(subj);
      setProgress(prog);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { subjects, progress, loading, error, refresh };
}

export function useLesson(lessonId) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    curriculum
      .getLesson(lessonId)
      .then(setLesson)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [lessonId]);

  return { lesson, loading, error };
}
