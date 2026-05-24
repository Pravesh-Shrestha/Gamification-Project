// ============================================================
// academia.io — Teacher Routes (Content & Quiz Management)
// ============================================================

import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  listLessons,
  createQuiz,
  getLessonProgress,
  getClassOverview,
  createAssignment,
  listAssignments,
  deleteAssignment,
} from "../controllers/teacher.controller.js";

const router = Router();

// ── All teacher routes require teacher+ role ──────────────
router.use(authenticate, requireRole("teacher", "admin", "super_admin"));

// ── List lessons (with option to filter by subject) ──────
router.get("/lessons", listLessons as any);

// ── Create a custom quiz for a lesson (teacher-owned) ────
const quizSchema = z.object({
  lessonId: z.string().min(1),
  questions: z.array(z.object({
    kind: z.enum(["mcq", "tf", "fill"]),
    q: z.string().min(1),
    choices: z.array(z.string()).optional(),
    answer: z.union([z.number(), z.string(), z.boolean()]),
    hint: z.string().optional(),
  })).min(1),
});

router.post("/quizzes", validate(quizSchema), createQuiz as any);

// ── Get student progress for a specific lesson ───────────
router.get("/progress/:lessonId", getLessonProgress as any);

// ── Get class overview (all students in school with stats) ─
router.get("/class-overview", getClassOverview as any);

// ── Assignment Endpoints (CRUD) ───────────────────────────
const assignmentSchema = z.object({
  classId: z.string().min(1),
  lessonId: z.string().min(1),
  dueAt: z.number().int(),
  note: z.string().optional(),
});

router.post("/assignments", validate(assignmentSchema), createAssignment as any);
router.get("/assignments", listAssignments as any);
router.delete("/assignments/:id", deleteAssignment as any);

export default router;
