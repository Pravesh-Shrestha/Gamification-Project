// ============================================================
// academia.io — Auth & Registration Routes
// ============================================================

import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { getSchools, register, login, getMe } from "../controllers/auth.controller.js";

const router = Router();

// ── Schools (for registration dropdown) ───────────────────
router.get("/schools", getSchools);

// ── Register (public) ─────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["student", "teacher"]).optional().default("student"),
  schoolId: z.string().min(1, "School is required"),
  grade: z.string().optional(),
});

router.post("/register", validate(registerSchema), register);

// ── Login ─────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

router.post("/login", validate(loginSchema), login);

// ── Get Current User ─────────────────────────────────────
router.get("/me", authenticate as any, getMe as any);

export default router;
