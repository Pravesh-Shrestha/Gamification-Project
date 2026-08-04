// ============================================================
// academia.io - School Service
// ============================================================

import { prisma } from "../lib/prisma.js";

export async function getAllSchools() {
  return prisma.school.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      city: true,
      color: true,
      motto: true,
    },
  });
}

export async function getSchoolById(schoolId: string) {
  return prisma.school.findUnique({
    where: { id: schoolId },
    select: {
      id: true,
      name: true,
      city: true,
      color: true,
      motto: true,
    },
  });
}
