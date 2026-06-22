/**
 * LessonCraft Recommendations — deterministic teaching and content suggestions
 * from validated EduBox evidence packages. No AI, no secrets, no learner PII.
 */

import {
  FORBIDDEN_FIELDS,
  formatGeneratedDate,
  type SanitizedEvidencePackage,
  type ValidationResult,
} from "./eduboxEvidence";

export type RecommendationMode =
  | "teacher_support"
  | "content_improvement"
  | "remediation_plan"
  | "launch_operations"
  | "ngo_impact";

export type RecommendationSection = {
  heading: string;
  items: string[];
};

export type LessonCraftRecommendations = {
  mode: RecommendationMode;
  title: string;
  deviceLabel: string;
  generatedDate: string;
  intro: string;
  followUpLessons: RecommendationSection;
  teacherActions: RecommendationSection;
  contentPackageImprovements: RecommendationSection;
  quizImprovementIdeas: RecommendationSection;
  resourceRightsActions: RecommendationSection;
  offlinePackageSuggestions: RecommendationSection;
  safetyNotes: string[];
  footer: string;
};

export const RECOMMENDATION_MODES: {
  id: RecommendationMode;
  label: string;
  description: string;
}[] = [
  {
    id: "teacher_support",
    label: "Teacher support",
    description: "Classroom actions, discussion prompts, and next-session planning.",
  },
  {
    id: "content_improvement",
    label: "Content improvement",
    description: "Lesson gaps, package quality, and resource enrichment ideas.",
  },
  {
    id: "remediation_plan",
    label: "Remediation plan",
    description: "Follow-up for weaker topics and revision activities.",
  },
  {
    id: "launch_operations",
    label: "Launch operations",
    description: "Rollout checklist for new EduBox sites and content loading.",
  },
  {
    id: "ngo_impact",
    label: "NGO impact follow-up",
    description: "Programme follow-ups aligned with deployment evidence.",
  },
];

const MODE_TITLES: Record<RecommendationMode, string> = {
  teacher_support: "LessonCraft Teacher Support Recommendations",
  content_improvement: "LessonCraft Content Improvement Recommendations",
  remediation_plan: "LessonCraft Remediation Plan",
  launch_operations: "LessonCraft Launch Operations Checklist",
  ngo_impact: "LessonCraft NGO Impact Follow-Up",
};

const WEAK_SCORE_THRESHOLD = 70;

function modeIntro(mode: RecommendationMode, device: string): string {
  switch (mode) {
    case "teacher_support":
      return `Practical teaching steps derived from aggregate EduBox evidence on "${device}". No individual student data is used.`;
    case "content_improvement":
      return `Content and lesson-package suggestions based on published courses and resources on "${device}".`;
    case "remediation_plan":
      return `Revision and follow-up lesson ideas where aggregate quiz signals suggest topics need reinforcement.`;
    case "launch_operations":
      return `Operational content checklist for rolling out or expanding EduBox lesson packages on "${device}".`;
    case "ngo_impact":
      return `Programme follow-up recommendations to sustain learning impact after EduBox deployment at "${device}".`;
  }
}

function buildFollowUpLessons(
  pkg: SanitizedEvidencePackage,
  mode: RecommendationMode,
): RecommendationSection {
  const items: string[] = [];
  const top = pkg.quiz_summary.top_lessons_by_attempts ?? [];
  const lessons = pkg.content_summary.sample_lesson_titles ?? [];

  for (const row of top) {
    const avg = row.average_score_percent;
    if (avg != null && avg < WEAK_SCORE_THRESHOLD && row.lesson_title) {
      items.push(
        `Follow-up revision lesson for "${row.lesson_title}"` +
          (row.course_title ? ` (${row.course_title})` : "") +
          ` — aggregate average ${avg}% suggests reinforcement.`,
      );
    }
  }

  if (items.length === 0 && lessons.length > 0) {
    const next = lessons[lessons.length - 1];
    items.push(`Plan a sequenced follow-up lesson after "${next}" to extend the current unit.`);
  }

  if (pkg.quiz_attempt_count === 0 && lessons.length > 0) {
    items.push(
      `Prepare a first quiz-backed follow-up for "${lessons[0]}" once teachers run an offline session.`,
    );
  }

  if (pkg.course_count === 0) {
    items.push("Priority: create an initial published course with 3–5 starter lessons before follow-ups.");
  }

  if (mode === "remediation_plan" && items.length === 0) {
    items.push(
      "Schedule a revision block using flashcards and a short recap quiz — aggregate data shows no weak-topic signal yet.",
    );
  }

  if (mode === "ngo_impact") {
    items.push(
      "Document which follow-up lessons were delivered in the next reporting cycle for donor evidence.",
    );
  }

  return {
    heading: mode === "remediation_plan" ? "Weak Topic Follow-Up Lessons" : "Recommended Follow-Up Lessons",
    items: items.slice(0, 8),
  };
}

function buildRevisionActivities(pkg: SanitizedEvidencePackage): string[] {
  const items: string[] = [];
  const avg = pkg.average_score_percent ?? pkg.quiz_summary.average_score_percent;
  const completed = pkg.quiz_summary.lesson_progress_completed ?? 0;
  const total = pkg.quiz_summary.lesson_progress_total ?? 0;

  if (avg != null && avg < WEAK_SCORE_THRESHOLD) {
    items.push(
      `Site-wide average quiz score is ${avg}% — add paired revision notes and a low-stakes recap quiz.`,
    );
  }

  if (total > 0 && completed / total < 0.5) {
    items.push(
      "Less than half of tracked lesson progress is complete — assign short revision circles before new content.",
    );
  }

  items.push("Use EduBox flashcard-style recap summaries at the end of each offline lesson block.");
  if (pkg.quiz_summary.completed_at_70_percent_count === 0 && pkg.quiz_attempt_count > 0) {
    items.push("No attempts yet at 70%+ — introduce scaffolded practice questions before summative quizzes.");
  }

  return items;
}

function buildTeacherActions(
  pkg: SanitizedEvidencePackage,
  mode: RecommendationMode,
): RecommendationSection {
  const items: string[] = [];
  const lessons = pkg.content_summary.sample_lesson_titles ?? [];
  const categories = pkg.content_summary.category_labels ?? [];

  if (pkg.quiz_attempt_count === 0) {
    items.push("Run the first offline quiz session on shared devices and confirm guest login flow.");
  } else {
    items.push("Review aggregate quiz results with department leads — discuss patterns, not individual scores.");
  }

  for (const lesson of lessons.slice(0, 2)) {
    items.push(`Discussion prompt: What was the hardest idea in "${lesson}"? How would you explain it to a peer?`);
  }

  if (categories.length) {
    items.push(`Cross-link ${categories.join(" and ")} topics in a short plenary to build connections.`);
  }

  if (mode === "teacher_support") {
    items.push("Pair experienced teachers with colleagues for a 15-minute lesson walkthrough before classroom use.");
  }

  if (mode === "launch_operations") {
    items.push("Confirm all teachers can open lessons offline before announcing rollout to students.");
    items.push("Print a one-page lesson sequence poster for classrooms without device access.");
  }

  const fromPackage = pkg.recommended_agent_actions.filter((a) =>
    a.toLowerCase().includes("teacher"),
  );
  for (const action of fromPackage.slice(0, 2)) {
    items.push(action.replace(/^Teacher Support Agent:\s*/i, ""));
  }

  return { heading: "Teacher Actions", items: [...new Set(items)].slice(0, 10) };
}

function buildContentImprovements(
  pkg: SanitizedEvidencePackage,
  mode: RecommendationMode,
): RecommendationSection {
  const items: string[] = [];
  const courses = pkg.content_summary.sample_course_titles ?? [];

  if (pkg.course_count < 3) {
    items.push(`Only ${pkg.course_count} course(s) published — plan 1–2 additional subject packages for breadth.`);
  }

  if (pkg.lesson_count < 10) {
    items.push(`Expand lesson library (currently ${pkg.lesson_count}) with at least one assessment-ready lesson per course.`);
  }

  if (pkg.content_summary.has_demo_content) {
    items.push("Replace pilot demo courses with production-ready titles before wider classroom use.");
  }

  for (const course of courses.slice(0, 2)) {
    items.push(`Add a capstone lesson and revision pack to "${course}".`);
  }

  if (mode === "content_improvement") {
    items.push("Bundle teacher notes, student notes, and quiz into a single offline lesson pack per topic.");
    items.push("Tag each lesson with learning objectives visible on the EduBox lesson list.");
  }

  if (mode === "ngo_impact") {
    items.push("Align new lesson packages with programme subject priorities named in the grant or MOU.");
  }

  return { heading: "Content Package Improvements", items: items.slice(0, 8) };
}

function buildQuizImprovements(pkg: SanitizedEvidencePackage): RecommendationSection {
  const items: string[] = [];
  const avg = pkg.average_score_percent ?? pkg.quiz_summary.average_score_percent;

  if (pkg.quiz_attempt_count === 0) {
    items.push("Add at least one auto-marked MCQ quiz per published lesson to capture offline attempt data.");
  }

  if (avg != null && avg >= WEAK_SCORE_THRESHOLD) {
    items.push(
      `Average score ${avg}% is healthy — add one higher-order question per quiz to stretch learners.`,
    );
  } else if (avg != null) {
    items.push(
      `Average score ${avg}% — split quizzes into smaller checkpoints and add explanatory feedback items.`,
    );
  }

  items.push("Ensure each quiz has an answer key section for teacher-led review sessions.");
  items.push("Include one confidence-check question (self-rating) per quiz for classroom discussion.");

  const top = pkg.quiz_summary.top_lessons_by_attempts ?? [];
  if (top.length === 1) {
    items.push(
      `Quiz activity concentrates on "${top[0].lesson_title}" — diversify assessments across other lessons.`,
    );
  }

  return { heading: "Quiz Improvement Ideas", items: items.slice(0, 8) };
}

function buildResourceRightsActions(pkg: SanitizedEvidencePackage): RecommendationSection {
  const rs = pkg.resource_rights_summary;
  const items: string[] = [];
  const pending = rs.pending_rights_review_count ?? 0;
  const onlineOnly = rs.online_only_count ?? pkg.online_only_resource_count;
  const offline = rs.offline_allowed_count ?? pkg.offline_allowed_resource_count;

  if (pending > 0) {
    items.push(
      `Resolve ${pending} resource(s) with pending rights review before assigning them in offline classrooms.`,
    );
  }

  if (onlineOnly > 0) {
    items.push(
      `${onlineOnly} resource(s) are online-only — plan a connected session or substitute offline alternatives.`,
    );
  }

  if ((rs.youtube_reference_count ?? 0) > 0 && rs.youtube_online_only_policy) {
    items.push("YouTube references must stay online-only — do not bundle video files for offline download.");
  }

  if (offline === 0 && pkg.resource_count > 0) {
    items.push("No resources are marked offline-allowed — review media rights before classroom rollout.");
  }

  if (items.length === 0) {
    items.push("Resource rights metadata looks consistent — maintain licence records when adding new materials.");
  }

  return { heading: "Resource Rights Actions", items: items.slice(0, 8) };
}

function buildOfflinePackageSuggestions(
  pkg: SanitizedEvidencePackage,
  mode: RecommendationMode,
): RecommendationSection {
  const items: string[] = [];
  const offline = pkg.offline_allowed_resource_count;
  const online = pkg.online_only_resource_count;

  items.push(
    `Package ${pkg.lesson_count} lesson(s) with ${offline} offline-allowed resource(s) for LAN delivery without internet.`,
  );

  if (online > 0) {
    items.push(
      `Label ${online} online-only resource(s) clearly in teacher guides so classrooms know when connectivity is required.`,
    );
  }

  items.push("Export a lesson sequence index (JSON/Markdown) teachers can print for offline reference.");
  items.push("Verify EduBox micro-cloud serves all published lessons on the classroom LAN before exam week.");

  if (!pkg.device_health_summary.device_initialized) {
    items.push("Complete device initialisation before distributing offline lesson packages to teachers.");
  }

  if (mode === "launch_operations") {
    items.push("Run a dry-run: one teacher loads one full lesson pack on a shared tablet without internet.");
    items.push("Pre-load demo content removal checklist if pilot packages are still on device.");
  }

  return { heading: "Offline Learning Package Suggestions", items: items.slice(0, 8) };
}

function buildSafetyNotes(pkg: SanitizedEvidencePackage): string[] {
  return [
    "Recommendations use aggregate EduBox evidence only — no individual learner records.",
    "No passwords, emails, tokens, secrets, or raw media appear in this output.",
    "Generated deterministically in the browser — not sent to AI providers.",
    pkg.privacy_note ??
      "Full lesson content is not exported from EduBox; suggestions are based on counts and sample titles.",
  ];
}

function ensureSectionItems(section: RecommendationSection, fallback: string): RecommendationSection {
  if (section.items.length > 0) return section;
  return { ...section, items: [fallback] };
}

/** Generate deterministic LessonCraft recommendations from a validated package. */
export function generateLessonCraftRecommendations(
  pkg: SanitizedEvidencePackage,
  mode: RecommendationMode = "teacher_support",
): LessonCraftRecommendations {
  const followUpLessons = ensureSectionItems(
    buildFollowUpLessons(pkg, mode),
    "Review published lessons and plan one sequenced follow-up when quiz data becomes available.",
  );
  const teacherActions = ensureSectionItems(
    buildTeacherActions(pkg, mode),
    "Hold a short staff briefing on how to open and teach from EduBox offline lessons.",
  );
  const contentPackageImprovements = ensureSectionItems(
    buildContentImprovements(pkg, mode),
    "Audit published courses and add at least one new lesson package for the next term.",
  );
  const quizImprovementIdeas = ensureSectionItems(
    buildQuizImprovements(pkg),
    "Add a short auto-marked quiz to each new lesson package.",
  );
  const resourceRightsActions = buildResourceRightsActions(pkg);
  const offlinePackageSuggestions = ensureSectionItems(
    buildOfflinePackageSuggestions(pkg, mode),
    "Confirm all classroom lessons load from the EduBox LAN without internet.",
  );

  if (mode === "remediation_plan") {
    teacherActions.items.push(...buildRevisionActivities(pkg));
  }

  return {
    mode,
    title: MODE_TITLES[mode],
    deviceLabel: pkg.device_label,
    generatedDate: formatGeneratedDate(pkg.generated_at),
    intro: modeIntro(mode, pkg.device_label),
    followUpLessons,
    teacherActions,
    contentPackageImprovements,
    quizImprovementIdeas,
    resourceRightsActions,
    offlinePackageSuggestions,
    safetyNotes: buildSafetyNotes(pkg),
    footer:
      "Generated by EmpowerEd Nexus LessonCraft Agent (deterministic MVP). " +
      "Preview only — not sent to live LessonCraft or AI services.",
  };
}

export function tryGenerateLessonCraftRecommendations(
  result: ValidationResult,
  mode: RecommendationMode = "teacher_support",
): LessonCraftRecommendations | null {
  if (!result.ok) return null;
  return generateLessonCraftRecommendations(result.package, mode);
}

function sectionToText(section: RecommendationSection): string[] {
  return [
    section.heading,
    "-".repeat(section.heading.length),
    ...section.items.map((item) => `  • ${item}`),
    "",
  ];
}

/** Plain-text export — teacher-friendly, no HTML. */
export function buildLessonCraftRecommendationsText(rec: LessonCraftRecommendations): string {
  const modeLabel = RECOMMENDATION_MODES.find((m) => m.id === rec.mode)?.label ?? rec.mode;
  return [
    rec.title,
    "EmpowerEd Nexus — LessonCraft Recommendations",
    "=".repeat(48),
    "",
    `Mode: ${modeLabel}`,
    `Device: ${rec.deviceLabel}`,
    `Evidence date: ${rec.generatedDate}`,
    "",
    rec.intro,
    "",
    ...sectionToText(rec.followUpLessons),
    ...sectionToText(rec.teacherActions),
    ...sectionToText(rec.contentPackageImprovements),
    ...sectionToText(rec.quizImprovementIdeas),
    ...sectionToText(rec.resourceRightsActions),
    ...sectionToText(rec.offlinePackageSuggestions),
    "Safety Notes",
    "------------",
    ...rec.safetyNotes.map((n) => `  • ${n}`),
    "",
    rec.footer,
  ].join("\n");
}

export function downloadLessonCraftRecommendationsTxt(
  rec: LessonCraftRecommendations,
  dateStamp?: string,
): void {
  const text = buildLessonCraftRecommendationsText(rec);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = dateStamp?.slice(0, 10).replace(/[^\d-]/g, "") || "recommendations";
  anchor.href = url;
  anchor.download = `lessoncraft-recommendations-${rec.mode}-${stamp}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function recommendationsExcludesForbiddenContent(text: string): boolean {
  const lower = text.toLowerCase();
  return !FORBIDDEN_FIELDS.some((field) => {
    const pattern = new RegExp(`["']?${field}["']?\\s*:`, "i");
    return pattern.test(lower);
  });
}
