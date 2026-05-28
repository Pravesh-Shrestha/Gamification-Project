// ============================================================
// academia.io — Engagement Engine Routes
// ============================================================

import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  dashboard,
  completeLesson,
  completeFocus,
  badges,
} from "../controllers/engine.controller.js";

const router = Router();

// ── Dashboard ─────────────────────────────────────────────
router.get("/dashboard", authenticate, dashboard as any);

// ── Complete Lesson ───────────────────────────────────────
const lessonSchema = z.object({
  lessonId: z.string().min(1),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
  subjectId: z.string().min(1),
  xpMultiplier: z.number().optional().default(1),
  comboMax: z.number().int().optional().default(0),
});

router.post("/lesson/complete", authenticate, validate(lessonSchema), completeLesson as any);

// ── Complete Focus Session ────────────────────────────────
const focusSchema = z.object({
  minutes: z.number().int().min(1).max(120),
});

router.post("/focus/complete", authenticate, validate(focusSchema), completeFocus as any);

// ── Badge Catalog ─────────────────────────────────────────
router.get("/badges", authenticate, badges as any);

export default router;
