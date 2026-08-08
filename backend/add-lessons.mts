/**
 * ============================================================
 * academia.io - Add More Lessons (Additive, no wipe)
 * Upserts new lessons into existing chapters so the Learn Hub
 * has more content for the demo and the ML training set.
 * ============================================================
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

type Slide = { kind: string; body: string; visual?: string };
type Quiz =
  | { kind: "mcq"; q: string; choices: string[]; answer: number; hint?: string }
  | { kind: "tf"; q: string; answer: boolean; hint?: string }
  | { kind: "fill"; q: string; answer: string; hint?: string };

interface NewLesson {
  chapterId: string;
  subjectId: string;
  id: string;
  title: string;
  mins: number;
  slides: Slide[];
  quiz: Quiz[];
}

const NEW_LESSONS: NewLesson[] = [
  // ── Mathematics ────────────────────────────────────────────
  {
    chapterId: "m-frac", subjectId: "math", id: "m-frac-4", title: "Equivalent fractions", mins: 5,
    slides: [
      { kind: "intro", body: "Two fractions are equivalent when they represent the same amount, even if they look different." },
      { kind: "example", body: "1/2 and 2/4 are equivalent - both are half of a whole. Multiply top and bottom by the same number to find an equivalent fraction.", visual: "pie" },
      { kind: "tip", body: "To simplify a fraction, divide the top and bottom by the same number until you can't anymore." },
    ],
    quiz: [
      { kind: "mcq", q: "Which fraction is equivalent to 1/2?", choices: ["2/3", "3/6", "4/7", "1/3"], answer: 1 },
      { kind: "fill", q: "Simplify 4/8 to its lowest terms: ____.", answer: "1/2", hint: "Divide top and bottom by 4" },
      { kind: "tf", q: "3/4 and 6/8 are equivalent fractions.", answer: true },
    ],
  },
  {
    chapterId: "m-geom", subjectId: "math", id: "m-geom-2", title: "Perimeter", mins: 4,
    slides: [
      { kind: "intro", body: "The perimeter is the total distance around the outside of a shape." },
      { kind: "example", body: "A rectangle that is 5 cm long and 3 cm wide has a perimeter of 5 + 3 + 5 + 3 = 16 cm." },
      { kind: "tip", body: "Add up every side - don't forget any of them!" },
    ],
    quiz: [
      { kind: "mcq", q: "What is the perimeter of a square with sides of 4 cm?", choices: ["8 cm", "12 cm", "16 cm", "20 cm"], answer: 2 },
      { kind: "fill", q: "A triangle has sides 3, 4 and 5 cm. Its perimeter is ____ cm.", answer: "12" },
    ],
  },
  {
    chapterId: "m-geom", subjectId: "math", id: "m-geom-3", title: "Area of a rectangle", mins: 5,
    slides: [
      { kind: "intro", body: "The area is the amount of space inside a shape, measured in square units." },
      { kind: "example", body: "A rectangle 6 cm long and 4 cm wide has area 6 × 4 = 24 square cm.", visual: "grid" },
      { kind: "tip", body: "For rectangles: Area = length × width." },
    ],
    quiz: [
      { kind: "mcq", q: "A rectangle is 7 m long and 3 m wide. What is its area?", choices: ["10 m²", "21 m²", "21 m", "73 m²"], answer: 1 },
      { kind: "fill", q: "Area of a 5 cm by 5 cm square = ____ cm².", answer: "25" },
    ],
  },

  // ── Science ───────────────────────────────────────────────
  {
    chapterId: "s-plants", subjectId: "sci", id: "s-plants-3", title: "Photosynthesis", mins: 5,
    slides: [
      { kind: "intro", body: "Photosynthesis is how plants make their own food using sunlight, water and carbon dioxide." },
      { kind: "example", body: "A leaf uses sunlight to turn water and carbon dioxide into sugar (food) and releases oxygen.", visual: "leaf" },
      { kind: "tip", body: "Plants are the only living things that make their own food this way - they are producers!" },
    ],
    quiz: [
      { kind: "mcq", q: "What do plants need for photosynthesis?", choices: ["Only water", "Sunlight, water and carbon dioxide", "Soil and sugar", "Oxygen only"], answer: 1 },
      { kind: "tf", q: "Photosynthesis releases oxygen into the air.", answer: true },
    ],
  },
  {
    chapterId: "s-forces", subjectId: "sci", id: "s-forces-2", title: "Friction", mins: 4,
    slides: [
      { kind: "intro", body: "Friction is a force that slows things down when two surfaces rub together." },
      { kind: "example", body: "Your shoes grip the floor because of friction - that's what stops you from slipping.", visual: "shoes" },
      { kind: "tip", body: "Smooth surfaces create less friction; rough surfaces create more." },
    ],
    quiz: [
      { kind: "mcq", q: "Which surface creates the MOST friction?", choices: ["Ice", "Wet tile", "Sandpaper", "Glass"], answer: 2 },
      { kind: "tf", q: "Friction always makes moving things speed up.", answer: false },
    ],
  },
  {
    chapterId: "s-forces", subjectId: "sci", id: "s-forces-3", title: "Gravity", mins: 4,
    slides: [
      { kind: "intro", body: "Gravity is the force that pulls objects toward the centre of the Earth." },
      { kind: "example", body: "When you drop a ball, gravity pulls it down to the ground.", visual: "ball" },
      { kind: "tip", body: "Gravity is why we stay on the ground - and why the Moon stays in orbit around Earth!" },
    ],
    quiz: [
      { kind: "mcq", q: "What does gravity do?", choices: ["Pushes objects apart", "Pulls objects toward Earth", "Makes things float", "Creates friction"], answer: 1 },
      { kind: "tf", q: "The Moon is pulled by Earth's gravity.", answer: true },
    ],
  },

  // ── English ───────────────────────────────────────────────
  {
    chapterId: "e-vocab", subjectId: "eng", id: "e-vocab-2", title: "Synonyms & antonyms", mins: 4,
    slides: [
      { kind: "intro", body: "Synonyms are words with similar meanings. Antonyms are words with opposite meanings." },
      { kind: "example", body: "Happy and joyful are synonyms. Happy and sad are antonyms.", visual: "smiley" },
      { kind: "tip", body: "Using synonyms makes your writing richer and more interesting." },
    ],
    quiz: [
      { kind: "mcq", q: "Which is a synonym of 'big'?", choices: ["tiny", "huge", "fast", "cold"], answer: 1 },
      { kind: "mcq", q: "Which is an antonym of 'hot'?", choices: ["warm", "boiling", "cold", "burning"], answer: 2 },
    ],
  },
  {
    chapterId: "e-grammar", subjectId: "eng", id: "e-grammar-3", title: "Verb tenses", mins: 5,
    slides: [
      { kind: "intro", body: "Tenses tell us when an action happens: past, present or future." },
      { kind: "example", body: "I walked (past), I walk (present), I will walk (future)." },
      { kind: "tip", body: "Look for helper words like 'will', 'was' and 'am' to spot the tense." },
    ],
    quiz: [
      { kind: "mcq", q: "Which sentence is in the FUTURE tense?", choices: ["I ate lunch", "I am eating lunch", "I will eat lunch", "I have eaten"], answer: 2 },
      { kind: "tf", q: "'She danced' is in the past tense.", answer: true },
    ],
  },

  // ── Computer Science ──────────────────────────────────────
  {
    chapterId: "cs-basics", subjectId: "cs", id: "cs-basics-3", title: "The Internet", mins: 5,
    slides: [
      { kind: "intro", body: "The internet is a huge network that connects computers all around the world." },
      { kind: "example", body: "When you visit a website, your device sends a request through the network and gets data back in milliseconds.", visual: "network" },
      { kind: "tip", body: "Stay safe online: never share your password or personal details with strangers." },
    ],
    quiz: [
      { kind: "mcq", q: "What is the internet?", choices: ["A single computer", "A network of connected computers", "A type of software", "A game"], answer: 1 },
      { kind: "tf", q: "It is safe to share your password with a stranger online.", answer: false },
    ],
  },
  {
    chapterId: "cs-coding", subjectId: "cs", id: "cs-coding-2", title: "Loops", mins: 5,
    slides: [
      { kind: "intro", body: "A loop repeats a set of instructions over and over - perfect for repetitive tasks." },
      { kind: "example", body: "Instead of writing 'jump' 10 times, a loop can say 'repeat 10 times: jump'.", visual: "code" },
      { kind: "tip", body: "Loops save time and make programs shorter and easier to read." },
    ],
    quiz: [
      { kind: "mcq", q: "What does a loop do?", choices: ["Stops the program", "Repeats instructions", "Deletes code", "Prints once"], answer: 1 },
      { kind: "fill", q: "A loop that repeats 'step' 5 times is called a ____ loop.", answer: "repeat", hint: "It repeats" },
    ],
  },

  // ── Social Studies ────────────────────────────────────────
  {
    chapterId: "ss-geo", subjectId: "ss", id: "ss-geo-3", title: "Continents & oceans", mins: 5,
    slides: [
      { kind: "intro", body: "Earth's land is divided into 7 continents, and its water into 5 oceans." },
      { kind: "example", body: "Asia is the biggest continent; the Pacific is the biggest ocean. Nepal is in Asia.", visual: "globe" },
      { kind: "tip", body: "Remember the oceans: Pacific, Atlantic, Indian, Southern and Arctic." },
    ],
    quiz: [
      { kind: "mcq", q: "Which continent is Nepal part of?", choices: ["Africa", "Europe", "Asia", "Australia"], answer: 2 },
      { kind: "tf", q: "There are 7 continents on Earth.", answer: true },
    ],
  },
  {
    chapterId: "ss-history", subjectId: "ss", id: "ss-history-2", title: "Ancient civilizations", mins: 5,
    slides: [
      { kind: "intro", body: "Ancient civilizations were the first great societies - they invented writing, cities and laws." },
      { kind: "example", body: "The ancient Egyptians built pyramids and wrote with hieroglyphs. The Indus Valley people lived nearby.", visual: "pyramid" },
      { kind: "tip", body: "Studying the past helps us understand how our own society developed." },
    ],
    quiz: [
      { kind: "mcq", q: "Who built the pyramids?", choices: ["Ancient Greeks", "Ancient Egyptians", "Romans", "Vikings"], answer: 1 },
      { kind: "tf", q: "The Indus Valley was one of the earliest civilizations.", answer: true },
    ],
  },

  // ── Nepali ────────────────────────────────────────────────
  {
    chapterId: "nep-vyakaran", subjectId: "nep", id: "nep-vyakaran-2", title: "Sanskriti ra parampara (Culture & tradition)", mins: 4,
    slides: [
      { kind: "intro", body: "Nepal is rich in culture and tradition - festivals, music and customs vary across communities." },
      { kind: "example", body: "Dashain and Tihar are two of the biggest festivals celebrated across the country.", visual: "festival" },
      { kind: "tip", body: "Respecting different cultures makes our society stronger and more united." },
    ],
    quiz: [
      { kind: "mcq", q: "Which are major Nepali festivals?", choices: ["Christmas and Easter", "Dashain and Tihar", "Lunar New Year only", "None"], answer: 1 },
      { kind: "tf", q: "Nepal has only one culture and tradition.", answer: false },
    ],
  },

  // ── Health ────────────────────────────────────────────────
  {
    chapterId: "health-nutrition", subjectId: "health", id: "health-nutrition-3", title: "Healthy habits", mins: 4,
    slides: [
      { kind: "intro", body: "Healthy habits - eating well, sleeping and exercising - keep your body and mind strong." },
      { kind: "example", body: "Drinking water, eating vegetables and getting 8 hours of sleep help you focus at school.", visual: "apple" },
      { kind: "tip", body: "Small daily habits add up to big health benefits over time." },
    ],
    quiz: [
      { kind: "mcq", q: "Which is a healthy habit?", choices: ["Staying up very late", "Drinking lots of sugary soda", "Eating vegetables daily", "Skipping breakfast"], answer: 2 },
      { kind: "tf", q: "Sleep helps your brain and body recover.", answer: true },
    ],
  },
];

async function main() {
  console.log("🌱 Adding more lessons (additive - no wipe)...\n");
  let added = 0;
  let skipped = 0;
  for (const l of NEW_LESSONS) {
    const chapter = await prisma.chapter.findUnique({ where: { id: l.chapterId } });
    if (!chapter) { console.log(`  ⏭  Skip ${l.id}: chapter ${l.chapterId} missing`); skipped++; continue; }
    const existing = await prisma.lesson.findUnique({ where: { id: l.id } });
    const order = existing ? existing.order : (await prisma.lesson.count({ where: { chapterId: l.chapterId } })) + 1;
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: { title: l.title, mins: l.mins, slides: JSON.stringify(l.slides), quiz: JSON.stringify(l.quiz) },
      create: { id: l.id, title: l.title, mins: l.mins, order, chapterId: l.chapterId, subjectId: l.subjectId, slides: JSON.stringify(l.slides), quiz: JSON.stringify(l.quiz) },
    });
    console.log(`  ✅ ${l.id}: ${l.title} (${l.quiz.length} questions)`);
    added++;
  }
  console.log(`\nDone: added/updated ${added} lessons, skipped ${skipped}.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
