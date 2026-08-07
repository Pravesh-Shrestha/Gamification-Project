const CURRICULUM = [
  {
    id: "math",
    name: "Mathematics",
    color: "#F59E0B",
    accent: "#FEF3C7",
    icon: "fx",
    blurb: "Numbers, shapes & patterns",
    chapters: [
      {
        id: "m-frac",
        title: "Fractions",
        order: 1,
        lessons: [
          {
            id: "m-frac-1",
            title: "What is a fraction?",
            mins: 4,
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
            id: "m-frac-2",
            title: "Adding fractions",
            mins: 5,
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
            id: "m-frac-3",
            title: "Comparing fractions",
            mins: 4,
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
        id: "m-algebra",
        title: "Algebra Basics",
        order: 2,
        lessons: [
          {
            id: "m-alg-1",
            title: "What is a variable?",
            mins: 4,
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
            id: "m-alg-2",
            title: "Solving simple equations",
            mins: 5,
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
        id: "m-geom",
        title: "Geometry",
        order: 3,
        lessons: [
          {
            id: "m-geom-1",
            title: "Angles around us",
            mins: 4,
            slides: [
              { kind: "intro", body: "An angle is formed where two lines meet. We measure angles in degrees (°)." },
              { kind: "example", body: "A right angle is exactly 90° - like the corner of a book." },
              { kind: "tip", body: "Less than 90° is acute. More than 90° but less than 180° is obtuse." },
            ],
            quiz: [
              { kind: "mcq", q: "A right angle measures…", choices: ["45°", "90°", "180°", "360°"], answer: 1 },
              { kind: "tf", q: "An acute angle is bigger than a right angle.", answer: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "sci",
    name: "Science",
    color: "#3B82F6",
    accent: "#DBEAFE",
    icon: "lab",
    blurb: "How the world works",
    chapters: [
      {
        id: "s-plants",
        title: "Living Things",
        order: 1,
        lessons: [
          {
            id: "s-plants-1",
            title: "Parts of a plant",
            mins: 4,
            slides: [
              { kind: "intro", body: "Plants have roots, stem, leaves, flowers and fruits. Each part has a special job." },
              { kind: "example", body: "Roots hold the plant in soil and drink water. Leaves use sunlight to make food." },
              { kind: "tip", body: "This food-making process is called photosynthesis." },
            ],
            quiz: [
              { kind: "mcq", q: "Which part of the plant makes food?", choices: ["Roots", "Stem", "Leaves", "Flowers"], answer: 2 },
              { kind: "fill", q: "The process by which leaves make food is called ____.", answer: "photosynthesis" },
              { kind: "tf", q: "Roots grow above the ground.", answer: false },
            ],
          },
          {
            id: "s-plants-2",
            title: "Animals & habitats",
            mins: 4,
            slides: [
              { kind: "intro", body: "A habitat is the natural home of an animal - like a forest, river, or desert." },
              { kind: "example", body: "Polar bears live in the Arctic. Tigers live in forests. Fish live in water." },
              { kind: "tip", body: "Animals are adapted to their habitats - fur for cold, fins for water." },
            ],
            quiz: [
              { kind: "mcq", q: "Which animal is adapted to live in cold places?", choices: ["Camel", "Polar bear", "Snake", "Parrot"], answer: 1 },
              { kind: "tf", q: "Fish need water to breathe.", answer: true },
            ],
          },
        ],
      },
      {
        id: "s-forces",
        title: "Forces & Motion",
        order: 2,
        lessons: [
          {
            id: "s-forces-1",
            title: "Push, pull & gravity",
            mins: 5,
            slides: [
              { kind: "intro", body: "A force is a push or a pull. Forces make things move, stop, or change direction." },
              { kind: "example", body: "When you drop a ball, gravity pulls it down to the ground." },
              { kind: "tip", body: "Friction is a force that slows things down - like brakes on a bike." },
            ],
            quiz: [
              { kind: "mcq", q: "What force pulls a dropped apple downward?", choices: ["Friction", "Magnetism", "Gravity", "Wind"], answer: 2 },
              { kind: "fill", q: "A push or a pull is called a ____.", answer: "force" },
              { kind: "tf", q: "Friction makes objects move faster.", answer: false },
            ],
          },
        ],
      },
      {
        id: "s-space",
        title: "Our Solar System",
        order: 3,
        lessons: [
          {
            id: "s-space-1",
            title: "Planets in order",
            mins: 5,
            slides: [
              { kind: "intro", body: "Eight planets orbit the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune." },
              { kind: "example", body: "Earth is the third planet from the Sun. It's the only one known to have life." },
              { kind: "tip", body: "Mnemonic: 'My Very Educated Mother Just Served Us Noodles.'" },
            ],
            quiz: [
              { kind: "mcq", q: "Which planet is closest to the Sun?", choices: ["Earth", "Venus", "Mercury", "Mars"], answer: 2 },
              { kind: "mcq", q: "Earth is the ____ planet from the Sun.", choices: ["First", "Second", "Third", "Fourth"], answer: 2 },
              { kind: "tf", q: "Jupiter is smaller than Earth.", answer: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "eng",
    name: "English",
    color: "#A855F7",
    accent: "#EDE9FE",
    icon: "abc",
    blurb: "Words, grammar & stories",
    chapters: [
      {
        id: "e-gram",
        title: "Grammar",
        order: 1,
        lessons: [
          {
            id: "e-gram-1",
            title: "Nouns & verbs",
            mins: 4,
            slides: [
              { kind: "intro", body: "A noun names a person, place, animal or thing. A verb shows action." },
              { kind: "example", body: "In 'The dog runs', 'dog' is the noun and 'runs' is the verb." },
              { kind: "tip", body: "Verbs can also describe states - like 'is', 'feels', or 'thinks'." },
            ],
            quiz: [
              { kind: "mcq", q: "Which word is a noun?", choices: ["Quickly", "Mountain", "Jumped", "Bright"], answer: 1 },
              { kind: "mcq", q: "Which word is a verb?", choices: ["Tree", "Happy", "Sing", "Blue"], answer: 2 },
              { kind: "tf", q: "'Run' is a noun.", answer: false },
            ],
          },
          {
            id: "e-gram-2",
            title: "Tenses",
            mins: 5,
            slides: [
              { kind: "intro", body: "Tense tells us when an action happens - past, present or future." },
              { kind: "example", body: "Past: 'I walked.' Present: 'I walk.' Future: 'I will walk.'" },
              { kind: "tip", body: "Many past-tense verbs end in '-ed', but some change completely: go → went." },
            ],
            quiz: [
              { kind: "mcq", q: "What is the past tense of 'go'?", choices: ["Goed", "Went", "Going", "Gone"], answer: 1 },
              { kind: "fill", q: "Future of 'eat': I will ____.", answer: "eat" },
            ],
          },
        ],
      },
      {
        id: "e-vocab",
        title: "Vocabulary",
        order: 2,
        lessons: [
          {
            id: "e-vocab-1",
            title: "Synonyms & antonyms",
            mins: 4,
            slides: [
              { kind: "intro", body: "A synonym is a word with similar meaning. An antonym means the opposite." },
              { kind: "example", body: "Big ↔ Large (synonym). Big ↔ Small (antonym)." },
              { kind: "tip", body: "Knowing synonyms makes your writing more interesting." },
            ],
            quiz: [
              { kind: "mcq", q: "Pick a synonym for 'happy':", choices: ["Sad", "Joyful", "Tired", "Angry"], answer: 1 },
              { kind: "mcq", q: "Pick an antonym for 'cold':", choices: ["Freezing", "Cool", "Hot", "Chilly"], answer: 2 },
            ],
          },
        ],
      },
    ],
  },
];

function allLessons() {
  const out = [];
  for (const subject of CURRICULUM) {
    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        out.push({ ...lesson, subjectId: subject.id, subjectName: subject.name, color: subject.color, chapterId: chapter.id, chapterTitle: chapter.title });
      }
    }
  }
  return out;
}

function findLesson(id) {
  return allLessons().find((lesson) => lesson.id === id);
}

function findSubject(id) {
  return CURRICULUM.find((subject) => subject.id === id);
}

export { CURRICULUM, allLessons, findLesson, findSubject };

if (typeof window !== "undefined") {
  window.CURRICULUM = CURRICULUM;
  window.allLessons = allLessons;
  window.findLesson = findLesson;
  window.findSubject = findSubject;
}
