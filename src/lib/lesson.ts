export type LessonInput = {
  topic: string;
  subject: string;
  grade: string;
  country: string;
  language: string;
  difficulty: string;
  objective: string;
};

export type QuizQ = { q: string; choices: string[]; answer: number; explain: string };
export type Flashcard = { front: string; back: string };

export type LessonPack = {
  id: string;
  createdAt: string;
  status: "draft" | "ready";
  input: LessonInput;
  title: string;
  objectives: string[];
  teacherExplanation: string[];
  studentNotes: string[];
  activity: { name: string; duration: string; materials: string[]; steps: string[] };
  quiz: QuizQ[];
  flashcards: Flashcard[];
  revisionSummary: string;
  outcomeChecklist: string[];
  eduboxPackage: {
    sizeMb: number;
    files: { name: string; type: string; size: string }[];
    offlineReady: boolean;
    syncMode: string;
  };
  evidence: {
    expectedMastery: number;
    assessmentItems: number;
    reportingTags: string[];
    summary: string;
  };
};

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function generateLessonPack(input: LessonInput): LessonPack {
  const topic = input.topic.trim() || "New Lesson";
  const subject = input.subject || "General Studies";
  const grade = input.grade || "Grade 6";
  const level = input.difficulty || "Beginner";

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "ready",
    input,
    title: `${cap(topic)} — ${subject} (${grade})`,
    objectives: [
      `Define ${topic} in clear, student-friendly language.`,
      `Identify 3 key concepts and real-world examples of ${topic}.`,
      `Apply ${topic} through a guided classroom activity.`,
      `Explain ${topic} confidently in a short revision discussion.`,
    ],
    teacherExplanation: [
      `Begin with a 2-minute warm-up: ask students what they already know about ${topic}.`,
      `Introduce ${topic} using a concrete example relevant to ${input.country || "the local context"}. Keep the language at a ${level.toLowerCase()} reading level.`,
      `Walk through the three core ideas on the board. Use the student notes below as the structure.`,
      `Check understanding with two quick questions before moving to the activity.`,
    ],
    studentNotes: [
      `${cap(topic)} is one of the foundational ideas in ${subject}.`,
      `Key idea 1: A clear, simple definition students can repeat in their own words.`,
      `Key idea 2: How ${topic} appears in daily life — a relatable example.`,
      `Key idea 3: Why ${topic} matters — its connection to other ${subject} topics.`,
      `Quick recap: three bullet points students can copy into their notebooks.`,
    ],
    activity: {
      name: `Hands-on: Exploring ${topic}`,
      duration: "20 minutes",
      materials: ["Notebook", "Pencil", "Printed worksheet (in EduBox pack)", "Optional: shared tablet"],
      steps: [
        "Put students into pairs.",
        `Give each pair the worksheet on ${topic}.`,
        "Pairs complete observations and answer the guiding questions.",
        "Two pairs share their answers with the class.",
        "Teacher closes with a 2-minute summary linking back to the objectives.",
      ],
    },
    quiz: [
      {
        q: `Which of the following best describes ${topic}?`,
        choices: [
          `A clear, accurate description of ${topic}`,
          `A common misconception about ${topic}`,
          `Something unrelated to ${subject}`,
          `A historical event only`,
        ],
        answer: 0,
        explain: `Option A matches the working definition introduced in the lesson.`,
      },
      {
        q: `Which is a real-world example of ${topic}?`,
        choices: [
          "An unrelated everyday object",
          `A relatable example from ${input.country || "daily life"}`,
          "A purely fictional scenario",
          "None of the above",
        ],
        answer: 1,
        explain: `Connecting ${topic} to local context helps retention.`,
      },
      {
        q: `Why is understanding ${topic} important in ${subject}?`,
        choices: [
          "It is not important",
          "It only appears in exams",
          "It connects to several other key ideas",
          "It is only useful for teachers",
        ],
        answer: 2,
        explain: `${cap(topic)} is foundational and links to later topics in ${subject}.`,
      },
      {
        q: `A student says ${topic} means something different. What should they do first?`,
        choices: [
          "Ignore the lesson",
          "Re-read the student notes and ask the teacher",
          "Wait for the next class",
          "Skip the topic",
        ],
        answer: 1,
        explain: "Encouraging questions builds understanding and confidence.",
      },
      {
        q: `Which activity best reinforces ${topic}?`,
        choices: [
          "Silent reading only",
          "The paired worksheet from this lesson",
          "Watching a long unrelated video",
          "Memorising without examples",
        ],
        answer: 1,
        explain: "Active, paired work increases engagement and outcomes.",
      },
    ],
    flashcards: [
      { front: cap(topic), back: `A short definition of ${topic}, written for ${grade}.` },
      { front: "Key example", back: `A real-world example of ${topic} from ${input.country || "daily life"}.` },
      { front: "Why it matters", back: `${cap(topic)} connects to other ideas in ${subject}.` },
      { front: "Activity goal", back: `Apply ${topic} through guided pair work.` },
      { front: "Check question", back: `Can you explain ${topic} in one sentence?` },
    ],
    revisionSummary:
      `In this lesson, students explored ${topic} in ${subject}. They learned the definition, ` +
      `studied a local example, completed a paired activity, and checked understanding with a 5-question quiz. ` +
      `The lesson is designed for ${grade} at a ${level.toLowerCase()} level in ${input.language || "English"}.`,
    outcomeChecklist: [
      `Students can define ${topic} in their own words.`,
      `Students can give one example of ${topic}.`,
      "Students completed the paired activity.",
      "Students scored 3 or more on the 5-question quiz.",
      "Teacher recorded participation and questions raised.",
    ],
    eduboxPackage: {
      sizeMb: 4.2,
      offlineReady: true,
      syncMode: "EduBox micro-cloud — auto sync when online",
      files: [
        { name: "lesson.md", type: "Markdown", size: "18 KB" },
        { name: "worksheet.pdf", type: "PDF", size: "210 KB" },
        { name: "quiz.json", type: "JSON", size: "6 KB" },
        { name: "flashcards.json", type: "JSON", size: "4 KB" },
        { name: "teacher-guide.pdf", type: "PDF", size: "320 KB" },
        { name: "evidence-report.json", type: "JSON", size: "3 KB" },
      ],
    },
    evidence: {
      expectedMastery: 78,
      assessmentItems: 5,
      reportingTags: [subject, grade, level, "EduBox", "Offline"],
      summary: `Expected ${78}% class mastery. Evidence pack includes quiz results, activity participation, and teacher notes — exportable for school reports and pilot tracking.`,
    },
  };
}

/* ---------- Persistence (localStorage) ---------- */

const STORAGE_KEY = "edubox.packs.v1";
const CURRENT_KEY = "edubox.current.v1";

function seedPacks(): LessonPack[] {
  const seeds: LessonInput[] = [
    { topic: "Photosynthesis", subject: "Biology", grade: "Form 2", country: "Kenya", language: "English", difficulty: "Beginner", objective: "Understand how plants make food." },
    { topic: "Fractions", subject: "Mathematics", grade: "Grade 6", country: "Ghana", language: "English", difficulty: "Beginner", objective: "Add and compare simple fractions." },
    { topic: "Hygiene and Handwashing", subject: "Health Education", grade: "Primary 5", country: "Nigeria", language: "English", difficulty: "Beginner", objective: "Practice safe handwashing." },
    { topic: "Introduction to AI", subject: "Digital Literacy", grade: "Secondary School", country: "Rwanda", language: "English", difficulty: "Intermediate", objective: "Explain what AI is and where it appears in daily life." },
  ];
  return seeds.map((s, i) => {
    const p = generateLessonPack(s);
    p.status = i === 1 ? "draft" : "ready";
    return p;
  });
}

export function loadPacks(): LessonPack[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedPacks();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePack(pack: LessonPack) {
  const all = loadPacks();
  const idx = all.findIndex((p) => p.id === pack.id);
  if (idx >= 0) all[idx] = pack;
  else all.unshift(pack);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getPack(id: string): LessonPack | undefined {
  return loadPacks().find((p) => p.id === id);
}

export function setCurrentPack(pack: LessonPack) {
  sessionStorage.setItem(CURRENT_KEY, JSON.stringify(pack));
}

export function getCurrentPack(): LessonPack | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function packToMarkdown(p: LessonPack): string {
  return [
    `# ${p.title}`,
    ``,
    `**Subject:** ${p.input.subject}  `,
    `**Grade:** ${p.input.grade}  `,
    `**Language:** ${p.input.language}  `,
    `**Difficulty:** ${p.input.difficulty}  `,
    `**Context:** ${p.input.country}`,
    ``,
    `## Learning Objectives`,
    ...p.objectives.map((o) => `- ${o}`),
    ``,
    `## Teacher Explanation`,
    ...p.teacherExplanation.map((t) => `- ${t}`),
    ``,
    `## Student Notes`,
    ...p.studentNotes.map((s) => `- ${s}`),
    ``,
    `## Classroom Activity — ${p.activity.name} (${p.activity.duration})`,
    `**Materials:** ${p.activity.materials.join(", ")}`,
    ...p.activity.steps.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `## Quiz`,
    ...p.quiz.map((q, i) => `**Q${i + 1}.** ${q.q}\n${q.choices.map((c, j) => `  ${String.fromCharCode(65 + j)}. ${c}`).join("\n")}`),
    ``,
    `## Answer Key`,
    ...p.quiz.map((q, i) => `${i + 1}. ${String.fromCharCode(65 + q.answer)} — ${q.explain}`),
    ``,
    `## Flashcards`,
    ...p.flashcards.map((f) => `- **${f.front}** — ${f.back}`),
    ``,
    `## Revision Summary`,
    p.revisionSummary,
    ``,
    `## Learning Outcome Checklist`,
    ...p.outcomeChecklist.map((o) => `- [ ] ${o}`),
    ``,
    `## EduBox Offline Package`,
    `- Size: ${p.eduboxPackage.sizeMb} MB`,
    `- Sync: ${p.eduboxPackage.syncMode}`,
    ...p.eduboxPackage.files.map((f) => `- ${f.name} (${f.type}, ${f.size})`),
    ``,
    `## Evidence Report`,
    p.evidence.summary,
  ].join("\n");
}