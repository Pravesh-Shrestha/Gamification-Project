import { Request, Response } from "express";
import { AuthRequest } from "../types/index.js";
import { prisma } from "../lib/prisma.js";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function getSubjects(req: AuthRequest, res: Response): Promise<void> {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { chapters: true } } },
    });
    res.json({ success: true, data: subjects });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function createSubject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const subject = await prisma.subject.create({ data: req.body });
    res.status(201).json({ success: true, data: subject });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function updateSubject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: { name: req.body.name, color: req.body.color, icon: req.body.icon, blurb: req.body.blurb },
    });
    res.json({ success: true, data: subject });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function deleteSubject(req: AuthRequest, res: Response): Promise<void> {
  try {
    await prisma.chapter.deleteMany({ where: { subjectId: req.params.id } });
    await prisma.lesson.deleteMany({ where: { subjectId: req.params.id } });
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { deleted: true } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function createChapter(req: AuthRequest, res: Response): Promise<void> {
  try {
    const chapter = await prisma.chapter.create({ data: req.body });
    res.status(201).json({ success: true, data: chapter });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function createLesson(req: AuthRequest, res: Response): Promise<void> {
  try {
    const lesson = await prisma.lesson.create({
      data: {
        id: req.body.id,
        title: req.body.title,
        mins: req.body.mins,
        order: req.body.order,
        chapterId: req.body.chapterId,
        subjectId: req.body.subjectId,
        slides: JSON.stringify(req.body.slides || []),
        quiz: JSON.stringify(req.body.quiz || []),
      },
    });
    res.status(201).json({ success: true, data: lesson });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function updateLesson(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data: any = {};
    if (req.body.title) data.title = req.body.title;
    if (req.body.mins) data.mins = req.body.mins;
    if (req.body.slides) data.slides = JSON.stringify(req.body.slides);
    if (req.body.quiz) {
      const existing = await prisma.lesson.findUnique({ where: { id: req.params.id } });
      const existingQuiz = existing ? JSON.parse(existing.quiz) : [];
      data.quiz = JSON.stringify([...existingQuiz, ...req.body.quiz]);
    }
    const lesson = await prisma.lesson.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: lesson });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function uploadFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) { res.status(400).json({ success: false, error: "No file uploaded" }); return; }
    const fileType = path.extname(req.file.originalname).toLowerCase().replace(".", "");
    const typeMap: Record<string, string> = { pdf: "pdf", png: "image", jpg: "image", jpeg: "image", gif: "image", mp4: "video", doc: "other", docx: "other" };
    const content = await prisma.uploadedContent.create({
      data: {
        title: req.body.title || req.file.originalname,
        fileName: req.file.filename,
        fileType: typeMap[fileType] || "other",
        fileSize: req.file.size,
        filePath: `/uploads/${req.file.filename}`,
        uploadedBy: req.user!.userId,
        schoolId: req.user!.schoolId || null,
        lessonId: req.body.lessonId || null,
      },
    });
    res.status(201).json({ success: true, data: content });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export function serveFile(req: Request, res: Response): void {
  const filename = path.basename(req.params.filename);
  const filePath = path.resolve(__dirname, "..", "..", "uploads", filename);
  if (!filePath.startsWith(path.resolve(__dirname, "..", "..", "uploads"))) {
    res.status(403).json({ success: false, error: "Forbidden" });
    return;
  }
  res.sendFile(filePath);
}

export async function importQuiz(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) { res.status(400).json({ success: false, error: "No file uploaded" }); return; }
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } });
    if (!lesson) { res.status(404).json({ success: false, error: "Lesson not found" }); return; }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    const questions = rows.map((row: any, i: number) => {
      const kind = (row.kind || "mcq").toLowerCase();
      const q: any = { kind, q: row.question || row.q || `Question ${i + 1}` };
      if (kind === "mcq") {
        q.choices = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
        q.answer = parseInt(row.answer) || 0;
      } else if (kind === "tf") {
        q.answer = row.answer === true || row.answer === "true" || row.answer === "True";
      } else {
        q.answer = String(row.answer || "");
        q.hint = row.hint || "";
      }
      q.custom = true;
      q.teacherId = req.user!.userId;
      return q;
    });

    const existingQuiz = JSON.parse(lesson.quiz);
    const merged = [...existingQuiz, ...questions];
    await prisma.lesson.update({ where: { id: req.params.lessonId }, data: { quiz: JSON.stringify(merged) } });

    res.json({ success: true, data: { imported: questions.length, total: merged.length } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function getUploads(req: AuthRequest, res: Response): Promise<void> {
  try {
    const schoolId = req.user!.schoolId;
    const where = schoolId ? { schoolId } : {};
    const files = await prisma.uploadedContent.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ success: true, data: files });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function logInteraction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const log = await prisma.interactionLog.create({
      data: {
        userId: req.user!.userId,
        kind: req.body.kind,
        metadata: JSON.stringify(req.body.metadata || {}),
        sessionId: req.body.sessionId || null,
      },
    });
    res.status(201).json({ success: true, data: log });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}
