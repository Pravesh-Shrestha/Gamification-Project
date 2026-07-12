// ============================================================
// academia.io — Content & Subject Management Routes
// ============================================================

import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  createChapter,
  createLesson,
  updateLesson,
  uploadFile,
  serveFile,
  importQuiz,
  getUploads,
  logInteraction,
} from "../controllers/content.controller.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Multer config ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "uploads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".xlsx", ".xls", ".csv", ".doc", ".docx", ".mp4"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const router = Router();
router.use(authenticate);

// ═══════════════════════════════════════════════════════════
//  SUBJECT MANAGEMENT (admin+)
// ═══════════════════════════════════════════════════════════
router.get("/subjects", getSubjects as any);

const subjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().optional().default("#3B82F6"),
  icon: z.string().optional().default("📚"),
  blurb: z.string().optional().default(""),
});

router.post("/subjects", authenticate, requireRole("admin", "super_admin"), validate(subjectSchema), createSubject as any);
router.put("/subjects/:id", authenticate, requireRole("admin", "super_admin"), updateSubject as any);
router.delete("/subjects/:id", authenticate, requireRole("admin", "super_admin"), deleteSubject as any);

// ═══════════════════════════════════════════════════════════
//  CHAPTER & LESSON MANAGEMENT (teacher+)
// ═══════════════════════════════════════════════════════════
const chapterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int(),
  subjectId: z.string().min(1),
});

router.post("/chapters", authenticate, requireRole("teacher", "admin", "super_admin"), validate(chapterSchema), createChapter as any);

const lessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  mins: z.number().int().optional().default(5),
  order: z.number().int(),
  chapterId: z.string().min(1),
  subjectId: z.string().min(1),
  slides: z.any().optional().default([]),
  quiz: z.any().optional().default([]),
});

router.post("/lessons", authenticate, requireRole("teacher", "admin", "super_admin"), validate(lessonSchema), createLesson as any);
router.put("/lessons/:id", authenticate, requireRole("teacher", "admin", "super_admin"), updateLesson as any);

// ═══════════════════════════════════════════════════════════
//  FILE UPLOAD (PDFs, images for lessons)
// ═══════════════════════════════════════════════════════════
router.post("/upload", upload.single("file"), uploadFile as any);

// Serve uploaded files (path traversal protected)
router.get("/files/:filename", serveFile as any);

// ═══════════════════════════════════════════════════════════
//  EXCEL QUIZ IMPORT
// ═══════════════════════════════════════════════════════════
router.post("/import-quiz/:lessonId", upload.single("file"), importQuiz as any);

// ═══════════════════════════════════════════════════════════
//  LIST UPLOADED CONTENT
// ═══════════════════════════════════════════════════════════
router.get("/uploads", getUploads as any);

// ═══════════════════════════════════════════════════════════
//  INTERACTION LOG (ML data collection)
// ═══════════════════════════════════════════════════════════
const interactionSchema = z.object({
  kind: z.string().min(1),
  metadata: z.any(),
  sessionId: z.string().optional(),
});

router.post("/interact", validate(interactionSchema), logInteraction as any);

export default router;
