import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function check() {
  const badgeCount = await prisma.userBadge.count();
  const userCount = await prisma.user.count({ where: { role: "student" } });
  const usersWithBadges = await prisma.userBadge.groupBy({ by: ["userId"], _count: true });
  const topBadges = await prisma.userBadge.groupBy({
    by: ["badgeId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });
  const topStudents = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, name: true, xp: true, streak: true, focusMinutes: true },
    orderBy: { xp: "desc" },
    take: 5,
  });

  console.log("=== BADGE DIAGNOSTIC ===");
  console.log("Total UserBadge records:", badgeCount);
  console.log("Total students:", userCount);
  console.log("Students with >=1 badge:", usersWithBadges.length);
  console.log("Top badges by count:", JSON.stringify(topBadges, null, 2));
  console.log("Top students by XP:", JSON.stringify(topStudents, null, 2));
  await prisma.$disconnect();
  pool.end();
}

check().catch((e) => { console.error(e); process.exit(1); });
