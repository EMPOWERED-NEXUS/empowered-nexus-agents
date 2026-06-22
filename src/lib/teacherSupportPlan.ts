/**
 * Teacher Support Action Plan — deterministic classroom plans from validated
 * EduBox evidence and LessonCraft recommendations. No AI, no learner PII.
 */

import {
  FORBIDDEN_FIELDS,
  formatGeneratedDate,
  type SanitizedEvidencePackage,
  type ValidationResult,
} from "./eduboxEvidence";
import {
  generateLessonCraftRecommendations,
  type LessonCraftRecommendations,
} from "./lessonCraftRecommendations";

export type TeacherSupportMode =
  | "classroom_teacher"
  | "orphanage_facilitator"
  | "school_administrator"
  | "ngo_program_officer"
  | "training_center_instructor";

export type PlanSection = {
  heading: string;
  items: string[];
};

export type TeacherSupportPlan = {
  mode: TeacherSupportMode;
  title: string;
  deviceLabel: string;
  generatedDate: string;
  intro: string;
  priorityFocus: PlanSection;
  todaysAction: PlanSection;
  weeklyPlan: PlanSection;
  discussionPrompts: PlanSection;
  revisionActivities: PlanSection;
  quizReviewActions: PlanSection;
  resourceUsageActions: PlanSection;
  syncReportingNextStep: PlanSection;
  offlineRoutine: PlanSection;
  learnerSupportStrategy: PlanSection;
  reflectionQuestions: PlanSection;
  safetyNotes: string[];
  footer: string;
};

export const TEACHER_SUPPORT_MODES: {
  id: TeacherSupportMode;
  label: string;
  description: string;
}[] = [
  {
    id: "classroom_teacher",
    label: "Classroom teacher",
    description: "Day-to-day actions for teachers using EduBox offline in class.",
  },
  {
    id: "orphanage_facilitator",
    label: "Orphanage facilitator",
    description: "Structured routines for residential care learning with shared devices.",
  },
  {
    id: "school_administrator",
    label: "School administrator",
    description: "Oversight, rollout, and staff coordination actions.",
  },
  {
    id: "ngo_program_officer",
    label: "NGO program officer",
    description: "Programme monitoring and reporting follow-ups.",
  },
  {
    id: "training_center_instructor",
    label: "Training center instructor",
    description: "Workshop-style delivery and facilitator checklists.",
  },
];

const MODE_TITLES: Record<TeacherSupportMode, string> = {
  classroom_teacher: "Teacher Support Classroom Action Plan",
  orphanage_facilitator: "Teacher Support Facilitator Action Plan",
  school_administrator: "Teacher Support Administrator Action Plan",
  ngo_program_officer: "Teacher Support Programme Officer Plan",
  training_center_instructor: "Teacher Support Instructor Action Plan",
};

const WEAK_SCORE_THRESHOLD = 70;

function modeIntro(mode: TeacherSupportMode, device: string): string {
  switch (mode) {
    case "classroom_teacher":
      return `A practical action plan for classroom teachers using EduBox on "${device}". Based on aggregate site evidence — not individual student records.`;
    case "orphanage_facilitator":
      return `Structured learning support for facilitators at "${device}" — small groups, shared tablets, and safe offline routines.`;
    case "school_administrator":
      return `Leadership actions to support teachers and monitor EduBox adoption at "${device}".`;
    case "ngo_program_officer":
      return `Programme follow-up plan aligned with deployment evidence from "${device}" for NGO reporting.`;
    case "training_center_instructor":
      return `Instructor checklist for delivering EduBox-backed sessions at "${device}" or partner sites.`;
  }
}

function buildPriorityFocus(
  pkg: SanitizedEvidencePackage,
  lc: LessonCraftRecommendations,
  mode: TeacherSupportMode,
): PlanSection {
  const items: string[] = [];
  const avg = pkg.average_score_percent ?? pkg.quiz_summary.average_score_percent;

  if (pkg.quiz_attempt_count === 0) {
    items.push("Priority 1: Run the first offline quiz session and confirm device login flow.");
  } else if (avg != null && avg < WEAK_SCORE_THRESHOLD) {
    items.push(
      `Priority 1: Reinforce weak topics — site aggregate average is ${avg}%. Focus on revision before new content.`,
    );
  } else {
    items.push("Priority 1: Consolidate recent lessons with a short recap quiz and group discussion.");
  }

  if ((pkg.resource_rights_summary.pending_rights_review_count ?? 0) > 0) {
    items.push("Priority 2: Resolve pending resource rights before assigning materials offline.");
  } else if (pkg.offline_allowed_resource_count === 0 && pkg.resource_count > 0) {
    items.push("Priority 2: Confirm which resources are approved for offline classroom use.");
  } else {
    items.push("Priority 2: Align next lesson sequence with published courses on the device.");
  }

  if (!pkg.device_health_summary.sync_endpoint_configured) {
    items.push("Priority 3: Plan sync window when internet is available — endpoint not yet configured.");
  } else {
    items.push("Priority 3: Archive an evidence snapshot for school or programme records.");
  }

  if (mode === "school_administrator") {
    items.push("Leadership focus: Brief department heads on aggregate quiz and progress signals.");
  }
  if (mode === "orphanage_facilitator") {
    items.push("Care focus: Keep sessions short, predictable, and supportive for mixed-age groups.");
  }

  const lcPriority = lc.teacherActions.items[0];
  if (lcPriority) items.push(`From LessonCraft: ${lcPriority}`);

  return { heading: "Classroom Priority Summary", items: items.slice(0, 6) };
}

function buildTodaysAction(
  pkg: SanitizedEvidencePackage,
  lc: LessonCraftRecommendations,
  mode: TeacherSupportMode,
): PlanSection {
  const lessons = pkg.content_summary.sample_lesson_titles ?? [];
  const firstLesson = lessons[0] ?? "the next published lesson";
  const items: string[] = [];

  switch (mode) {
    case "orphanage_facilitator":
      items.push(`Open "${firstLesson}" on a shared device and read the teacher notes aloud to the group.`);
      items.push("Run a 10-minute paired discussion, then one group recap.");
      break;
    case "school_administrator":
      items.push("Visit one classroom using EduBox offline and confirm lessons load without internet.");
      items.push("Ask one teacher what blocked their last session — note for staff briefing.");
      break;
    case "ngo_program_officer":
      items.push("Export and save today's validated evidence package for programme files.");
      items.push("Confirm session count and quiz activity match field visit expectations.");
      break;
    case "training_center_instructor":
      items.push(`Demo "${firstLesson}" on EduBox, then let participants practise on shared devices.`);
      items.push("Collect facilitator feedback on lesson clarity and offline load time.");
      break;
    default:
      items.push(`Teach "${firstLesson}" using EduBox offline — follow teacher notes on device.`);
      items.push("End with 3 oral check questions before dismissing class.");
  }

  if (pkg.quiz_attempt_count === 0) {
    items.push("If time allows: run a 5-question practice quiz and review answers as a class.");
  }

  const todayLc = lc.followUpLessons.items[0];
  if (todayLc) items.push(todayLc);

  return { heading: "Today's Action", items: items.slice(0, 5) };
}

function buildWeeklyPlan(
  pkg: SanitizedEvidencePackage,
  lc: LessonCraftRecommendations,
  mode: TeacherSupportMode,
): PlanSection {
  const lessons = pkg.content_summary.sample_lesson_titles ?? [];
  const dayPlans: string[] = [];

  const templates: Record<TeacherSupportMode, string[]> = {
    classroom_teacher: [
      "Day 1: Open lesson + teacher explanation + short quiz.",
      "Day 2: Revision notes + paired practice.",
      "Day 3: Group discussion + recap quiz.",
      "Day 4: Apply concepts with offline resources (offline-allowed only).",
      "Day 5: Weekly review — discuss aggregate patterns, not individual scores.",
      "Day 6: Extension lesson or catch-up block.",
      "Day 7: Plan next week; export evidence if sync is available.",
    ],
    orphanage_facilitator: [
      "Day 1: Structured study block (30 min) — one lesson segment.",
      "Day 2: Revision circle — oral questions only.",
      "Day 3: Creative recap (draw or act out key idea).",
      "Day 4: Shared-device quiz in small groups.",
      "Day 5: Rest or enrichment — light review only.",
      "Day 6: Peer teaching — older learners support younger ones.",
      "Day 7: Facilitator reflection and room schedule for next week.",
    ],
    school_administrator: [
      "Day 1: Confirm EduBox device health with IT contact.",
      "Day 2: Observe one offline lesson per department.",
      "Day 3: Staff micro-training — opening lessons and quizzes.",
      "Day 4: Review aggregate quiz data with heads of department.",
      "Day 5: Address resource-rights or content gaps with LessonCraft lead.",
      "Day 6: Parent/community communication if programme requires it.",
      "Day 7: Sign off weekly evidence export for records.",
    ],
    ngo_program_officer: [
      "Day 1: Validate evidence package from site.",
      "Day 2: Check lesson and quiz counts against programme targets.",
      "Day 3: Call site lead — discuss teacher support needs.",
      "Day 4: Document resource-rights status for compliance.",
      "Day 5: Draft donor-friendly activity summary (aggregates only).",
      "Day 6: Plan next field support visit or remote check-in.",
      "Day 7: Archive report and recommendations for M&E folder.",
    ],
    training_center_instructor: [
      "Day 1: Instructor demo + participant hands-on.",
      "Day 2: Practice designing a lesson sequence from existing courses.",
      "Day 3: Quiz authoring walkthrough on device.",
      "Day 4: Offline troubleshooting lab (LAN, shared login).",
      "Day 5: Resource-rights briefing — online vs offline materials.",
      "Day 6: Participants teach-back in pairs.",
      "Day 7: Certification checklist and next cohort planning.",
    ],
  };

  dayPlans.push(...templates[mode]);

  if (lessons[1]) {
    dayPlans[0] = dayPlans[0].replace("lesson", `"${lessons[0]}"`).replace("Lesson", `"${lessons[0]}"`);
  }

  const lcWeekly = lc.contentPackageImprovements.items.slice(0, 2);
  for (const item of lcWeekly) {
    dayPlans.push(`LessonCraft note: ${item}`);
  }

  return { heading: "7-Day Teacher Action Plan", items: dayPlans.slice(0, 9) };
}

function buildDiscussionPrompts(
  pkg: SanitizedEvidencePackage,
  lc: LessonCraftRecommendations,
  mode: TeacherSupportMode,
): PlanSection {
  const items = [...lc.teacherActions.items.filter((a) => a.toLowerCase().includes("discussion"))];
  const lessons = pkg.content_summary.sample_lesson_titles ?? [];

  for (const lesson of lessons.slice(0, 3)) {
    items.push(`What is one real-world example of the main idea in "${lesson}"?`);
    items.push(`How would you teach "${lesson}" to a friend who missed class?`);
  }

  if (mode === "orphanage_facilitator") {
    items.push("What helped you feel confident learning today?");
    items.push("What should we repeat next week because it worked well?");
  }
  if (mode === "training_center_instructor") {
    items.push("What would you change in this lesson before using it at your own site?");
  }

  if (items.length === 0) {
    items.push("What was the most important idea in today's lesson?");
    items.push("What question do you still have?");
  }

  return { heading: "Group Discussion Prompts", items: [...new Set(items)].slice(0, 8) };
}

function buildRevisionActivities(
  pkg: SanitizedEvidencePackage,
  lc: LessonCraftRecommendations,
): PlanSection {
  const items: string[] = [];
  const avg = pkg.average_score_percent ?? pkg.quiz_summary.average_score_percent;

  if (avg != null && avg < WEAK_SCORE_THRESHOLD) {
    items.push("Run a 15-minute error-clinic: review the three most-missed question types as a class.");
  }

  items.push("Use EduBox revision notes or flashcards at the start of each session.");
  items.push("Pair stronger and developing learners for oral recap — no grades shared publicly.");

  for (const lesson of lc.followUpLessons.items.slice(0, 2)) {
    items.push(lesson);
  }

  if (pkg.quiz_summary.completed_at_70_percent_count === 0 && pkg.quiz_attempt_count > 0) {
    items.push("Add scaffolded practice before the next summative quiz — build confidence in steps.");
  }

  return { heading: "Revision Activities", items: items.slice(0, 8) };
}

function buildQuizReviewActions(pkg: SanitizedEvidencePackage, lc: LessonCraftRecommendations): PlanSection {
  const items = [...lc.quizImprovementIdeas.items.slice(0, 4)];

  if (pkg.quiz_attempt_count === 0) {
    items.unshift("Schedule first offline quiz; walk through login and submit flow on one shared device.");
  } else {
    items.unshift(
      `Review ${pkg.quiz_attempt_count} aggregate attempt(s) with colleagues — look for topic patterns, not names.`,
    );
  }

  const avg = pkg.average_score_percent ?? pkg.quiz_summary.average_score_percent;
  if (avg != null) {
    items.push(`Site average ${avg}% — celebrate strengths first, then plan one re-teach block.`);
  }

  items.push("Keep answer keys for teacher eyes only during review — discuss strategies, not individual results.");

  return { heading: "Quiz Review Strategy", items: items.slice(0, 8) };
}

function buildLearnerSupportStrategy(pkg: SanitizedEvidencePackage, mode: TeacherSupportMode): PlanSection {
  const items: string[] = [
    "Support learners in mixed-ability groups — use aggregate quiz signals to plan re-teach, never to label individuals.",
    "Offer optional extra practice offline; do not publish scores or rankings in shared spaces.",
    "Rotate shared-device access so every learner gets hands-on time each week.",
  ];

  const progress = pkg.quiz_summary.lesson_progress_completed ?? 0;
  const total = pkg.quiz_summary.lesson_progress_total ?? 0;
  if (total > 0 && progress / total < 0.5) {
    items.push("Less than half of tracked progress is complete — shorten sessions and add more scaffolding.");
  }

  if (mode === "orphanage_facilitator") {
    items.push("Watch for fatigue in residential settings — alternate active and calm learning blocks.");
  }

  return { heading: "Learner Support Strategy", items: items.slice(0, 6) };
}

function buildOfflineRoutine(pkg: SanitizedEvidencePackage, mode: TeacherSupportMode): PlanSection {
  const items = [
    "Start each session: confirm EduBox loads on the LAN without internet.",
    "Open lesson → teacher notes → student activity → short quiz → oral recap.",
    "End each session: log out of shared accounts if your site policy requires it.",
  ];

  if (mode === "orphanage_facilitator") {
    items.push("Use a visible timetable so learners know when device time begins and ends.");
  }
  if (mode === "training_center_instructor") {
    items.push("Build in 5 minutes for participants to troubleshoot offline loading themselves.");
  }

  if (!pkg.device_health_summary.device_initialized) {
    items.unshift("Complete device setup checklist before first classroom use.");
  }

  return { heading: "Offline Classroom Routine", items: items.slice(0, 6) };
}

function buildResourceUsageActions(
  pkg: SanitizedEvidencePackage,
  lc: LessonCraftRecommendations,
): PlanSection {
  return {
    heading: "Resource Usage Guidance",
    items: lc.resourceRightsActions.items.concat(lc.offlinePackageSuggestions.items.slice(0, 3)).slice(0, 8),
  };
}

function buildReflectionQuestions(mode: TeacherSupportMode): PlanSection {
  const base = [
    "Which part of the lesson landed well with learners this week?",
    "What would you simplify next time?",
    "Did offline resources load reliably on shared devices?",
    "What support do you need from your head teacher or programme lead?",
  ];

  const modeExtra: Record<TeacherSupportMode, string[]> = {
    classroom_teacher: ["What one quiz question should we rewrite for clarity?"],
    orphanage_facilitator: ["Did the routine feel safe and predictable for all learners?"],
    school_administrator: ["Which department needs the most EduBox coaching next week?"],
    ngo_program_officer: ["Does aggregate evidence match what you observed on site?"],
    training_center_instructor: ["What will participants struggle with when they return to their schools?"],
  };

  return {
    heading: "Teacher Reflection Questions",
    items: [...base, ...modeExtra[mode]].slice(0, 6),
  };
}

function buildSyncReportingNextStep(
  pkg: SanitizedEvidencePackage,
  mode: TeacherSupportMode,
): PlanSection {
  const items: string[] = [];

  if (pkg.device_health_summary.sync_endpoint_configured) {
    items.push("When internet is stable, sync evidence to Nexus Learn OS per admin schedule.");
  } else {
    items.push("Ask IT to configure sync endpoint — required before automated Nexus handoff.");
  }

  items.push("Save a copy of the Evidence Agent report and LessonCraft recommendations for staff records.");
  items.push("Re-export evidence package from EduBox Agent Bridge after major content or quiz changes.");

  const agentActions = pkg.recommended_agent_actions.filter(
    (a) => a.toLowerCase().includes("sync") || a.toLowerCase().includes("evidence"),
  );
  for (const action of agentActions.slice(0, 2)) {
    items.push(action);
  }

  if (mode === "ngo_program_officer") {
    items.push("Include aggregate quiz and lesson counts in the next programme report to donors.");
  }

  return { heading: "Next Sync / Reporting Action", items: items.slice(0, 6) };
}

function buildSafetyNotes(pkg: SanitizedEvidencePackage): string[] {
  return [
    "This plan uses aggregate EduBox evidence only — never individual learner names or scores.",
    "No passwords, emails, tokens, secrets, or raw media appear in this output.",
    "Generated deterministically in the browser — live teacher coaching AI is not used.",
    pkg.privacy_note ??
      "Discuss quiz patterns at class level; avoid sharing identifiable performance data.",
  ];
}

function ensureItems(section: PlanSection, fallback: string): PlanSection {
  if (section.items.length > 0) return section;
  return { ...section, items: [fallback] };
}

/** Generate a Teacher Support action plan from validated evidence and LessonCraft input. */
export function generateTeacherSupportPlan(
  pkg: SanitizedEvidencePackage,
  mode: TeacherSupportMode = "classroom_teacher",
  lessonCraft?: LessonCraftRecommendations,
): TeacherSupportPlan {
  const lc = lessonCraft ?? generateLessonCraftRecommendations(pkg, "teacher_support");

  return {
    mode,
    title: MODE_TITLES[mode],
    deviceLabel: pkg.device_label,
    generatedDate: formatGeneratedDate(pkg.generated_at),
    intro: modeIntro(mode, pkg.device_label),
    priorityFocus: ensureItems(
      buildPriorityFocus(pkg, lc, mode),
      "Review published lessons and confirm EduBox loads offline before your next class.",
    ),
    todaysAction: ensureItems(
      buildTodaysAction(pkg, lc, mode),
      "Open the next published lesson on EduBox and teach one segment offline.",
    ),
    weeklyPlan: ensureItems(
      buildWeeklyPlan(pkg, lc, mode),
      "Follow the 7-day outline: teach, revise, quiz, review, and plan next week.",
    ),
    discussionPrompts: ensureItems(
      buildDiscussionPrompts(pkg, lc, mode),
      "What was the main idea today? What question do you still have?",
    ),
    revisionActivities: ensureItems(
      buildRevisionActivities(pkg, lc),
      "Start each session with a 5-minute recap of the previous lesson.",
    ),
    quizReviewActions: ensureItems(
      buildQuizReviewActions(pkg, lc),
      "Review quiz items as a class without naming individual results.",
    ),
    resourceUsageActions: ensureItems(
      buildResourceUsageActions(pkg, lc),
      "Use offline-allowed resources only unless internet is explicitly available.",
    ),
    syncReportingNextStep: ensureItems(
      buildSyncReportingNextStep(pkg, mode),
      "Export a fresh evidence package when content or quiz activity changes.",
    ),
    offlineRoutine: buildOfflineRoutine(pkg, mode),
    learnerSupportStrategy: buildLearnerSupportStrategy(pkg, mode),
    reflectionQuestions: buildReflectionQuestions(mode),
    safetyNotes: buildSafetyNotes(pkg),
    footer:
      "Generated by EmpowerEd Nexus Teacher Support Agent (deterministic MVP). " +
      "Preview only — not sent to live coaching or AI services.",
  };
}

export function tryGenerateTeacherSupportPlan(
  result: ValidationResult,
  mode: TeacherSupportMode = "classroom_teacher",
  lessonCraft?: LessonCraftRecommendations,
): TeacherSupportPlan | null {
  if (!result.ok) return null;
  return generateTeacherSupportPlan(result.package, mode, lessonCraft);
}

function sectionToText(section: PlanSection): string[] {
  return [
    section.heading,
    "-".repeat(section.heading.length),
    ...section.items.map((item) => `  • ${item}`),
    "",
  ];
}

/** Plain-text export — teacher-friendly, no HTML. */
export function buildTeacherSupportPlanText(plan: TeacherSupportPlan): string {
  const modeLabel = TEACHER_SUPPORT_MODES.find((m) => m.id === plan.mode)?.label ?? plan.mode;
  return [
    plan.title,
    "EmpowerEd Nexus — Teacher Support Action Plan",
    "=".repeat(48),
    "",
    `Mode: ${modeLabel}`,
    `Device: ${plan.deviceLabel}`,
    `Evidence date: ${plan.generatedDate}`,
    "",
    plan.intro,
    "",
    ...sectionToText(plan.priorityFocus),
    ...sectionToText(plan.todaysAction),
    ...sectionToText(plan.weeklyPlan),
    ...sectionToText(plan.discussionPrompts),
    ...sectionToText(plan.revisionActivities),
    ...sectionToText(plan.quizReviewActions),
    ...sectionToText(plan.resourceUsageActions),
    ...sectionToText(plan.syncReportingNextStep),
    ...sectionToText(plan.offlineRoutine),
    ...sectionToText(plan.learnerSupportStrategy),
    ...sectionToText(plan.reflectionQuestions),
    "Safety Notes",
    "------------",
    ...plan.safetyNotes.map((n) => `  • ${n}`),
    "",
    plan.footer,
  ].join("\n");
}

export function downloadTeacherSupportPlanTxt(plan: TeacherSupportPlan, dateStamp?: string): void {
  const text = buildTeacherSupportPlanText(plan);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = dateStamp?.slice(0, 10).replace(/[^\d-]/g, "") || "plan";
  anchor.href = url;
  anchor.download = `teacher-support-plan-${plan.mode}-${stamp}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function teacherPlanExcludesForbiddenContent(text: string): boolean {
  const lower = text.toLowerCase();
  return !FORBIDDEN_FIELDS.some((field) => {
    const pattern = new RegExp(`["']?${field}["']?\\s*:`, "i");
    return pattern.test(lower);
  });
}
