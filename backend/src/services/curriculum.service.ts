// ============================================================
// academia.io — Curriculum Service
// ============================================================
// Serves subject/chapter/lesson data from the database.
// Tracks which lessons a student has completed.
// ============================================================

import { prisma } from "../lib/prisma.js";

// ── Get Full Curriculum with Progress ────────────────────
export async function getCurriculum(userId?: string) {
  const subjects = await prisma.subject.findMany({
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              mins: true,
              order: true,
              chapterId: true,
              subjectId: true,
              // Exclude slides/quiz — sent separately per-lesson
            },
          },
        },
      },
    },
  });

  // Get user's progress if userId provided
  let completedLessons: string[] = [];
  if (userId) {
    const progress = await prisma.lessonProgress.findMany({
      where: { userId },
      select: { lessonId: true, score: true, total: true, perfect: true },
    });
    completedLessons = progress.map(p => p.lessonId);

    // Attach progress to each lesson
    const progressMap = new Map(progress.map(p => [p.lessonId, p]));
    for (const subject of subjects) {
      for (const chapter of subject.chapters) {
        for (const lesson of chapter.lessons) {
          const prog = progressMap.get(lesson.id);
          (lesson as any).completed = !!prog;
          (lesson as any).score = prog?.score || 0;
          (lesson as any).total = prog?.total || 0;
          (lesson as any).perfect = prog?.perfect || false;
        }
      }
    }
  }

  return subjects;
}

// ── Get Single Lesson (with slides + quiz) ───────────────
export async function getLesson(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) return null;

  return {
    id: lesson.id,
    title: lesson.title,
    mins: lesson.mins,
    order: lesson.order,
    chapterId: lesson.chapterId,
    subjectId: lesson.subjectId,
    slides: JSON.parse(lesson.slides),
    quiz: JSON.parse(lesson.quiz),
  };
}

// ── Get Student Progress Summary ─────────────────────────
export async function getStudentProgress(userId: string) {
  const progress = await prisma.lessonProgress.findMany({
    where: { userId },
    include: { lesson: true },
    orderBy: { completedAt: "desc" },
  });

  const bySubject: Record<string, { total: number; completed: number; perfect: number; xp: number }> = {};

  for (const p of progress) {
    const subj = p.lesson.subjectId;
    if (!bySubject[subj]) bySubject[subj] = { total: 0, completed: 0, perfect: 0, xp: 0 };
    bySubject[subj].completed++;
    bySubject[subj].xp += p.xpEarned;
    if (p.perfect) bySubject[subj].perfect++;
  }

  // Get total lessons per subject
  const lessons = await prisma.lesson.findMany();
  for (const lesson of lessons) {
    if (!bySubject[lesson.subjectId]) bySubject[lesson.subjectId] = { total: 0, completed: 0, perfect: 0, xp: 0 };
    bySubject[lesson.subjectId].total++;
  }

  return {
    totalCompleted: progress.length,
    totalXp: progress.reduce((sum, p) => sum + p.xpEarned, 0),
    bySubject,
    recent: progress.slice(0, 10).map(p => ({
      lessonId: p.lessonId,
      lessonTitle: p.lesson.title,
      score: p.score,
      total: p.total,
      perfect: p.perfect,
      completedAt: p.completedAt,
    })),
  };
}
