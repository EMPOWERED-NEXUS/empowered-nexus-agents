/**
 * Nexus Passport Bridge Readiness — deterministic setup-state readiness from
 * validated EduBox evidence. No Passport backend, no real credentials/badges.
 */

import {
  FORBIDDEN_FIELDS,
  formatGeneratedDate,
  type SanitizedEvidencePackage,
  type ValidationResult,
} from "./eduboxEvidence";

export type PassportBridgeMode =
  | "student_passport"
  | "teacher_passport"
  | "school_passport"
  | "ngo_impact_passport"
  | "device_deployment_passport"
  | "subscription_entitlement";

export type ReadinessLevel = "ready" | "partial" | "missing" | "setup";

export type ReadinessSection = {
  heading: string;
  level: ReadinessLevel;
  summary: string;
  items: string[];
};

export type ProofCategory = {
  id: string;
  label: string;
  level: ReadinessLevel;
  detail: string;
};

export type PassportBridgeReadiness = {
  mode: PassportBridgeMode;
  title: string;
  deviceLabel: string;
  generatedDate: string;
  intro: string;
  passportBridgeStatus: ReadinessSection;
  learningProofReadiness: ReadinessSection;
  certificateReadiness: ReadinessSection;
  badgeReadiness: ReadinessSection;
  schoolVerificationReadiness: ReadinessSection;
  teacherActivityProofReadiness: ReadinessSection;
  deviceDeploymentProofReadiness: ReadinessSection;
  entitlementReadiness: ReadinessSection;
  auditLogReadiness: ReadinessSection;
  proofCategories: ProofCategory[];
  requiredMissingFields: string[];
  privacyConstraints: string[];
  recommendedPassportActions: string[];
  safetyNotes: string[];
  footer: string;
};

export const PASSPORT_BRIDGE_MODES: {
  id: PassportBridgeMode;
  label: string;
  description: string;
}[] = [
  {
    id: "student_passport",
    label: "Student Passport",
    description: "Future verified learning proof for learners — aggregate signals only today.",
  },
  {
    id: "teacher_passport",
    label: "Teacher Passport",
    description: "Future teacher activity and facilitation proof — no teacher PII in evidence.",
  },
  {
    id: "school_passport",
    label: "School Passport",
    description: "School deployment verification and institutional proof readiness.",
  },
  {
    id: "ngo_impact_passport",
    label: "NGO Impact Passport",
    description: "Programme impact attestation for donors and field officers.",
  },
  {
    id: "device_deployment_passport",
    label: "Device Deployment Passport",
    description: "EduBox device deployment and usage proof for fleet and QA.",
  },
  {
    id: "subscription_entitlement",
    label: "Subscription & entitlement",
    description: "Resource rights and future subscription entitlement checks.",
  },
];

export const PASSPORT_PROOF_CATEGORIES: Omit<ProofCategory, "level" | "detail">[] = [
  { id: "student_learning", label: "Student learning proof" },
  { id: "lesson_completion", label: "Lesson completion proof" },
  { id: "quiz_attempt", label: "Quiz attempt proof" },
  { id: "course_participation", label: "Course participation proof" },
  { id: "teacher_activity", label: "Teacher activity proof" },
  { id: "school_deployment", label: "School deployment proof" },
  { id: "device_usage", label: "Device usage proof" },
  { id: "resource_rights", label: "Resource rights proof" },
  { id: "certificate", label: "Certificate readiness proof" },
  { id: "badge", label: "Badge readiness proof" },
];

const MODE_TITLES: Record<PassportBridgeMode, string> = {
  student_passport: "Nexus Passport Bridge — Student Readiness",
  teacher_passport: "Nexus Passport Bridge — Teacher Readiness",
  school_passport: "Nexus Passport Bridge — School Verification Readiness",
  ngo_impact_passport: "Nexus Passport Bridge — NGO Impact Readiness",
  device_deployment_passport: "Nexus Passport Bridge — Device Deployment Readiness",
  subscription_entitlement: "Nexus Passport Bridge — Entitlement Readiness",
};

const BRIDGE_STATUS = "Setup-state — real Nexus Passport sync is NOT connected in Phase A6.";

function modeIntro(mode: PassportBridgeMode, device: string): string {
  switch (mode) {
    case "student_passport":
      return `Preview how EduBox evidence from "${device}" could feed future student learning proof in Nexus Passport. Aggregate data only — no individual learner credentials created.`;
    case "teacher_passport":
      return `Preview teacher activity proof readiness from "${device}" — operational signals without teacher names or emails.`;
    case "school_passport":
      return `School verification readiness for deployment at "${device}" — institutional proof, not live verification yet.`;
    case "ngo_impact_passport":
      return `NGO programme impact proof readiness from "${device}" — suitable for future donor attestation workflows.`;
    case "device_deployment_passport":
      return `Device deployment and audit proof readiness for "${device}" — fleet and QA use cases.`;
    case "subscription_entitlement":
      return `Entitlement and resource-rights readiness linked to "${device}" — subscription checks remain setup-state.`;
  }
}

function levelFrom(checks: boolean[]): ReadinessLevel {
  const passed = checks.filter(Boolean).length;
  if (passed === checks.length && checks.length > 0) return "partial";
  if (passed === 0) return "missing";
  return "partial";
}

function buildProofCategories(pkg: SanitizedEvidencePackage): ProofCategory[] {
  const qs = pkg.quiz_summary;
  const hasQuiz = pkg.quiz_attempt_count > 0;
  const hasProgress = (qs.lesson_progress_completed ?? 0) > 0;
  const hasCourses = pkg.course_count > 0;
  const hasLessons = pkg.lesson_count > 0;
  const hasDevice = pkg.device_health_summary.device_initialized === true;
  const pendingRights = (pkg.resource_rights_summary.pending_rights_review_count ?? 0) > 0;

  const levels: Record<string, { level: ReadinessLevel; detail: string }> = {
    student_learning: {
      level: hasQuiz ? "partial" : "missing",
      detail: hasQuiz
        ? `${pkg.quiz_attempt_count} aggregate quiz attempt(s) — individual student proof requires Passport Phase B.`
        : "Awaiting quiz activity before learning proof signals exist.",
    },
    lesson_completion: {
      level: hasProgress ? "partial" : hasLessons ? "missing" : "missing",
      detail: `${qs.lesson_progress_completed ?? 0}/${qs.lesson_progress_total ?? 0} progress records — completion proof not issued yet.`,
    },
    quiz_attempt: {
      level: hasQuiz ? "partial" : "missing",
      detail: hasQuiz
        ? `Aggregate average ${pkg.average_score_percent ?? qs.average_score_percent ?? "n/a"}% — no per-learner attempt export.`
        : "No quiz attempts recorded on device.",
    },
    course_participation: {
      level: hasCourses ? "partial" : "missing",
      detail: hasCourses
        ? `${pkg.course_count} course(s) published — participation proof needs Passport enrollment bridge.`
        : "No published courses for participation attestation.",
    },
    teacher_activity: {
      level: pkg.readiness_flags.quiz_attempts_recorded === true ? "partial" : "missing",
      detail: "Teacher facilitation inferred from aggregate session flags — no teacher identity exported.",
    },
    school_deployment: {
      level: hasCourses && hasDevice ? "partial" : "missing",
      detail: "Content plus device init signals support future school deployment certificates.",
    },
    device_usage: {
      level: hasDevice ? "partial" : "missing",
      detail: `Sync logs: ${pkg.sync_log_count}; device label only — no device tokens.`,
    },
    resource_rights: {
      level: pendingRights ? "missing" : pkg.resource_count > 0 ? "partial" : "missing",
      detail: pendingRights
        ? "Pending rights review blocks entitlement proof."
        : `${pkg.resource_count} resource(s) tracked with rights metadata.`,
    },
    certificate: {
      level: hasQuiz && hasCourses ? "partial" : "missing",
      detail: "Certificate templates not generated — draft action remains setup-state.",
    },
    badge: {
      level: hasQuiz ? "partial" : "missing",
      detail: "Badge milestones could use aggregate quiz thresholds — no badges minted in A6.",
    },
  };

  return PASSPORT_PROOF_CATEGORIES.map((cat) => ({
    ...cat,
    level: levels[cat.id]?.level ?? "setup",
    detail: levels[cat.id]?.detail ?? "Setup-state preview only.",
  }));
}

function buildRequiredMissingFields(pkg: SanitizedEvidencePackage): string[] {
  const missing: string[] = [];

  if (pkg.quiz_attempt_count === 0) {
    missing.push("Aggregate quiz attempts — required before student learning proof bridge.");
  }
  if (pkg.course_count === 0) {
    missing.push("Published courses — required before course participation proof.");
  }
  if (!pkg.device_health_summary.device_initialized) {
    missing.push("Device initialization — required before deployment proof.");
  }
  if (!pkg.device_health_summary.sync_endpoint_configured) {
    missing.push("Sync endpoint configuration — required before audit handoff to Passport.");
  }
  if ((pkg.resource_rights_summary.pending_rights_review_count ?? 0) > 0) {
    missing.push("Resource rights review — required before entitlement proof.");
  }

  missing.push("Nexus Passport API connection — not available in Phase A6.");
  missing.push("Individual learner consent and identity binding — future Passport requirement.");
  missing.push("Admin-approved proof issuance workflow — not enabled yet.");

  return missing;
}

function buildPrivacyConstraints(): string[] {
  return [
    "No individual learner names, emails, or scores may enter Passport from EduBox evidence.",
    "No passwords, tokens, API keys, sync secrets, or service credentials in proof payloads.",
    "No raw media paths or private learner record exports.",
    "Proof payloads must use aggregate counts and readiness flags only until Phase B.",
    "Real Passport sync requires admin approval and secure backend — not browser export.",
  ];
}

function buildPassportBridgeStatus(): ReadinessSection {
  return {
    heading: "Passport Bridge Status",
    level: "setup",
    summary: BRIDGE_STATUS,
    items: [
      "EduBox evidence validated locally — not transmitted to Nexus Passport.",
      "No credentials, certificates, badges, or entitlements are created in this phase.",
      "All proof categories shown are readiness previews only.",
      "Send to Nexus Passport button remains disabled until secure integration exists.",
    ],
  };
}

function buildLearningProofReadiness(pkg: SanitizedEvidencePackage, mode: PassportBridgeMode): ReadinessSection {
  const hasQuiz = pkg.quiz_attempt_count > 0;
  const hasProgress = (pkg.quiz_summary.lesson_progress_completed ?? 0) > 0;

  const items = [
    `Quiz attempts (aggregate): ${pkg.quiz_attempt_count}`,
    `Lesson progress completed: ${pkg.quiz_summary.lesson_progress_completed ?? 0}`,
    "Individual student learning proof requires Passport identity binding — not connected.",
  ];

  if (mode === "student_passport") {
    items.push("Future: verified learning proof linked to consented learner Passport profile.");
  }
  if (mode === "ngo_impact_passport") {
    items.push("Future: aggregate learning proof suitable for programme impact reports.");
  }

  return {
    heading: "Learning Proof Readiness",
    level: levelFrom([hasQuiz, hasProgress, hasQuiz || hasProgress]),
    summary: hasQuiz
      ? "Partial aggregate signals present — not yet verifiable Passport proof."
      : "Insufficient activity signals for learning proof bridge.",
    items,
  };
}

function buildCertificateReadiness(pkg: SanitizedEvidencePackage): ReadinessSection {
  const ready = pkg.quiz_attempt_count > 0 && pkg.course_count > 0;
  return {
    heading: "Certificate Readiness",
    level: ready ? "partial" : "missing",
    summary: "Certificate drafts are setup-state only — no certificates issued.",
    items: [
      ready
        ? "Aggregate course and quiz data could template a completion certificate in a future phase."
        : "Need published courses and quiz activity before certificate readiness improves.",
      "Create certificate draft action is disabled — no real certificate generation.",
      "Certificates will require admin approval and Passport backend integration.",
    ],
  };
}

function buildBadgeReadiness(pkg: SanitizedEvidencePackage): ReadinessSection {
  const ready = pkg.quiz_attempt_count > 0;
  return {
    heading: "Badge Readiness",
    level: ready ? "partial" : "missing",
    summary: "Badge drafts are setup-state only — no badges minted.",
    items: [
      ready
        ? "Aggregate quiz milestones could trigger badge rules after Passport bridge."
        : "Record quiz activity on device to improve badge readiness signals.",
      "Create learning badge draft action is disabled.",
      "Badges will use milestone thresholds — not individual public score disclosure.",
    ],
  };
}

function buildSchoolVerificationReadiness(pkg: SanitizedEvidencePackage, mode: PassportBridgeMode): ReadinessSection {
  const checks = [
    pkg.course_count > 0,
    pkg.device_health_summary.device_initialized === true,
    pkg.readiness_flags.content_loaded === true,
  ];
  const items = [
    `Published courses: ${pkg.course_count}`,
    `Device initialized: ${pkg.device_health_summary.device_initialized ? "Yes" : "No"}`,
    "School identity verification not performed — setup-state only.",
    "Verify school/device record action is disabled.",
  ];
  if (mode === "school_passport") {
    items.push("Future: institutional Passport profile bound to deployment evidence snapshot.");
  }
  return {
    heading: "School Verification Readiness",
    level: levelFrom(checks),
    summary: "School verification preview — no live institutional credential issued.",
    items,
  };
}

function buildTeacherActivityProofReadiness(pkg: SanitizedEvidencePackage, mode: PassportBridgeMode): ReadinessSection {
  const flag = pkg.readiness_flags.quiz_attempts_recorded === true;
  const items = [
    `Quiz sessions recorded (aggregate flag): ${flag ? "Yes" : "No"}`,
    "Teacher names and emails are excluded from EduBox evidence by design.",
    "Future teacher Passport proof will use operational activity attestations only.",
  ];
  if (mode === "teacher_passport") {
    items.push("Future: facilitator proof for orphanage and training-centre contexts.");
  }
  return {
    heading: "Teacher Activity Proof Readiness",
    level: flag ? "partial" : "missing",
    summary: "Teacher proof readiness without PII — live attestation not connected.",
    items,
  };
}

function buildDeviceDeploymentProofReadiness(pkg: SanitizedEvidencePackage, mode: PassportBridgeMode): ReadinessSection {
  const dh = pkg.device_health_summary;
  const items = [
    `Device: ${dh.device_label ?? pkg.device_label}`,
    `Initialized: ${dh.device_initialized ? "Yes" : "No"}`,
    `Sync logs (aggregate): ${pkg.sync_log_count}`,
    "Device tokens and secrets never exported — deployment proof uses safe labels only.",
  ];
  if (mode === "device_deployment_passport") {
    items.push("Future: QA and fleet deployment stamps on device Passport record.");
  }
  return {
    heading: "Device Deployment Proof Readiness",
    level: dh.device_initialized ? "partial" : "missing",
    summary: "Device audit proof preview — not a live device credential.",
    items,
  };
}

function buildEntitlementReadiness(pkg: SanitizedEvidencePackage, mode: PassportBridgeMode): ReadinessSection {
  const rs = pkg.resource_rights_summary;
  const pending = rs.pending_rights_review_count ?? 0;
  const items = [
    `Resources tracked: ${rs.resource_count ?? pkg.resource_count}`,
    `Offline allowed: ${rs.offline_allowed_count ?? pkg.offline_allowed_resource_count}`,
    `Pending rights review: ${pending}`,
    "Subscription and entitlement checks require Passport commerce bridge — not live.",
  ];
  if (mode === "subscription_entitlement") {
    items.push("Future: entitlements tied to resource-rights metadata and programme subscriptions.");
  }
  return {
    heading: "Entitlement Readiness",
    level: pending === 0 && pkg.resource_count > 0 ? "partial" : "missing",
    summary: "Entitlement preview only — no subscription verification performed.",
    items,
  };
}

function buildAuditLogReadiness(pkg: SanitizedEvidencePackage): ReadinessSection {
  const hasLogs = pkg.sync_log_count > 0;
  return {
    heading: "Device Audit Readiness",
    level: hasLogs ? "partial" : "missing",
    summary: "Audit log readiness from aggregate sync counts — full audit stream needs backend.",
    items: [
      `Sync log count: ${pkg.sync_log_count}`,
      `Recent failures: ${pkg.device_health_summary.recent_sync_failures ?? 0}`,
      "Full immutable audit trail requires Nexus Passport and Learn OS integration.",
      "No raw log payloads with secrets exported from EduBox.",
    ],
  };
}

function buildRecommendedActions(pkg: SanitizedEvidencePackage, mode: PassportBridgeMode): string[] {
  const actions: string[] = [
    "Complete EduBox evidence validation before any future Passport handoff.",
    "Resolve required missing fields listed in this readiness plan.",
    "Obtain admin approval before enabling live Passport sync (future phase).",
  ];

  if (pkg.quiz_attempt_count === 0) {
    actions.push("Run offline quiz sessions to strengthen learning proof readiness.");
  }
  if (!pkg.device_health_summary.sync_endpoint_configured) {
    actions.push("Configure sync endpoint before audit log bridge to Passport.");
  }
  if ((pkg.resource_rights_summary.pending_rights_review_count ?? 0) > 0) {
    actions.push("Clear pending resource rights before entitlement proof bridge.");
  }

  const fromPackage = pkg.recommended_agent_actions.filter((a) =>
    a.toLowerCase().includes("evidence") || a.toLowerCase().includes("sync"),
  );
  actions.push(...fromPackage.slice(0, 2));

  if (mode === "ngo_impact_passport") {
    actions.push("Archive aggregate evidence export for programme M&E before Passport attestation.");
  }

  return [...new Set(actions)].slice(0, 10);
}

function buildSafetyNotes(pkg: SanitizedEvidencePackage): string[] {
  return [
    BRIDGE_STATUS,
    "No real credentials, certificates, badges, or entitlements are created in Phase A6.",
    "Passport bridge uses aggregate EduBox evidence only — no private learner records.",
    pkg.privacy_note ?? "Forbidden fields stripped during validation before readiness generation.",
  ];
}

/** Generate deterministic Passport bridge readiness from validated evidence. */
export function generatePassportBridgeReadiness(
  pkg: SanitizedEvidencePackage,
  mode: PassportBridgeMode = "student_passport",
): PassportBridgeReadiness {
  const proofCategories = buildProofCategories(pkg);
  const missing = buildRequiredMissingFields(pkg);

  return {
    mode,
    title: MODE_TITLES[mode],
    deviceLabel: pkg.device_label,
    generatedDate: formatGeneratedDate(pkg.generated_at),
    intro: modeIntro(mode, pkg.device_label),
    passportBridgeStatus: buildPassportBridgeStatus(),
    learningProofReadiness: buildLearningProofReadiness(pkg, mode),
    certificateReadiness: buildCertificateReadiness(pkg),
    badgeReadiness: buildBadgeReadiness(pkg),
    schoolVerificationReadiness: buildSchoolVerificationReadiness(pkg, mode),
    teacherActivityProofReadiness: buildTeacherActivityProofReadiness(pkg, mode),
    deviceDeploymentProofReadiness: buildDeviceDeploymentProofReadiness(pkg, mode),
    entitlementReadiness: buildEntitlementReadiness(pkg, mode),
    auditLogReadiness: buildAuditLogReadiness(pkg),
    proofCategories,
    requiredMissingFields: missing,
    privacyConstraints: buildPrivacyConstraints(),
    recommendedPassportActions: buildRecommendedActions(pkg, mode),
    safetyNotes: buildSafetyNotes(pkg),
    footer:
      "Generated by EmpowerEd Nexus Passport Bridge Readiness (Phase A6 MVP). " +
      "NOT connected to Nexus Passport — preview and planning only.",
  };
}

export function tryGeneratePassportBridgeReadiness(
  result: ValidationResult,
  mode: PassportBridgeMode = "student_passport",
): PassportBridgeReadiness | null {
  if (!result.ok) return null;
  return generatePassportBridgeReadiness(result.package, mode);
}

function sectionToText(section: ReadinessSection): string[] {
  return [
    `${section.heading} [${section.level.toUpperCase()}]`,
    section.summary,
    ...section.items.map((item) => `  • ${item}`),
    "",
  ];
}

/** Plain-text export — Passport-friendly, no HTML, no private data. */
export function buildPassportBridgeReadinessText(readiness: PassportBridgeReadiness): string {
  const modeLabel = PASSPORT_BRIDGE_MODES.find((m) => m.id === readiness.mode)?.label ?? readiness.mode;

  return [
    readiness.title,
    "EmpowerEd Nexus — Nexus Passport Bridge Readiness",
    "=".repeat(52),
    "",
    "IMPORTANT: Real Nexus Passport sync is NOT connected in Phase A6.",
    "",
    `Mode: ${modeLabel}`,
    `Device: ${readiness.deviceLabel}`,
    `Evidence date: ${readiness.generatedDate}`,
    "",
    readiness.intro,
    "",
    ...sectionToText(readiness.passportBridgeStatus),
    ...sectionToText(readiness.learningProofReadiness),
    ...sectionToText(readiness.certificateReadiness),
    ...sectionToText(readiness.badgeReadiness),
    ...sectionToText(readiness.entitlementReadiness),
    ...sectionToText(readiness.schoolVerificationReadiness),
    ...sectionToText(readiness.auditLogReadiness),
    "Future Proof Categories",
    "---------------------",
    ...readiness.proofCategories.map(
      (p) => `  • ${p.label} [${p.level.toUpperCase()}]: ${p.detail}`,
    ),
    "",
    "Missing Requirements Before Real Passport Sync",
    "----------------------------------------------",
    ...readiness.requiredMissingFields.map((m) => `  • ${m}`),
    "",
    "Privacy Boundaries",
    "------------------",
    ...readiness.privacyConstraints.map((p) => `  • ${p}`),
    "",
    "Recommended Next Actions",
    "------------------------",
    ...readiness.recommendedPassportActions.map((a) => `  • ${a}`),
    "",
    "Safety Notes",
    "------------",
    ...readiness.safetyNotes.map((n) => `  • ${n}`),
    "",
    readiness.footer,
  ].join("\n");
}

export function downloadPassportBridgeReadinessTxt(
  readiness: PassportBridgeReadiness,
  dateStamp?: string,
): void {
  const text = buildPassportBridgeReadinessText(readiness);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = dateStamp?.slice(0, 10).replace(/[^\d-]/g, "") || "passport";
  anchor.href = url;
  anchor.download = `passport-bridge-readiness-${readiness.mode}-${stamp}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function passportReadinessExcludesForbiddenContent(text: string): boolean {
  const lower = text.toLowerCase();
  return !FORBIDDEN_FIELDS.some((field) => {
    const pattern = new RegExp(`["']?${field}["']?\\s*:`, "i");
    return pattern.test(lower);
  });
}

export function isPassportSyncSetupStateOnly(readiness: PassportBridgeReadiness): boolean {
  return (
    readiness.passportBridgeStatus.level === "setup" &&
    readiness.passportBridgeStatus.summary.includes("NOT connected") &&
    readiness.requiredMissingFields.some((m) => m.includes("Passport API connection"))
  );
}
