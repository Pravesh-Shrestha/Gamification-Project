import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding classes...");
  const schools = await prisma.school.findMany();
  console.log(`Found ${schools.length} schools`);

  for (const school of schools) {
    for (let g = 1; g <= 8; g++) {
      const name = `Grade ${g}`;
      const existing = await prisma.class.findFirst({ where: { name, schoolId: school.id } });
      if (!existing) {
        await prisma.class.create({ data: { name, grade: g, section: "A", schoolId: school.id } });
      }
    }
    console.log(`  Grade 1-8 ready for ${school.name}`);
  }

  const total = await prisma.class.count();
  console.log(`Total classes: ${total}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
