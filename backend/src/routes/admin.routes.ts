// ============================================================
// academia.io — Admin Routes (Full CRUD)
// ============================================================

import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  getRules,
  getUsers,
  addUser,
  editUser,
  removeUser,
  addSchool,
  editSchool,
  removeSchool,
  getClasses,
  addClass,
  editClass,
  removeClass,
  resetUserPassword,
} from "../controllers/admin.controller.js";

const router = Router();

// ── Rules ────────────────────────────────────────────────
router.get("/rules", authenticate, getRules as any);

// ═══════════════════════════════════════════════════════════
//  USERS
// ═══════════════════════════════════════════════════════════
router.get("/users", authenticate, getUsers as any);

const userSchema = z.object({
  name: z.string().min(2), email: z.string().email(),
  role: z.enum(["admin", "teacher", "student"]),
  schoolId: z.string().optional(), grade: z.string().optional(), classId: z.string().optional(),
});
router.post("/users", authenticate, validate(userSchema), addUser as any);

const userUpdateSchema = z.object({
  name: z.string().min(2).optional(), email: z.string().email().optional(),
  grade: z.string().optional(), classId: z.string().optional(),
});
router.put("/users/:id", authenticate, validate(userUpdateSchema), editUser as any);

router.delete("/users/:id", authenticate, removeUser as any);

// ═══════════════════════════════════════════════════════════
//  SCHOOLS
// ═══════════════════════════════════════════════════════════
const schoolSchema = z.object({
  name: z.string().min(2), city: z.string().min(1),
  motto: z.string().optional(), color: z.string().optional(),
  adminName: z.string().min(2), adminEmail: z.string().email(),
});
router.post("/schools", authenticate, requireRole("super_admin"), validate(schoolSchema), addSchool as any);

const schoolUpdateSchema = z.object({
  name: z.string().min(2).optional(), city: z.string().min(1).optional(),
  motto: z.string().optional(), color: z.string().optional(),
});
router.put("/schools/:id", authenticate, requireRole("super_admin"), validate(schoolUpdateSchema), editSchool as any);

router.delete("/schools/:id", authenticate, requireRole("super_admin"), removeSchool as any);

// ═══════════════════════════════════════════════════════════
//  CLASSES
// ═══════════════════════════════════════════════════════════
router.get("/classes", authenticate, getClasses as any);

const classSchema = z.object({
  name: z.string().min(1), grade: z.number().int().min(1).max(10),
  section: z.string().optional(), schoolId: z.string().min(1),
});
router.post("/classes", authenticate, validate(classSchema), addClass as any);

const classUpdateSchema = z.object({
  name: z.string().min(1).optional(), grade: z.number().int().min(1).max(10).optional(),
  section: z.string().optional(),
});
router.put("/classes/:id", authenticate, validate(classUpdateSchema), editClass as any);

router.delete("/classes/:id", authenticate, removeClass as any);

// ── Reset password ──────────────────────────────────────
router.post("/reset-password/:id", authenticate, resetUserPassword as any);

export default router;
