// Database initialization and synthetic demographic seeder.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Badge Definitions ─────────────────────────────────────
const BADGES = [
  { id: "first_steps",    name: "First Steps",    desc: "Complete your first lesson",        icon: "🌱" },
  { id: "streak_3",       name: "On a Roll",       desc: "3-day learning streak",             icon: "🔥" },
  { id: "streak_7",       name: "Week Warrior",    desc: "7-day learning streak",             icon: "🏆" },
  { id: "streak_30",      name: "Monthly Legend",  desc: "30-day learning streak",            icon: "💫" },
  { id: "perfectionist",  name: "Perfectionist",   desc: "Score 100% on 3 quizzes",           icon: "💎" },
  { id: "math_master",    name: "Math Master",     desc: "Finish every Math lesson",          icon: "📐" },
  { id: "sci_master",     name: "Science Sage",    desc: "Finish every Science lesson",        icon: "🧪" },
  { id: "eng_master",     name: "Word Wizard",     desc: "Finish every English lesson",        icon: "📚" },
  { id: "focused_mind",   name: "Focused Mind",    desc: "Complete a 25-min focus session",   icon: "🌳" },
  { id: "early_bird",     name: "Early Bird",      desc: "Study before 9am",                  icon: "🐦" },
  { id: "night_owl",      name: "Night Owl",       desc: "Study after 9pm",                   icon: "🦉" },
  { id: "century",        name: "Century",         desc: "Earn 500 XP total",                 icon: "💯" },
  { id: "xp_thousand",    name: "XP Champion",     desc: "Earn 1000 XP total",                icon: "🏅" },
  { id: "five_streak",    name: "Consistent",      desc: "Study 5 days in a row",             icon: "📅" },
  { id: "ten_lessons",    name: "Dedicated",       desc: "Complete 10 lessons",               icon: "🎯" },
];

// ── Curriculum Data ───────────────────────────────────────
const CURRICULUM = [
  {
    id: "math", name: "Mathematics", color: "#F59E0B", icon: "fx", blurb: "Numbers, shapes & patterns",
    chapters: [
      {
        id: "m-frac", title: "Fractions", order: 1,
        lessons: [
          {
            id: "m-frac-1", title: "What is a fraction?", mins: 4, order: 1,
            slides: [
              { kind: "intro", body: "A fraction shows a part of a whole. The top number (numerator) counts the parts you have. The bottom number (denominator) shows how many parts the whole is split into." },
              { kind: "example", body: "Imagine a pizza cut into 4 equal slices. If you eat 1 slice, you've eaten 1/4 of the pizza.", visual: "pizza" },
              { kind: "tip", body: "When the numerator and denominator are equal (like 4/4), the fraction equals 1 - a whole." },
            ],
            quiz: [
              { kind: "mcq", q: "A cake is cut into 8 equal slices. You eat 3. What fraction did you eat?", choices: ["3/5", "3/8", "8/3", "5/8"], answer: 1 },
              { kind: "tf", q: "The denominator is the number on top of the fraction.", answer: false },
              { kind: "fill", q: "Fill in: 6/6 equals ____.", answer: "1", hint: "A whole" },
            ],
          },
          {
            id: "m-frac-2", title: "Adding fractions", mins: 5, order: 2,
            slides: [
              { kind: "intro", body: "To add fractions with the same denominator, add the numerators and keep the denominator the same." },
              { kind: "example", body: "1/5 + 2/5 = 3/5. The bottom number stays as 5.", visual: "blocks" },
              { kind: "tip", body: "If denominators are different, you'll need to find a common denominator first - coming up next!" },
            ],
            quiz: [
              { kind: "mcq", q: "What is 2/7 + 3/7?", choices: ["5/14", "6/7", "5/7", "1/7"], answer: 2 },
              { kind: "mcq", q: "What is 1/4 + 1/4?", choices: ["2/8", "1/2", "1/8", "2/4 only"], answer: 1 },
              { kind: "tf", q: "When adding fractions with the same denominator, you add both the tops and bottoms.", answer: false },
            ],
          },
          {
            id: "m-frac-3", title: "Comparing fractions", mins: 4, order: 3,
            slides: [
              { kind: "intro", body: "When fractions share a denominator, the one with the larger numerator is bigger." },
              { kind: "example", body: "5/8 is bigger than 3/8 because 5 > 3 and the slices are the same size." },
              { kind: "tip", body: "When denominators differ, smaller denominator = bigger slices." },
            ],
            quiz: [
              { kind: "mcq", q: "Which is bigger?", choices: ["3/10", "7/10", "1/10", "Equal"], answer: 1 },
              { kind: "mcq", q: "Which is bigger: 1/2 or 1/4?", choices: ["1/4", "1/2", "Equal", "Cannot tell"], answer: 1 },
            ],
          },
        ],
      },
      {
        id: "m-algebra", title: "Algebra Basics", order: 2,
        lessons: [
          {
            id: "m-alg-1", title: "What is a variable?", mins: 4, order: 1,
            slides: [
              { kind: "intro", body: "A variable is a letter (like x or y) that stands in for a number we don't yet know." },
              { kind: "example", body: "In x + 3 = 7, the variable x has the value 4, because 4 + 3 = 7." },
              { kind: "tip", body: "You can choose any letter, but x is the most common." },
            ],
            quiz: [
              { kind: "mcq", q: "If x + 5 = 12, what is x?", choices: ["5", "7", "12", "17"], answer: 1 },
              { kind: "fill", q: "If y - 4 = 10, then y = ____.", answer: "14" },
              { kind: "tf", q: "A variable always equals 0.", answer: false },
            ],
          },
          {
            id: "m-alg-2", title: "Solving simple equations", mins: 5, order: 2,
            slides: [
              { kind: "intro", body: "To solve an equation, do the same thing on both sides to keep it balanced." },
              { kind: "example", body: "2x = 10 → divide both sides by 2 → x = 5." },
              { kind: "tip", body: "Always check your answer by plugging it back in." },
            ],
            quiz: [
              { kind: "mcq", q: "Solve: 3x = 18", choices: ["x = 3", "x = 6", "x = 18", "x = 21"], answer: 1 },
              { kind: "fill", q: "Solve: x + 8 = 20. x = ____.", answer: "12" },
            ],
          },
        ],
      },
      {
        id: "m-geom", title: "Geometry", order: 3,
        lessons: [
          {
            id: "m-geom-1", title: "What is a shape?", mins: 4, order: 1,
            slides: [
              { kind: "intro", body: "Shapes are everywhere! A shape is defined by its sides and corners (vertices)." },
              { kind: "example", body: "A triangle has 3 sides and 3 corners. A square has 4 equal sides and 4 corners.", visual: "shapes" },
              { kind: "tip", body: "The word 'geometry' comes from Greek - 'geo' (earth) and 'metron' (measure)." },
            ],
            quiz: [
              { kind: "mcq", q: "How many sides does a triangle have?", choices: ["2", "3", "4", "5"], answer: 1 },
              { kind: "tf", q: "A square has 5 sides.", answer: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "sci", name: "Science", color: "#10B981", icon: "🧪", blurb: "Explore the world around you",
    chapters: [
      {
        id: "s-plants", title: "Plants", order: 1,
        lessons: [
          {
            id: "s-plants-1", title: "Parts of a plant", mins: 4, order: 1,
            slides: [
              { kind: "intro", body: "A plant has four main parts: roots, stem, leaves, and flowers. Each part has a special job." },
              { kind: "example", body: "Roots anchor the plant and drink water from the soil. Leaves make food using sunlight.", visual: "plant" },
              { kind: "tip", body: "The stem is like a highway - it carries water and nutrients between roots and leaves." },
            ],
            quiz: [
              { kind: "mcq", q: "Which part of a plant absorbs water from the soil?", choices: ["Leaves", "Stem", "Roots", "Flowers"], answer: 2 },
              { kind: "tf", q: "Leaves make food for the plant using sunlight.", answer: true },
            ],
          },
          {
            id: "s-plants-2", title: "Photosynthesis", mins: 5, order: 2,
            slides: [
              { kind: "intro", body: "Photosynthesis is how plants make their own food using sunlight, water, and carbon dioxide." },
              { kind: "example", body: "A leaf uses sunlight to turn water and CO₂ into glucose (food) and oxygen.", visual: "photosynthesis" },
              { kind: "tip", body: "The word 'photosynthesis' means 'putting together with light'." },
            ],
            quiz: [
              { kind: "mcq", q: "What gas do plants release during photosynthesis?", choices: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], answer: 1 },
              { kind: "tf", q: "Photosynthesis happens only at night.", answer: false },
            ],
          },
        ],
      },
      {
        id: "s-forces", title: "Forces", order: 2,
        lessons: [
          {
            id: "s-forces-1", title: "Push and pull", mins: 4, order: 1,
            slides: [
              { kind: "intro", body: "A force is a push or a pull. Forces make things move, stop, or change direction." },
              { kind: "example", body: "Kicking a ball (push), opening a door (pull), riding a bicycle (push on pedals).", visual: "forces" },
              { kind: "tip", body: "Gravity is a force that pulls everything toward Earth." },
            ],
            quiz: [
              { kind: "mcq", q: "What is a force?", choices: ["A color", "A push or a pull", "A type of food", "A sound"], answer: 1 },
              { kind: "tf", q: "Gravity pulls things upward.", answer: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "eng", name: "English", color: "#8B5CF6", icon: "📚", blurb: "Words, grammar & stories",
    chapters: [
      {
        id: "e-grammar", title: "Grammar", order: 1,
        lessons: [
          {
            id: "e-gram-1", title: "Nouns and verbs", mins: 4, order: 1,
            slides: [
              { kind: "intro", body: "Nouns are naming words (person, place, thing). Verbs are doing words (action)." },
              { kind: "example", body: "In 'The cat runs', 'cat' is a noun and 'runs' is a verb.", visual: "word-types" },
              { kind: "tip", body: "Every complete sentence must have at least one noun and one verb." },
            ],
            quiz: [
              { kind: "mcq", q: "Which word is a noun?", choices: ["Run", "Happy", "Dog", "Quickly"], answer: 2 },
              { kind: "tf", q: "'Swim' is a verb.", answer: true },
            ],
          },
          {
            id: "e-gram-2", title: "Adjectives", mins: 4, order: 2,
            slides: [
              { kind: "intro", body: "An adjective describes a noun. It tells you more about a person, place, or thing." },
              { kind: "example", body: "In 'The red balloon floated away', 'red' is the adjective describing the balloon." },
              { kind: "tip", body: "Adjectives answer: What kind? Which one? How many?" },
            ],
            quiz: [
              { kind: "mcq", q: "Which word is an adjective?", choices: ["Table", "Beautiful", "Eat", "Quickly"], answer: 1 },
              { kind: "fill", q: "In 'The ____ dog barked loudly', add an adjective.", answer: "big", hint: "Any describing word works" },
            ],
          },
        ],
      },
      {
        id: "e-vocab", title: "Vocabulary", order: 2,
        lessons: [
          {
            id: "e-vocab-1", title: "Synonyms", mins: 3, order: 1,
            slides: [
              { kind: "intro", body: "Synonyms are words that mean the same or nearly the same thing." },
              { kind: "example", body: "Happy = Glad, Big = Large, Fast = Quick.", visual: "synonyms" },
              { kind: "tip", body: "Using synonyms makes your writing more interesting!" },
            ],
            quiz: [
              { kind: "mcq", q: "Which is a synonym for 'happy'?", choices: ["Sad", "Angry", "Glad", "Tired"], answer: 2 },
              { kind: "mcq", q: "Which is a synonym for 'fast'?", choices: ["Slow", "Quick", "Heavy", "Old"], answer: 1 },
            ],
          },
        ],
      },
    ],
  },
  // ── New: Computer Science ─────────────────────────────
  {
    id: "cs", name: "Computer Science", color: "#3B82F6", icon: "💻", blurb: "Code, logic & digital skills",
    chapters: [
      {
        id: "cs-basics", title: "Computer Basics", order: 1,
        lessons: [
          {
            id: "cs-basics-1", title: "What is a computer?", mins: 4, order: 1,
            slides: [
              { kind: "intro", body: "A computer is an electronic device that processes data and performs tasks according to instructions." },
              { kind: "example", body: "Desktop computers, laptops, tablets, and smartphones are all types of computers.", visual: "devices" },
              { kind: "tip", body: "The word 'computer' originally meant a person who performed calculations!" },
            ],
            quiz: [
              { kind: "mcq", q: "What does a computer process?", choices: ["Food", "Data", "Water", "Plants"], answer: 1 },
              { kind: "tf", q: "A smartphone is a type of computer.", answer: true },
            ],
          },
          {
            id: "cs-basics-2", title: "Parts of a computer", mins: 5, order: 2,
            slides: [
              { kind: "intro", body: "A computer has hardware (physical parts) and software (programs)." },
              { kind: "example", body: "The monitor shows information, the keyboard types, the CPU processes.", visual: "hardware" },
              { kind: "tip", body: "The CPU is like the 'brain' of the computer." },
            ],
            quiz: [
              { kind: "mcq", q: "Which part is the 'brain' of the computer?", choices: ["Monitor", "Keyboard", "CPU", "Mouse"], answer: 2 },
              { kind: "mcq", q: "Is software physical or digital?", choices: ["Physical", "Digital", "Both", "Neither"], answer: 1 },
            ],
          },
        ],
      },
      {
        id: "cs-coding", title: "Introduction to Coding", order: 2,
        lessons: [
          {
            id: "cs-code-1", title: "What is code?", mins: 5, order: 1,
            slides: [
              { kind: "intro", body: "Code is a set of instructions that tells a computer what to do." },
              { kind: "example", body: "print('Hello World!') is a simple instruction in Python that displays text.", visual: "code-example" },
              { kind: "tip", body: "There are many programming languages: Python, JavaScript, Scratch and more!" },
            ],
            quiz: [
              { kind: "mcq", q: "What is code?", choices: ["A secret", "Instructions for a computer", "A game", "A website"], answer: 1 },
              { kind: "tf", q: "Python is a programming language.", answer: true },
            ],
          },
        ],
      },
    ],
  },
  // ── New: Social Studies ──────────────────────────────
  {
    id: "ss", name: "Social Studies", color: "#EF4444", icon: "🌍", blurb: "People, places & cultures",
    chapters: [
      {
        id: "ss-geo", title: "Geography", order: 1,
        lessons: [
          {
            id: "ss-geo-1", title: "Continents and oceans", mins: 4, order: 1,
            slides: [
              { kind: "intro", body: "Earth has 7 continents and 5 oceans. Each continent has many countries." },
              { kind: "example", body: "Asia is the largest continent. The Pacific Ocean is the largest ocean.", visual: "world-map" },
              { kind: "tip", body: "Nepal is in Asia, between China and India." },
            ],
            quiz: [
              { kind: "mcq", q: "How many continents are there?", choices: ["5", "6", "7", "8"], answer: 2 },
              { kind: "tf", q: "The Pacific Ocean is the largest ocean.", answer: true },
            ],
          },
          {
            id: "ss-geo-2", title: "Nepal: Our country", mins: 5, order: 2,
            slides: [
              { kind: "intro", body: "Nepal is a beautiful country in South Asia with diverse geography from mountains to plains." },
              { kind: "example", body: "Mount Everest, the world's tallest peak, is in Nepal at 8,848 meters.", visual: "nepal-map" },
              { kind: "tip", body: "Nepal's flag is the only national flag that is not rectangular!" },
            ],
            quiz: [
              { kind: "mcq", q: "What is the capital of Nepal?", choices: ["Pokhara", "Kathmandu", "Lalitpur", "Biratnagar"], answer: 1 },
              { kind: "mcq", q: "Which is the tallest mountain in the world?", choices: ["K2", "Everest", "Annapurna", "Kangchenjunga"], answer: 1 },
            ],
          },
        ],
      },
      {
        id: "ss-history", title: "History", order: 2,
        lessons: [
          {
            id: "ss-hist-1", title: "Ancient civilizations", mins: 4, order: 1,
            slides: [
              { kind: "intro", body: "Ancient civilizations like Egypt, Mesopotamia, and the Indus Valley shaped human history." },
              { kind: "example", body: "The Indus Valley Civilization flourished in parts of modern-day Nepal, India, and Pakistan.", visual: "ancient" },
              { kind: "tip", body: "Writing was invented around 3200 BCE in Mesopotamia." },
            ],
            quiz: [
              { kind: "mcq", q: "Where was the Indus Valley Civilization?", choices: ["Europe", "South Asia", "Africa", "Australia"], answer: 1 },
              { kind: "tf", q: "Ancient Egypt built pyramids.", answer: true },
            ],
          },
        ],
      },
    ],
  },
  // ── New: Nepali ─────────────────────────────────────
  {
    id: "nep", name: "Nepali", color: "#DC2626", icon: "🇳🇵", blurb: "Nepali bhasa, sahitya ra vyakaran",
    chapters: [
      {
        id: "nep-vyakaran", title: "Vyakaran (Grammar)", order: 1,
        lessons: [
          {
            id: "nep-vy-1", title: "Shabda ra Vakya", mins: 4, order: 1,
            slides: [
              { kind: "intro", body: "Shabda bhaneko artha bhayeko dhwani ho. Vakya shabdaharuko samuha ho." },
              { kind: "example", body: "'Kalam' eu shabda ho. 'Yo kalam ho' eu vakya ho.", visual: "nepali-text" },
              { kind: "tip", body: "Shabdalai varnama lekhincha." },
            ],
            quiz: [
              { kind: "mcq", q: "'Kalam' ke ho?", choices: ["Vakya", "Shabda", "Varn", "Dhwani"], answer: 1 },
              { kind: "tf", q: "Vakya shabdaharuko samuha ho.", answer: true },
            ],
          },
        ],
      },
    ],
  },
  // ── New: Health & Physical Education ────────────────
  {
    id: "health", name: "Health & PE", color: "#10B981", icon: "🏃", blurb: "Body, mind & wellness",
    chapters: [
      {
        id: "health-nutrition", title: "Nutrition & Diet", order: 1,
        lessons: [
          {
            id: "health-nut-1", title: "Food groups", mins: 4, order: 1,
            slides: [
              { kind: "intro", body: "Food gives us energy. There are different food groups: grains, proteins, fruits, vegetables, and dairy." },
              { kind: "example", body: "Rice gives energy (carbohydrates), fish builds muscles (protein), fruits give vitamins.", visual: "food-pyramid" },
              { kind: "tip", body: "Eating a rainbow of fruits and vegetables ensures you get all vitamins!" },
            ],
            quiz: [
              { kind: "mcq", q: "Which food group gives you the most energy?", choices: ["Fruits", "Grains", "Dairy", "Sweets"], answer: 1 },
              { kind: "tf", q: "Fish is a good source of protein.", answer: true },
            ],
          },
          {
            id: "health-nut-2", title: "Healthy habits", mins: 4, order: 2,
            slides: [
              { kind: "intro", body: "Healthy habits include eating well, exercising, sleeping enough, and staying clean." },
              { kind: "example", body: "Wash your hands before eating, brush teeth twice daily, exercise for 30 minutes.", visual: "habits" },
              { kind: "tip", body: "Drink at least 8 glasses of water every day!" },
            ],
            quiz: [
              { kind: "mcq", q: "How many hours of sleep do children need?", choices: ["4-5", "6-7", "9-11", "12-14"], answer: 2 },
              { kind: "tf", q: "Hand washing helps prevent diseases.", answer: true },
            ],
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // ── 1. Clear existing data ───────────────────────────────
  await prisma.assignment.deleteMany();
  await prisma.feedEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();
  await prisma.badge.deleteMany();

  // ── 2. Seed Badges ───────────────────────────────────────
  for (const badge of BADGES) {
    await prisma.badge.create({ data: badge });
  }
  console.log(`  ✅ ${BADGES.length} badges created`);

  // ── 3. Seed Curriculum ───────────────────────────────────
  for (const subjectData of CURRICULUM) {
    const subject = await prisma.subject.create({
      data: { id: subjectData.id, name: subjectData.name, color: subjectData.color, icon: subjectData.icon, blurb: subjectData.blurb },
    });

    for (const chapterData of subjectData.chapters) {
      const chapter = await prisma.chapter.create({
        data: { id: chapterData.id, title: chapterData.title, order: chapterData.order, subjectId: subject.id },
      });

      for (const lessonData of chapterData.lessons) {
        await prisma.lesson.create({
          data: {
            id: lessonData.id,
            title: lessonData.title,
            mins: lessonData.mins,
            order: lessonData.order,
            chapterId: chapter.id,
            subjectId: subject.id,
            slides: JSON.stringify(lessonData.slides),
            quiz: JSON.stringify(lessonData.quiz),
          },
        });
      }
      console.log(`  ✅ Chapter "${chapterData.title}" - ${chapterData.lessons.length} lessons`);
    }
  }
  console.log(`  ✅ Curriculum seeded (${CURRICULUM.length} subjects)`);

  // ── 4. Seed Schools ──────────────────────────────────────
  const school1 = await prisma.school.create({
    data: { id: "sch_galaxy", name: "Galaxy Academy", city: "Lalitpur", color: "#3B82F6", motto: "Reach for the stars" },
  });
  const school2 = await prisma.school.create({
    data: { id: "sch_himalaya", name: "Himalaya Public School", city: "Kathmandu", color: "#10B981", motto: "Rise & learn" },
  });
  console.log("  ✅ 2 schools created");

  // ── 5. Seed Users ────────────────────────────────────────
  const password = await bcrypt.hash("password123", 12);

  // Super Admin
  const su = await prisma.user.create({
    data: { id: "u_superadmin", email: "ceo@academia.io", password, name: "Dr. R. Sharma", role: "super_admin", avatar: "hat" },
  });
  console.log(`  ✅ Super Admin: ceo@academia.io / password123`);

  // School 1: Galaxy Academy
  const admin1 = await prisma.user.create({
    data: { id: "u_admin_galaxy", email: "anita@galaxy.edu", password, name: "Anita Pradhan", role: "admin", avatar: "owl", schoolId: school1.id },
  });
  const teacher1a = await prisma.user.create({
    data: { id: "u_t_galaxy_1", email: "prakash@galaxy.edu", password, name: "Prakash Joshi", role: "teacher", avatar: "bear", schoolId: school1.id },
  });
  const teacher1b = await prisma.user.create({
    data: { id: "u_t_galaxy_2", email: "maya@galaxy.edu", password, name: "Maya Tamang", role: "teacher", avatar: "cat", schoolId: school1.id },
  });

  // School 2: Himalaya
  const admin2 = await prisma.user.create({
    data: { id: "u_admin_himalaya", email: "suman@himalaya.edu", password, name: "Suman KC", role: "admin", avatar: "fox", schoolId: school2.id },
  });
  const teacher2 = await prisma.user.create({
    data: { id: "u_t_himalaya_1", email: "bibek@himalaya.edu", password, name: "Bibek Rai", role: "teacher", avatar: "frog", schoolId: school2.id },
  });

  // ── Students ───────────────────────────────────────────
  const studentsGalaxy = [
    { id: "u_s_g1", name: "Aarav Shrestha", xp: 480, streak: 4, pq: 4, gr: "Grade 6", av: "panda", lessons: ["m-frac-1", "m-frac-2", "s-plants-1", "e-gram-1"] },
    { id: "u_s_g2", name: "Sita Karki", xp: 720, streak: 9, pq: 6, gr: "Grade 6", av: "unicorn", lessons: ["m-frac-1", "m-frac-2", "m-frac-3", "s-plants-1", "s-plants-2", "e-gram-1"] },
    { id: "u_s_g3", name: "Rahul Adhikari", xp: 220, streak: 2, pq: 1, gr: "Grade 6", av: "monkey", lessons: ["m-frac-1", "e-gram-1"] },
    { id: "u_s_g4", name: "Priya Tamang", xp: 1140, streak: 14, pq: 9, gr: "Grade 7", av: "bunny", lessons: ["m-frac-1", "m-frac-2", "m-frac-3", "m-alg-1", "m-alg-2", "s-plants-1", "s-plants-2", "s-forces-1", "e-gram-1", "e-gram-2"] },
    { id: "u_s_g5", name: "Bishnu Lama", xp: 320, streak: 3, pq: 2, gr: "Grade 7", av: "penguin", lessons: ["m-frac-1", "m-frac-2", "e-gram-1"] },
    { id: "u_s_g6", name: "Anjana Rai", xp: 890, streak: 12, pq: 7, gr: "Grade 6", av: "frog", lessons: ["m-frac-1", "m-frac-2", "m-frac-3", "s-plants-1", "e-gram-1", "e-gram-2", "cs-basics-1"] },
    { id: "u_s_g7", name: "Kiran Thapa", xp: 1560, streak: 21, pq: 12, gr: "Grade 7", av: "owl", lessons: ["m-frac-1", "m-frac-2", "m-frac-3", "m-alg-1", "m-alg-2", "m-geom-1", "s-plants-1", "s-plants-2", "s-forces-1", "e-gram-1", "e-gram-2", "e-vocab-1", "cs-basics-1", "cs-basics-2"] },
    { id: "u_s_g8", name: "Samjhana BK", xp: 110, streak: 1, pq: 0, gr: "Grade 8", av: "cat", lessons: ["m-frac-1"] },
    { id: "u_s_g9", name: "Roshan GC", xp: 670, streak: 7, pq: 5, gr: "Grade 8", av: "bear", lessons: ["m-frac-1", "m-frac-2", "s-plants-1", "e-gram-1", "cs-basics-1"] },
    { id: "u_s_g10", name: "Mina Pun", xp: 430, streak: 5, pq: 3, gr: "Grade 6", av: "dog", lessons: ["m-frac-1", "m-frac-2", "e-gram-1", "ss-geo-1"] },
  ];

  const studentsHimalaya = [
    { id: "u_s_h1", name: "Nisha Magar", xp: 540, streak: 6, pq: 5, gr: "Grade 5", av: "fox", lessons: ["m-frac-1", "m-frac-2", "s-plants-1", "e-gram-1", "e-vocab-1"] },
    { id: "u_s_h2", name: "Dipesh Khadka", xp: 880, streak: 11, pq: 7, gr: "Grade 5", av: "dog", lessons: ["m-frac-1", "m-frac-2", "m-frac-3", "s-plants-1", "s-plants-2", "e-gram-1", "e-vocab-1"] },
    { id: "u_s_h3", name: "Sneha Gurung", xp: 180, streak: 1, pq: 1, gr: "Grade 5", av: "cat", lessons: ["m-frac-1"] },
    { id: "u_s_h4", name: "Mohan BK", xp: 1340, streak: 18, pq: 10, gr: "Grade 5", av: "monkey", lessons: ["m-frac-1", "m-frac-2", "m-frac-3", "s-plants-1", "s-plants-2", "s-forces-1", "e-gram-1", "e-vocab-1", "cs-basics-1", "cs-basics-2"] },
    { id: "u_s_h5", name: "Sabina Tamang", xp: 260, streak: 3, pq: 2, gr: "Grade 4", av: "bunny", lessons: ["m-frac-1", "s-plants-1", "e-gram-1"] },
    { id: "u_s_h6", name: "Krishna Pariyar", xp: 600, streak: 8, pq: 4, gr: "Grade 4", av: "penguin", lessons: ["m-frac-1", "m-frac-2", "s-plants-1", "e-gram-1", "ss-geo-1"] },
  ];

  const todayKey = new Date().toISOString().split("T")[0];
  const allGalaxy = [...studentsGalaxy];
  const allHimalaya = [...studentsHimalaya];

  async function createStudent(s: any, schoolId: string, schoolPrefix: string) {
    const email = `${s.name.split(" ")[0].toLowerCase()}.${s.id}@${schoolPrefix}.edu`;
    const gradeNum = parseInt(s.gr.replace(/\D/g, ""), 10) || 6;
    let cls = await prisma.class.findFirst({ where: { schoolId, grade: gradeNum } });
    if (!cls) {
      cls = await prisma.class.create({
        data: { name: `Grade ${gradeNum}`, grade: gradeNum, section: "A", schoolId }
      });
    }

    const user = await prisma.user.create({
      data: {
        id: s.id, email, password, name: s.name, role: "student", avatar: s.av,
        schoolId, classId: cls.id, grade: s.gr, xp: s.xp, streak: s.streak, perfectQuizzes: s.pq,
        lastActiveDate: todayKey, streakDays: JSON.stringify([]),
        todayXp: JSON.stringify({}),
      },
    });

    const allLessonIds = await prisma.lesson.findMany({ select: { id: true } });
    const availableIds = allLessonIds.map(l => l.id);

    for (const lessonId of s.lessons) {
      if (availableIds.includes(lessonId)) {
        const score = Math.floor(Math.random() * 2) + s.pq > 3 ? Math.floor(Math.random() * 2) + 3 : Math.floor(Math.random() * 3) + 1;
        const total = 3;
        const daysAgo = Math.floor(Math.random() * 14);
        const d = new Date(); d.setDate(d.getDate() - daysAgo);
        const xpEarned = score * 10 + 50 + (score === total ? 25 : 0);
        await prisma.lessonProgress.create({
          data: {
            userId: s.id, lessonId, score, total, perfect: score === total,
            xpEarned,
            completedAt: d,
          },
        });
        // Create interaction logs for ML diagnostics
        await prisma.interactionLog.create({
          data: {
            userId: s.id,
            kind: "quiz_attempt",
            metadata: JSON.stringify({ lessonId, score, total }),
            createdAt: d
          }
        });
      }
    }

    // Seeding notifications for primary students
    await prisma.notification.createMany({
      data: [
        { userId: s.id, kind: "announcement", title: "Welcome back!", body: "Hi student, get ready to study and earn badges!", read: false },
        { userId: s.id, kind: "streak", title: "Streak Milestones 🔥", body: "Complete daily lessons to earn streak rewards.", read: true },
      ]
    });

    // Seed general login events
    for (let day = 0; day < 10; day++) {
      if (Math.random() > 0.3) {
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - day);
        await prisma.interactionLog.create({
          data: {
            userId: s.id,
            kind: "login",
            metadata: JSON.stringify({ device: "Web App" }),
            createdAt: logDate
          }
        });
      }
    }

    return user;
  }

  for (const s of allGalaxy) { await createStudent(s, school1.id, "galaxy"); }
  for (const s of allHimalaya) { await createStudent(s, school2.id, "himalaya"); }
  console.log(`  ✅ ${allGalaxy.length + allHimalaya.length} base students created`);

  // ── 6. Generate 160+ Synthetic Students with Growth Logs ──────
  const firstNames = ["Aarav", "Sita", "Rahul", "Priya", "Bishnu", "Anjana", "Kiran", "Samjhana", "Roshan", "Mina", "Nisha", "Dipesh", "Sneha", "Mohan", "Sabina", "Krishna", "Arjun", "Puja", "Ramesh", "Saraswati", "Ganesh", "Laxmi", "Hari", "Savitri", "Ram", "Janaki", "Bhim", "Kunti", "Yubaraj", "Sharmila", "Pradip", "Gita", "Sanjay", "Rupa", "Sunil", "Manju", "Bibek", "Alisha", "Sandip", "Kriti", "Rajesh", "Kalpana", "Dinesh", "Sujata", "Prakash", "Maya", "Suman", "Niranjan", "Kabita", "Pramod", "Sarita", "Anil", "Reema", "Sujan", "Sunita"];
  const lastNames = ["Shrestha", "Karki", "Adhikari", "Tamang", "Lama", "Rai", "Thapa", "BK", "GC", "Pun", "Magar", "Khadka", "Gurung", "Pariyar", "Maharjan", "KC", "Joshi", "Bhattarai", "Gautam", "Pandey", "Dahal", "Bhandari", "Basnet", "Acharya", "Baral", "Chhetri", "Giri", "Koirala", "Neupane", "Oli", "Panta", "Regmi", "Rimal", "Sapkota", "Subedi", "Wagle", "Upreti", "Devkota", "Ghimire"];
  const avatars = ["hat", "panda", "fox", "cat", "dog", "owl", "penguin", "bunny", "bear", "frog", "monkey", "unicorn"];
  const grades = ["Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"];

  const studentsToGenerate = 160;
  console.log(`🌱 Generating ${studentsToGenerate} synthetic students with 30-day learning histories...`);

  const dbLessons = await prisma.lesson.findMany({ select: { id: true, subjectId: true } });
  const dbLessonIds = dbLessons.map(l => l.id);

  for (let i = 1; i <= studentsToGenerate; i++) {
    const isGalaxy = i <= studentsToGenerate / 2;
    const schoolId = isGalaxy ? school1.id : school2.id;
    const schoolPrefix = isGalaxy ? "galaxy" : "himalaya";
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const id = `u_s_gen_${isGalaxy ? "g" : "h"}_${i}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@${schoolPrefix}.edu`;
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];
    const grade = grades[Math.floor(Math.random() * grades.length)];

    const gradeNum = parseInt(grade.replace(/\D/g, ""), 10) || 6;
    let cls = await prisma.class.findFirst({ where: { schoolId, grade: gradeNum } });
    if (!cls) {
      cls = await prisma.class.create({
        data: { name: `Grade ${gradeNum}`, grade: gradeNum, section: "A", schoolId }
      });
    }

    const engagementProfile = Math.random();
    let completionsCount = 5;
    if (engagementProfile > 0.8) completionsCount = 20 + Math.floor(Math.random() * 10);
    else if (engagementProfile > 0.4) completionsCount = 10 + Math.floor(Math.random() * 10);
    else completionsCount = 2 + Math.floor(Math.random() * 5);

    const chosenLessons = [...dbLessonIds].sort(() => Math.random() - 0.5).slice(0, completionsCount);

    let totalXp = 0;
    let perfectQuizzes = 0;
    let focusMinutes = completionsCount * 12 + Math.floor(Math.random() * 40);

    const user = await prisma.user.create({
      data: {
        id, email, password, name, role: "student", avatar,
        schoolId, classId: cls.id, grade, xp: 0,
        streak: engagementProfile > 0.3 ? Math.floor(Math.random() * 8) + 2 : 0,
        perfectQuizzes: 0, lastActiveDate: todayKey, streakDays: JSON.stringify([]),
        todayXp: JSON.stringify({}),
      }
    });

    for (let lIdx = 0; lIdx < chosenLessons.length; lIdx++) {
      const lessonId = chosenLessons[lIdx];
      const isPerfect = engagementProfile > 0.4 ? Math.random() > 0.3 : Math.random() > 0.7;
      const score = isPerfect ? 3 : Math.random() > 0.4 ? 2 : 1;
      const total = 3;
      if (isPerfect) perfectQuizzes++;

      const lessonXp = score * 10 + 50 + (isPerfect ? 25 : 0);
      totalXp += lessonXp;

      const daysAgo = Math.floor((1 - (lIdx / chosenLessons.length)) * 28) + Math.floor(Math.random() * 2);
      const completedAt = new Date();
      completedAt.setDate(completedAt.getDate() - daysAgo);

      await prisma.lessonProgress.create({
        data: {
          userId: id, lessonId, score, total, perfect: isPerfect, xpEarned: lessonXp, completedAt,
        }
      });

      // Create interaction logs for ML diagnostics
      await prisma.interactionLog.create({
        data: {
          userId: id,
          kind: "quiz_attempt",
          metadata: JSON.stringify({ lessonId, score, total }),
          createdAt: completedAt
        }
      });
    }

    const focusXp = focusMinutes * 2;
    totalXp += focusXp;

    await prisma.user.update({
      where: { id },
      data: {
        xp: totalXp,
        perfectQuizzes,
        focusMinutes,
        treesGrown: Math.floor(focusMinutes / 25),
      }
    });

    // Seeding notifications for synthetic students
    await prisma.notification.createMany({
      data: [
        { userId: id, kind: "announcement", title: "Monthly challenge starting!", body: "Earn 500 XP this month to unlock a rare frame!", read: false },
        { userId: id, kind: "badge", title: "First Steps Badge!", body: "Unlocked for completing your first lesson.", read: true },
      ]
    });

    // Seed general login events
    for (let day = 0; day < 12; day++) {
      if (Math.random() > 0.4) {
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - day);
        await prisma.interactionLog.create({
          data: {
            userId: id,
            kind: "login",
            metadata: JSON.stringify({ device: "Web App" }),
            createdAt: logDate
          }
        });
      }
    }
  }

  // Seed real assignments
  const days3 = new Date(); days3.setDate(days3.getDate() + 3);
  const days7 = new Date(); days7.setDate(days7.getDate() + 7);
  const classGalaxy = await prisma.class.findFirst({ where: { name: "Grade 6", schoolId: school1.id } });
  const classHimalaya = await prisma.class.findFirst({ where: { name: "Grade 5", schoolId: school2.id } });

  if (classGalaxy) {
    await prisma.assignment.create({
      data: {
        classId: classGalaxy.id,
        lessonId: "m-frac-3",
        assignedBy: teacher1a.id,
        dueAt: days3,
        note: "Quick check before quiz Friday."
      }
    });
  }
  if (classHimalaya) {
    await prisma.assignment.create({
      data: {
        classId: classHimalaya.id,
        lessonId: "s-plants-2",
        assignedBy: teacher2.id,
        dueAt: days7,
        note: "Review cellular respiration topics."
      }
    });
  }

  console.log(`  ✅ ${studentsToGenerate} synthetic students with growth history created`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("=".repeat(50));
  console.log("📋 Login Credentials:");
  console.log("   Super Admin: ceo@academia.io / password123");
  console.log("   Admin (Galaxy): anita@galaxy.edu / password123");
  console.log("   Teacher (Galaxy): prakash@galaxy.edu / password123");
  console.log("   Student (Galaxy): aarav@galaxy.edu / password123");
  console.log("   All users share the password: password123");
  console.log("=".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
