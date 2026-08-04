// ============================================================
// academia.io - Engagement Engine Routes
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
  lessonId: z.string().min(1).max(64),
  score: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(50),
  subjectId: z.string().min(1).max(32),
  xpMultiplier: z.number().min(0.1).max(5).optional().default(1),
  comboMax: z.number().int().min(0).max(50).optional().default(0),
}).refine((d) => d.score <= d.total, {
  message: "score cannot be greater than total questions",
  path: ["score"],
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
