import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import { prisma } from "../lib/prisma.js";

export async function listLessons(req: AuthRequest, res: Response): Promise<void> {
  try {
    const subjectId = req.query.subjectId as string;
    const where = subjectId ? { subjectId } : {};
    const lessons = await prisma.lesson.findMany({
      where, orderBy: [{ subjectId: "asc" }, { order: "asc" }],
      select: { id: true, title: true, mins: true, order: true, subjectId: true, chapterId: true },
    });
    res.json({ success: true, data: lessons });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function createQuiz(req: AuthRequest, res: Response): Promise<void> {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.body.lessonId } });
    if (!lesson) { res.status(404).json({ success: false, error: "Lesson not found" }); return; }

    const existingQuiz = JSON.parse(lesson.quiz);
    const newQuestions = req.body.questions.map((q: any, i: number) => ({
      ...q,
      teacherId: req.user!.userId,
      custom: true,
      id: `custom_${Date.now()}_${i}`,
    }));
    const merged = [...existingQuiz, ...newQuestions];

    await prisma.lesson.update({
      where: { id: req.body.lessonId },
      data: { quiz: JSON.stringify(merged) },
    });

    res.json({ success: true, data: { added: newQuestions.length, total: merged.length } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function getLessonProgress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId;
    if (!schoolId) { res.status(400).json({ success: false, error: "No school context" }); return; }

    const progress = await prisma.lessonProgress.findMany({
      where: { lessonId: req.params.lessonId },
      include: {
        user: { select: { id: true, name: true, avatar: true, email: true } },
      },
      orderBy: { completedAt: "desc" },
    });

    const students = await prisma.user.findMany({
      where: { schoolId, role: "student" },
      select: { id: true, name: true, avatar: true, email: true },
    });

    const result = students.map((s) => {
      const p = progress.find((pr) => pr.userId === s.id);
      return {
        ...s,
        completed: !!p,
        score: p?.score || 0,
        total: p?.total || 0,
        perfect: p?.perfect || false,
        completedAt: p?.completedAt || null,
      };
    });

    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function getClassOverview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId;
    if (!schoolId) { res.status(400).json({ success: false, error: "No school context" }); return; }

    const students = await prisma.user.findMany({
      where: { schoolId, role: "student" },
      orderBy: { xp: "desc" },
      select: {
        id: true, name: true, avatar: true, grade: true, xp: true, streak: true,
        perfectQuizzes: true, focusMinutes: true, treesGrown: true,
        _count: { select: { lessonsCompleted: true } },
        badges: { select: { badgeId: true } },
      },
    });

    res.json({ success: true, data: students });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function createAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignment = await prisma.assignment.create({
      data: {
        classId: req.body.classId,
        lessonId: req.body.lessonId,
        assignedBy: req.user!.userId,
        dueAt: new Date(req.body.dueAt),
        note: req.body.note || null,
      },
    });
    res.status(201).json({ success: true, data: assignment });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function listAssignments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { assignedBy: req.user!.userId },
      orderBy: { assignedAt: "desc" },
    });
    res.json({ success: true, data: assignments });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function deleteAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    await prisma.assignment.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, data: { deleted: true } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}
