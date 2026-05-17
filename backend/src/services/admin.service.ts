// ============================================================
// academia.io — Admin Service
// ============================================================
// Full CRUD for schools, users, and classes with role-based
// access enforcement throughout.
// ============================================================

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = "password123";

function generatePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(10);
  let pwd = "";
  for (let i = 0; i < 10; i++) pwd += chars[bytes[i] % chars.length];
  return pwd;
}

const ALLOWED_CREATION: Record<string, string[]> = {
  super_admin: ["admin"],
  admin: ["teacher", "student"],
  teacher: ["student"],
};

// ── SCHOOL CRUD ───────────────────────────────────────────

export async function createSchool(creatorRole: string, data: {
  name: string; city: string; motto?: string; color?: string; adminName: string; adminEmail: string;
}) {
  if (creatorRole !== "super_admin") throw new Error("Only super_admin can create schools");
  if (await prisma.school.findFirst({ where: { name: data.name } }))
    throw new Error("School name already exists");
  if (await prisma.user.findUnique({ where: { email: data.adminEmail } }))
    throw new Error("Admin email already in use");
  const school = await prisma.school.create({ data: { name: data.name, city: data.city, motto: data.motto || null, color: data.color || "#3B82F6" } });
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  const admin = await prisma.user.create({
    data: { email: data.adminEmail, password: hash, name: data.adminName, role: "admin", schoolId: school.id, avatar: ["owl","fox","bear","cat"][Math.floor(Math.random()*4)] },
    select: { id: true, email: true, name: true, role: true, schoolId: true },
  });
  return { school, admin: { ...admin, defaultPassword: DEFAULT_PASSWORD } };
}

export async function updateSchool(schoolId: string, data: { name?: string; city?: string; motto?: string; color?: string }) {
  return prisma.school.update({ where: { id: schoolId }, data });
}

export async function deleteSchool(schoolId: string) {
  await prisma.user.deleteMany({ where: { schoolId } });
  await prisma.class.deleteMany({ where: { schoolId } });
  return prisma.school.delete({ where: { id: schoolId } });
}

// ── USER CRUD ─────────────────────────────────────────────

export async function createUser(creatorRole: string, creatorSchoolId: string | null | undefined, data: {
  name: string; email: string; role: string; grade?: string; schoolId?: string; classId?: string;
}) {
  const allowed = ALLOWED_CREATION[creatorRole];
  if (!allowed?.includes(data.role))
    throw new Error(`A ${creatorRole} cannot create a ${data.role} account`);
  if (await prisma.user.findUnique({ where: { email: data.email } }))
    throw new Error("Email already registered");
  let schoolId: string | null = data.schoolId || creatorSchoolId || null;
  if (creatorRole !== "super_admin") schoolId = creatorSchoolId ?? null;
  if (!schoolId && data.role !== "super_admin") throw new Error("School is required");
  const rawPassword = generatePassword();
  const hash = await bcrypt.hash(rawPassword, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: data.email, password: hash, name: data.name, role: data.role, schoolId,
      grade: data.grade || null, classId: data.classId || null,
      avatar: ["hat","panda","fox","cat","dog","owl","penguin","bunny","bear","frog","monkey","unicorn"][Math.floor(Math.random()*12)],
    },
    select: { id: true, email: true, name: true, role: true, schoolId: true, grade: true, avatar: true, classId: true, createdAt: true },
  });
  return { ...user, generatedPassword: rawPassword };
}

export async function updateUser(userId: string, viewerRole: string, viewerSchoolId: string | null, data: {
  name?: string; email?: string; grade?: string; classId?: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (viewerRole !== "super_admin" && user.schoolId !== viewerSchoolId)
    throw new Error("Cannot modify users outside your school");
  if (data.email && data.email !== user.email) {
    if (await prisma.user.findUnique({ where: { email: data.email } }))
      throw new Error("Email already in use");
  }
  return prisma.user.update({
    where: { id: userId },
    data: { name: data.name, email: data.email, grade: data.grade, classId: data.classId },
    select: { id: true, email: true, name: true, role: true, schoolId: true, grade: true, avatar: true, classId: true },
  });
}

export async function deleteUser(userId: string, viewerRole: string, viewerSchoolId: string | null) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (viewerRole !== "super_admin" && user.schoolId !== viewerSchoolId)
    throw new Error("Cannot delete users outside your school");
  if (user.role === "super_admin") throw new Error("Cannot delete super admin");
  await prisma.lessonProgress.deleteMany({ where: { userId } });
  await prisma.userBadge.deleteMany({ where: { userId } });
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.feedEvent.deleteMany({ where: { userId } });
  await prisma.chatMessage.deleteMany({ where: { userId } });
  return prisma.user.delete({ where: { id: userId } });
}

export async function listUsers(viewerRole: string, viewerSchoolId: string | null | undefined, filters: { role?: string; schoolId?: string }) {
  const where: any = {};
  if (viewerRole !== "super_admin") where.schoolId = viewerSchoolId;
  else if (filters.schoolId) where.schoolId = filters.schoolId;
  if (filters.role) where.role = filters.role;
  return prisma.user.findMany({ where, orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, avatar: true, schoolId: true, grade: true, classId: true, xp: true, streak: true, createdAt: true },
  });
}

// ── CLASS CRUD ────────────────────────────────────────────

export async function listClasses(schoolId?: string) {
  const where = schoolId ? { schoolId } : {};
  return prisma.class.findMany({ where, orderBy: [{ grade: "asc" }, { section: "asc" }] });
}

export async function createClass(data: { name: string; grade: number; section?: string; schoolId: string }) {
  return prisma.class.create({ data: { name: data.name, grade: data.grade, section: data.section || "A", schoolId: data.schoolId } });
}

export async function updateClass(classId: string, data: { name?: string; grade?: number; section?: string }) {
  return prisma.class.update({ where: { id: classId }, data });
}

export async function deleteClass(classId: string) {
  await prisma.user.updateMany({ where: { classId }, data: { classId: null } });
  return prisma.class.delete({ where: { id: classId } });
}

// ── HELPERS ───────────────────────────────────────────────

export async function resetPassword(userId: string, viewerRole: string, viewerSchoolId: string | null) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (viewerRole !== "super_admin" && user.schoolId !== viewerSchoolId)
    throw new Error("Cannot reset password for users outside your school");
  const newPassword = generatePassword();
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { password: hash } });
  return { newPassword, userId: user.id, email: user.email };
}

export function getCreationRules(role: string) {
  return { role, canCreate: ALLOWED_CREATION[role] || [], defaultPassword: DEFAULT_PASSWORD };
}
