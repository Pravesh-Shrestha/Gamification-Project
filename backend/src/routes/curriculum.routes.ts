// ============================================================
// academia.io - Curriculum Routes
// ============================================================

import { Router, Response } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { AuthRequest } from "../types/index.js";
import { getCurriculum, getLesson, getStudentProgress } from "../services/curriculum.service.js";

const router = Router();

// ── Get Full Curriculum (with user progress if authenticated) ─
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const curriculum = await getCurriculum(req.user!.userId);
    res.json({ success: true, data: curriculum });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Get Single Lesson (slides + quiz) ───────────────────
router.get("/lesson/:lessonId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const lesson = await getLesson(req.params.lessonId);
    if (!lesson) {
      res.status(404).json({ success: false, error: "Lesson not found" });
      return;
    }
    res.json({ success: true, data: lesson });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Get Student Progress ─────────────────────────────────
router.get("/progress", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const progress = await getStudentProgress(req.user!.userId);
    res.json({ success: true, data: progress });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── Get Student Progress (Teacher/Admin view) ────────────
router.get("/progress/:userId", authenticate, requireRole("teacher", "admin", "super_admin"), async (req: AuthRequest, res: Response) => {
  try {
    const progress = await getStudentProgress(req.params.userId);
    res.json({ success: true, data: progress });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
