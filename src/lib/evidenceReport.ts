/**
 * Evidence Agent Report Generator — deterministic impact reports from validated packages.
 *
 * Input must be a SanitizedEvidencePackage from validateEduboxEvidencePackage().
 * No AI calls, no HTML, no secrets, no individual learner records.
 */

import {
  FORBIDDEN_FIELDS,
  formatGeneratedDate,
  type SanitizedEvidencePackage,
  type ValidationResult,
} from "./eduboxEvidence";

export type ReportMode = "school" | "ngo" | "internal" | "community";

export type ReportSection = {
  heading: string;
  paragraphs: string[];
  bullets: string[];
};

export type EvidenceAgentReport = {
  mode: ReportMode;
  title: string;
  generatedDate: string;
  deviceLabel: string;
  executiveSummary: ReportSection;
  learningActivity: ReportSection;
  contentCoverage: ReportSection;
  quizProgress: ReportSection;
  resourceRights: ReportSection;
  deviceReadiness: ReportSection;
  recommendedNextActions: string[];
  safetyNotes: string[];
  footer: string;
};

export const REPORT_MODES: {
  id: ReportMode;
  label: string;
  description: string;
}[] = [
  {
    id: "school",
    label: "School report",
    description: "For head teachers and department leads — classroom impact focus.",
  },
  {
    id: "ngo",
    label: "NGO / donor report",
    description: "For partners and funders — deployment reach and evidence of use.",
  },
  {
    id: "internal",
    label: "Internal operations",
    description: "For IT and programme ops — sync, device health, and follow-ups.",
  },
  {
    id: "community",
    label: "Parent / community",
    description: "Plain-language summary for families and community stakeholders.",
  },
];

const MODE_TITLES: Record<ReportMode, string> = {
  school: "EduBox School Impact Report",
  ngo: "EduBox Deployment Evidence Report",
  internal: "EduBox Operations Evidence Report",
  community: "EduBox Community Learning Update",
};

const DEFAULT_SAFETY_NOTES = [
  "This report uses aggregate operational data only.",
  "No individual learner names, scores, emails, passwords, or raw media are included.",
  "Report generated locally in the browser — not sent to AI providers.",
  "Live AI-enhanced reporting remains setup-state until admin-approved backend integration.",
];

function scoreLabel(pct: number | null): string {
  if (pct == null) return "not yet recorded";
  return `${pct}% average`;
}

function progressPhrase(completed: number, total: number): string {
  if (total === 0) return "Lesson progress tracking has not started yet.";
  const pct = Math.round((completed / total) * 100);
  return `${completed} of ${total} tracked lesson progress records completed (${pct}%).`;
}

function modeIntro(mode: ReportMode, device: string): string {
  switch (mode) {
    case "school":
      return `This report summarises how the EduBox device "${device}" is supporting teaching and learning on site.`;
    case "ngo":
      return `This evidence summary documents deployment activity for the EduBox device "${device}" — suitable for programme reporting.`;
    case "internal":
      return `Operational evidence snapshot for device "${device}" — intended for technical and programme staff.`;
    case "community":
      return `A brief update on learning activity supported by the EduBox device at your school or centre (${device}).`;
  }
}

function buildExecutiveSummary(pkg: SanitizedEvidencePackage, mode: ReportMode): ReportSection {
  const cs = pkg.content_summary;
  const qs = pkg.quiz_summary;
  const attempts = pkg.quiz_attempt_count;
  const avg = pkg.average_score_percent ?? qs.average_score_percent;
  const courses = pkg.course_count;
  const lessons = pkg.lesson_count;

  const activityLine =
    attempts > 0
      ? `Students have completed ${attempts} offline quiz attempts with a ${scoreLabel(avg)}.`
      : "Quiz activity has not been recorded yet — teachers may still be onboarding.";

  const contentLine =
    courses > 0
      ? `${courses} published course(s) and ${lessons} lesson(s) are available for offline classroom use.`
      : "Content library is still being loaded — plan initial course packages with LessonCraft support.";

  const modeParagraphs: Record<ReportMode, string[]> = {
    school: [
      modeIntro(mode, pkg.device_label),
      contentLine,
      activityLine,
      "All figures below are site-wide aggregates — not individual student records.",
    ],
    ngo: [
      modeIntro(mode, pkg.device_label),
      `Deployment includes ${courses} course(s), ${lessons} lesson(s), and ${pkg.resource_count} tracked learning resource(s).`,
      activityLine,
      "This report is safe to share with donors when copied from validated aggregate evidence only.",
    ],
    internal: [
      modeIntro(mode, pkg.device_label),
      contentLine,
      `Sync log entries on device: ${pkg.sync_log_count}. Quiz attempts: ${attempts}.`,
      "Review device readiness and recommended actions before scheduling Nexus handoff.",
    ],
    community: [
      modeIntro(mode, pkg.device_label),
      lessons > 0
        ? `Teachers have ${lessons} lesson(s) ready for students to study offline at school.`
        : "Teachers are still preparing lessons for offline study.",
      attempts > 0
        ? `Students have been practising with ${attempts} quiz activity session(s) on shared devices.`
        : "Interactive quiz practice will begin once teachers run their first sessions.",
    ],
  };

  const bullets: string[] = [];
  if (cs.category_labels?.length) {
    bullets.push(`Subject areas: ${cs.category_labels.join(", ")}`);
  }
  if (pkg.readiness_flags.content_loaded === true) {
    bullets.push("Content library loaded on device");
  }
  if (pkg.readiness_flags.quiz_attempts_recorded === true) {
    bullets.push("Quiz attempts recorded locally");
  }

  return {
    heading: mode === "community" ? "Overview" : "Executive Summary",
    paragraphs: modeParagraphs[mode],
    bullets,
  };
}

function buildLearningActivity(pkg: SanitizedEvidencePackage, mode: ReportMode): ReportSection {
  const qs = pkg.quiz_summary;
  const attempts = pkg.quiz_attempt_count;
  const completed70 = qs.completed_at_70_percent_count ?? 0;

  const paragraphs =
    mode === "community"
      ? [
          attempts > 0
            ? "Students have been using offline quizzes on shared classroom devices."
            : "Learning activities are being set up — quiz practice will appear here once sessions begin.",
        ]
      : [
          attempts > 0
            ? `The site recorded ${attempts} aggregate quiz attempt(s) on the EduBox device.`
            : "No quiz attempts recorded yet. Teacher Support should plan a first offline quiz session.",
          completed70 > 0
            ? `${completed70} attempt(s) reached at least 70% — a positive signal of comprehension.`
            : "No attempts yet at the 70% completion threshold.",
        ];

  const bullets: string[] = [];
  const top = qs.top_lessons_by_attempts ?? [];
  for (const row of top.slice(0, 3)) {
    if (row.lesson_title) {
      bullets.push(
        `${row.lesson_title}${row.course_title ? ` (${row.course_title})` : ""}: ${row.attempt_count ?? 0} attempt(s)` +
          (row.average_score_percent != null ? `, avg ${row.average_score_percent}%` : ""),
      );
    }
  }

  if (mode === "ngo" && attempts > 0) {
    paragraphs.push(
      "Aggregate quiz data demonstrates active use — suitable for donor reporting without exposing individual learners.",
    );
  }

  return {
    heading: mode === "internal" ? "Learning Activity Metrics" : "Learning Activity",
    paragraphs,
    bullets,
  };
}

function buildContentCoverage(pkg: SanitizedEvidencePackage, mode: ReportMode): ReportSection {
  const cs = pkg.content_summary;
  const courses = cs.sample_course_titles ?? [];
  const lessons = cs.sample_lesson_titles ?? [];

  const paragraphs = [
    `${pkg.course_count} published course(s) and ${pkg.lesson_count} lesson(s) are tracked on this device.`,
  ];

  if (cs.has_demo_content) {
    paragraphs.push("Demo or pilot content is present — confirm production packages before wider rollout.");
  }

  if (mode === "school") {
    paragraphs.push(
      courses.length
        ? "Sample courses on device give teachers a starting library for offline delivery."
        : "Course titles were not included in this package — request a fresh export from Agent Bridge.",
    );
  }

  const bullets: string[] = [];
  if (courses.length) bullets.push(`Courses: ${courses.slice(0, 6).join("; ")}`);
  if (lessons.length) bullets.push(`Lessons: ${lessons.slice(0, 6).join("; ")}`);
  if (mode === "internal" && pkg.course_count === 0) {
    bullets.push("LessonCraft Agent: plan initial course packages for site deployment.");
  }

  return {
    heading: mode === "community" ? "What Students Can Study" : "Content Coverage",
    paragraphs,
    bullets,
  };
}

function buildQuizProgress(pkg: SanitizedEvidencePackage, mode: ReportMode): ReportSection {
  const qs = pkg.quiz_summary;
  const avg = pkg.average_score_percent ?? qs.average_score_percent;

  return {
    heading: mode === "community" ? "Practice and Progress" : "Quiz and Progress",
    paragraphs: [
      `Quiz attempts (aggregate): ${pkg.quiz_attempt_count}.`,
      `Average score: ${scoreLabel(avg)}.`,
      progressPhrase(qs.lesson_progress_completed ?? 0, qs.lesson_progress_total ?? 0),
      mode === "internal"
        ? "ExamShield Agent will use aggregate quiz readiness signals in a future phase — no individual attempt detail."
        : "Figures reflect group-level activity on shared devices, not named students.",
    ],
    bullets:
      mode === "ngo"
        ? [`Lesson progress completed: ${qs.lesson_progress_completed ?? 0} / ${qs.lesson_progress_total ?? 0}`]
        : [],
  };
}

function buildResourceRights(pkg: SanitizedEvidencePackage, mode: ReportMode): ReportSection {
  const rs = pkg.resource_rights_summary;
  const pending = rs.pending_rights_review_count ?? 0;

  const paragraphs = [
    `${rs.resource_count ?? pkg.resource_count} learning resource(s) are tracked with media-rights metadata.`,
    `${rs.offline_allowed_count ?? pkg.offline_allowed_resource_count} may be used offline; ${rs.online_only_count ?? pkg.online_only_resource_count} are online-only references.`,
  ];

  if (pending > 0) {
    paragraphs.push(
      `${pending} resource(s) have pending rights review — resolve before classroom offline use.`,
    );
  }

  if (rs.youtube_online_only_policy) {
    paragraphs.push("YouTube references remain online-only per EduBox policy.");
  }

  return {
    heading: mode === "community" ? "Learning Materials" : "Resource Rights",
    paragraphs: mode === "community" ? [paragraphs[0], paragraphs[1]] : paragraphs,
    bullets:
      mode === "internal"
        ? [
            `YouTube references: ${rs.youtube_reference_count ?? 0}`,
            `Partner packages: ${rs.partner_package_count ?? 0}`,
          ]
        : [],
  };
}

function buildDeviceReadiness(pkg: SanitizedEvidencePackage, mode: ReportMode): ReportSection {
  const dh = pkg.device_health_summary;

  const paragraphs = [
    `Device: ${dh.device_label ?? pkg.device_label}.`,
    dh.device_initialized
      ? "Device is initialised and serving content."
      : "Device initialisation should be confirmed before classroom rollout.",
    dh.sync_endpoint_configured
      ? "Sync endpoint is configured for future Nexus Learn OS handoff."
      : "Sync endpoint is not configured — schedule setup when internet is available.",
  ];

  if (mode === "internal") {
    paragraphs.push(
      `Recent sync log entries: ${dh.recent_sync_log_count ?? 0}. Failures: ${dh.recent_sync_failures ?? 0}.`,
      dh.sync_secret_configured
        ? "Sync secret flag is set (value never exported)."
        : "Sync secret not configured on device.",
    );
  }

  return {
    heading: mode === "community" ? "Device at Your School" : "Device Readiness",
    paragraphs: mode === "community" ? paragraphs.slice(0, 2) : paragraphs,
    bullets: [],
  };
}

function buildRecommendedActions(pkg: SanitizedEvidencePackage): string[] {
  if (pkg.recommended_agent_actions.length > 0) {
    return pkg.recommended_agent_actions.slice(0, 10);
  }
  const fallback: string[] = [];
  if (pkg.course_count === 0) {
    fallback.push("LessonCraft Agent: plan initial course packages for site deployment.");
  }
  if (pkg.quiz_attempt_count === 0) {
    fallback.push("Teacher Support Agent: run the first offline quiz session with teachers.");
  }
  if (!pkg.device_health_summary.sync_endpoint_configured) {
    fallback.push("Sync Operations Agent: configure sync when the site has reliable internet.");
  }
  fallback.push("Evidence Agent: archive this report snapshot for deployment records.");
  return fallback;
}

function buildSafetyNotes(pkg: SanitizedEvidencePackage): string[] {
  const notes = [...DEFAULT_SAFETY_NOTES];
  if (pkg.privacy_note) notes.push(pkg.privacy_note);
  if (pkg.readiness_flags.admin_approval_required === true) {
    notes.push("Admin approval is required before live agent ingestion or external sync.");
  }
  return notes;
}

/** Generate a deterministic Evidence Agent report from a validated package. */
export function generateEvidenceReport(
  pkg: SanitizedEvidencePackage,
  mode: ReportMode = "school",
): EvidenceAgentReport {
  return {
    mode,
    title: MODE_TITLES[mode],
    generatedDate: formatGeneratedDate(pkg.generated_at),
    deviceLabel: pkg.device_label,
    executiveSummary: buildExecutiveSummary(pkg, mode),
    learningActivity: buildLearningActivity(pkg, mode),
    contentCoverage: buildContentCoverage(pkg, mode),
    quizProgress: buildQuizProgress(pkg, mode),
    resourceRights: buildResourceRights(pkg, mode),
    deviceReadiness: buildDeviceReadiness(pkg, mode),
    recommendedNextActions: buildRecommendedActions(pkg),
    safetyNotes: buildSafetyNotes(pkg),
    footer:
      "Generated by EmpowerEd Nexus Evidence Agent (deterministic MVP). " +
      "Preview only — not sent to Nexus Learn OS or live AI agents.",
  };
}

/** Returns null when validation failed — report is never built from invalid input. */
export function tryGenerateEvidenceReport(
  result: ValidationResult,
  mode: ReportMode = "school",
): EvidenceAgentReport | null {
  if (!result.ok) return null;
  return generateEvidenceReport(result.package, mode);
}

function sectionToText(section: ReportSection): string[] {
  const lines: string[] = [section.heading, "-".repeat(section.heading.length)];
  for (const p of section.paragraphs) lines.push("", p);
  if (section.bullets.length) {
    lines.push("");
    for (const b of section.bullets) lines.push(`  • ${b}`);
  }
  return lines;
}

/** Plain-text export — no HTML, suitable for email, WhatsApp, or future PDF. */
export function buildEvidenceAgentReportText(report: EvidenceAgentReport): string {
  const modeLabel = REPORT_MODES.find((m) => m.id === report.mode)?.label ?? report.mode;
  const lines: string[] = [
    report.title,
    "EmpowerEd Nexus — Evidence Agent Report",
    "=".repeat(48),
    "",
    `Report mode: ${modeLabel}`,
    `Device: ${report.deviceLabel}`,
    `Evidence generated: ${report.generatedDate}`,
    "",
    ...sectionToText(report.executiveSummary),
    "",
    ...sectionToText(report.learningActivity),
    "",
    ...sectionToText(report.contentCoverage),
    "",
    ...sectionToText(report.quizProgress),
    "",
    ...sectionToText(report.resourceRights),
    "",
    ...sectionToText(report.deviceReadiness),
    "",
    "Recommended Next Actions",
    "------------------------",
    ...report.recommendedNextActions.map((a) => `  • ${a}`),
    "",
    "Safety Notes",
    "------------",
    ...report.safetyNotes.map((n) => `  • ${n}`),
    "",
    report.footer,
  ];
  return lines.join("\n");
}

export function downloadEvidenceAgentReportTxt(
  report: EvidenceAgentReport,
  dateStamp?: string,
): void {
  const text = buildEvidenceAgentReportText(report);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = dateStamp?.slice(0, 10).replace(/[^\d-]/g, "") || "report";
  anchor.href = url;
  anchor.download = `evidence-agent-report-${report.mode}-${stamp}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Verify report text does not contain forbidden field key names as JSON keys would. */
export function reportExcludesForbiddenContent(text: string): boolean {
  const lower = text.toLowerCase();
  return !FORBIDDEN_FIELDS.some((field) => {
    const pattern = new RegExp(`["']?${field}["']?\\s*:`, "i");
    return pattern.test(lower);
  });
}
