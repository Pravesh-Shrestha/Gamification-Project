// ============================================================
// academia.io — Student Performance Analytics
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getPerformanceSummary,
  getLessonSummaries,
  getMLInsights,
  getClassClusters,
} from "../controllers/analytics.controller.js";

const router = Router();
router.use(authenticate);

// ── Performance Summary ──────────────────────────────────
router.get("/performance", getPerformanceSummary as any);

// ── Lesson Summaries ─────────────────────────────────────
router.get("/summaries", getLessonSummaries as any);

// ── ML Predictions / Flow State Recommender ────────────────
router.get("/ml-insights", getMLInsights as any);

// ── ML Class-wide K-Means Clustering (Teacher/Admin view) ───
router.get("/class-clusters", getClassClusters as any);

export default router;
