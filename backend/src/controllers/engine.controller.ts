import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import {
  processLessonComplete,
  processFocusComplete,
  getDashboard,
  BADGE_DEFS,
} from "../services/engagement.service.js";

export async function dashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = await getDashboard(req.user!.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function completeLesson(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await processLessonComplete(
      req.user!.userId,
      req.body.lessonId,
      req.body.score,
      req.body.total,
      req.body.subjectId,
      req.body.xpMultiplier,
      req.body.comboMax
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function completeFocus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await processFocusComplete(req.user!.userId, req.body.minutes);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export function badges(req: AuthRequest, res: Response): void {
  res.json({ success: true, data: BADGE_DEFS });
}
