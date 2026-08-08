// ============================================================
// academia.io - Stats & Performance Routes
// ============================================================

import { Router, Response } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { AuthRequest } from "../types/index.js";
import {
  getUserSummary,
  getWeeklyStats,
  getLeaderboard,
  getClassPerformance,
  getActivityHeatmap,
} from "../services/stats.service.js";

const router = Router();

// ── User Summary ──────────────────────────────────────────
router.get("/summary", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getUserSummary(req.user!.userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Weekly Stats ──────────────────────────────────────────
router.get("/weekly", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getWeeklyStats(req.user!.userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Leaderboard ───────────────────────────────────────────
router.get("/leaderboard", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const schoolId = req.query.schoolId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const leaderboard = await getLeaderboard(schoolId, limit);
    res.json({ success: true, data: leaderboard });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Class Performance (Teacher/Admin) ─────────────────────
router.get("/class", authenticate, requireRole("teacher", "admin", "super_admin"), async (req: AuthRequest, res: Response) => {
  try {
    const schoolId = req.query.schoolId as string || req.user!.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: "School ID required" });
      return;
    }
    const performance = await getClassPerformance(schoolId);
    res.json({ success: true, data: performance });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Activity Heatmap ──────────────────────────────────────
router.get("/heatmap", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const heatmap = await getActivityHeatmap(req.user!.userId, days);
    res.json({ success: true, data: heatmap });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
