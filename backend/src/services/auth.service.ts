// ============================================================
// academia.io — Auth Service
// ============================================================
// Handles user registration, login, JWT token generation.
// Passwords are hashed with bcrypt.
// ============================================================

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { ENV } from "../config/env.js";
import { JwtPayload } from "../types/index.js";

const SALT_ROUNDS = 12;

// ── Register ──────────────────────────────────────────────
export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  role?: string;
  schoolId?: string;
  grade?: string;
}) {
  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || "student",
      schoolId: data.schoolId || null,
      grade: data.grade || null,
    },
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

// ── Login ─────────────────────────────────────────────────
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  const payload: JwtPayload = {
    userId: user.id,
    role: user.role,
    schoolId: user.schoolId,
  };

  const token = jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      schoolId: user.schoolId,
      grade: user.grade,
      xp: user.xp,
      streak: user.streak,
      lastActiveDate: user.lastActiveDate,
      streakDays: user.streakDays,
      perfectQuizzes: user.perfectQuizzes,
      focusMinutes: user.focusMinutes,
      treesGrown: user.treesGrown,
      dailyGoal: user.dailyGoal,
      todayXp: user.todayXp,
      questsState: user.questsState,
      cosmetics: user.cosmetics,
      comboCount: user.comboCount,
    },
  };
}

// ── Get Current User ──────────────────────────────────────
export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      schoolId: true,
      grade: true,
      xp: true,
      streak: true,
      lastActiveDate: true,
      streakDays: true,
      perfectQuizzes: true,
      focusMinutes: true,
      treesGrown: true,
      dailyGoal: true,
      todayXp: true,
      questsState: true,
      cosmetics: true,
      comboCount: true,
      createdAt: true,
    },
  });
  return user;
}
