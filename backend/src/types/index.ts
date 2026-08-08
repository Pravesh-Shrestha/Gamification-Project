// ============================================================
// academia.io - Shared Types
// ============================================================

import { Request } from "express";

// ── Auth ──────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  role: string;
  schoolId?: string | null;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ── API Response ──────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Gamification ──────────────────────────────────────────
export interface LessonResult {
  lessonId: string;
  score: number;
  total: number;
  subjectId: string;
}

export interface QuestProgress {
  questId: string;
  current: number;
  goal: number;
  completed: boolean;
}

export interface BadgeInfo {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export interface CosmeticItem {
  id: string;
  name: string;
  kind: "frame" | "hat" | "pet" | "title";
  rarity: "common" | "rare" | "epic" | "legend";
  emoji: string;
  color?: string;
}

export interface LootboxResult {
  duplicate: boolean;
  item: CosmeticItem;
  xpInstead: number;
}

// ── Stats ─────────────────────────────────────────────────
export interface UserSummaryStats {
  totalXp: number;
  level: number;
  streak: number;
  lessonsCompleted: number;
  perfectQuizzes: number;
  focusMinutes: number;
  treesGrown: number;
  badges: number;
  rank?: number;
}

export interface WeeklyStats {
  days: { date: string; xp: number; lessons: number }[];
  totalXp: number;
  totalLessons: number;
  averagePerDay: number;
}

// ── Chatbot ───────────────────────────────────────────────
export interface ChatMessageRequest {
  message: string;
}

export interface ChatMessageResponse {
  reply: string;
  history: { role: string; content: string }[];
}
