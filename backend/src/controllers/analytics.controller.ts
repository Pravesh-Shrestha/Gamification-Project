import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import { prisma } from "../lib/prisma.js";
import { levelFromXP } from "../services/engagement.service.js";
import { predictStudentPerformance, clusterClassStudents } from "../services/ml.service.js";

export async function getPerformanceSummary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ success: false, error: "User not found" }); return; }

    const progress = await prisma.lessonProgress.findMany({
      where: { userId },
      include: { lesson: { select: { title: true, subjectId: true, mins: true } } },
      orderBy: { completedAt: "desc" },
    });

    const bySubject: Record<string, { completed: number; total: number; xp: number; perfect: number; minutes: number; lessons: any[] }> = {};
    const subjects = await prisma.subject.findMany();
    for (const subj of subjects) {
      const subjLessons = await prisma.lesson.count({ where: { subjectId: subj.id } });
      bySubject[subj.id] = { completed: 0, total: subjLessons, xp: 0, perfect: 0, minutes: 0, lessons: [] };
    }

    for (const p of progress) {
      if (!bySubject[p.lesson.subjectId]) continue;
      bySubject[p.lesson.subjectId].completed++;
      bySubject[p.lesson.subjectId].xp += p.xpEarned;
      if (p.perfect) bySubject[p.lesson.subjectId].perfect++;
      bySubject[p.lesson.subjectId].minutes += p.lesson.mins;
    }

    const totalCorrect = progress.reduce((s, p) => s + p.score, 0);
    const totalQuestions = progress.reduce((s, p) => s + p.total, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const streakDays: string[] = JSON.parse(user.streakDays);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentProgress = progress.filter(p => p.completedAt >= thirtyDaysAgo);
    const daysActive = new Set(recentProgress.map(p => p.completedAt.toISOString().split("T")[0])).size;

    let weakestSubject = null;
    let weakestAccuracy = 100;
    for (const [subjId, data] of Object.entries(bySubject)) {
      if (data.completed > 0) {
        const subj = subjects.find(s => s.id === subjId);
        const subjProgress = progress.filter(p => p.lesson.subjectId === subjId);
        const subjCorrect = subjProgress.reduce((s, p) => s + p.score, 0);
        const subjTotal = subjProgress.reduce((s, p) => s + p.total, 0);
        const subjAcc = subjTotal > 0 ? Math.round((subjCorrect / subjTotal) * 100) : 0;
        if (subjAcc < weakestAccuracy) { weakestAccuracy = subjAcc; weakestSubject = subj?.name || subjId; }
      }
    }

    const subjectPerformance = Object.entries(bySubject).map(([id, d]) => {
      const subj = subjects.find(s => s.id === id);
      const subjProgress = progress.filter(p => p.lesson.subjectId === id);
      const subjCorrect = subjProgress.reduce((s, p) => s + p.score, 0);
      const subjTotal = subjProgress.reduce((s, p) => s + p.total, 0);
      return {
        id, name: subj?.name || id, color: subj?.color || "#888",
        ...d, accuracy: subjTotal > 0 ? Math.round((subjCorrect / subjTotal) * 100) : 0,
      };
    });

    res.json({
      success: true, data: {
        level: levelFromXP(user.xp),
        xp: user.xp,
        streak: user.streak,
        totalDaysActive: streakDays.length,
        daysActive30: daysActive,
        totalLessons: progress.length,
        totalFocusMinutes: user.focusMinutes,
        treesGrown: user.treesGrown,
        accuracy,
        perfectQuizzes: user.perfectQuizzes,
        weakestSubject,
        weakestAccuracy,
        subjectPerformance,
        recentActivity: progress.slice(0, 10).map(p => ({
          lessonId: p.lessonId,
          lessonTitle: p.lesson.title,
          subjectId: p.lesson.subjectId,
          score: p.score,
          total: p.total,
          perfect: p.perfect,
          xpEarned: p.xpEarned,
          completedAt: p.completedAt,
        })),
      },
    });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function getLessonSummaries(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const progress = await prisma.lessonProgress.findMany({
      where: { userId },
      include: { lesson: { select: { id: true, title: true, subjectId: true, slides: true, mins: true } } },
      orderBy: { completedAt: "desc" },
    });

    const subjects = await prisma.subject.findMany();
    const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s.name]));

    const summaries = progress.map(p => {
      const slides = JSON.parse(p.lesson.slides || "[]");
      const keyPoints = slides.filter((s: any) => s.kind === "intro" || s.kind === "tip").map((s: any) => s.body);
      return {
        lessonId: p.lessonId,
        lessonTitle: p.lesson.title,
        subject: subjectMap[p.lesson.subjectId] || p.lesson.subjectId,
        score: p.score,
        total: p.total,
        perfect: p.perfect,
        xpEarned: p.xpEarned,
        completedAt: p.completedAt,
        keyPoints: keyPoints.slice(0, 3),
        duration: p.lesson.mins,
      };
    });

    res.json({ success: true, data: summaries });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function getMLInsights(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const insights = await predictStudentPerformance(userId);
    res.json({ success: true, data: insights });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function getClassClusters(req: AuthRequest, res: Response): Promise<void> {
  try {
    const classId = req.query.classId as string;
    if (!classId) { res.status(400).json({ success: false, error: "classId query parameter is required" }); return; }
    const clusters = await clusterClassStudents(classId);
    res.json({ success: true, data: clusters });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}
