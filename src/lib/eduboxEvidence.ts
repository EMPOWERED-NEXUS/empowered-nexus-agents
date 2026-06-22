/**
 * EduBox Evidence Package Receiver — safe validation and preview utilities.
 *
 * Treats all inbound packages as untrusted input. Strips forbidden fields,
 * validates shape, and produces setup-state evidence report previews only.
 * No persistence, no AI calls, no secrets.
 */

export const PACKAGE_TYPE = "edubox_agent_evidence_package" as const;

export const FORBIDDEN_FIELDS = [
  "password",
  "passwords",
  "raw_password",
  "secret",
  "token",
  "api_key",
  "email",
  "emails",
  "raw_media",
  "media_file",
  "private_learner_records",
  "service_credentials",
  // Align with EduBox export guardrails
  "password_hash",
  "device_token",
  "username",
  "full_name",
  "credential",
] as const;

export type ForbiddenField = (typeof FORBIDDEN_FIELDS)[number];

const FORBIDDEN_SET = new Set<string>(FORBIDDEN_FIELDS.map((k) => k.toLowerCase()));

/** Maximum JSON payload size accepted in the browser (512 KB). */
export const MAX_PACKAGE_BYTES = 512 * 1024;

export type ReadinessFlags = Record<string, string | boolean | number>;

export type ContentSummary = {
  published_course_count?: number;
  sample_course_titles?: string[];
  sample_lesson_titles?: string[];
  category_labels?: string[];
  has_demo_content?: boolean;
};

export type QuizSummary = {
  attempt_count?: number;
  average_score_percent?: number | null;
  completed_at_70_percent_count?: number;
  lesson_progress_total?: number;
  lesson_progress_completed?: number;
  top_lessons_by_attempts?: Array<{
    course_title?: string;
    lesson_title?: string;
    attempt_count?: number;
    average_score_percent?: number | null;
  }>;
};

export type ResourceRightsSummary = {
  resource_count?: number;
  offline_allowed_count?: number;
  online_only_count?: number;
  youtube_reference_count?: number;
  partner_package_count?: number;
  pending_rights_review_count?: number;
  youtube_online_only_policy?: boolean;
};

export type DeviceHealthSummary = {
  device_label?: string;
  device_initialized?: boolean;
  device_id_prefix?: string | null;
  sync_endpoint_configured?: boolean;
  sync_secret_configured?: boolean;
  recent_sync_log_count?: number;
  recent_sync_failures?: number;
  server_responding?: boolean;
};

export type SanitizedEvidencePackage = {
  package_type: typeof PACKAGE_TYPE;
  package_schema?: string;
  device_label: string;
  generated_at: string;
  course_count: number;
  lesson_count: number;
  resource_count: number;
  offline_allowed_resource_count: number;
  online_only_resource_count: number;
  quiz_attempt_count: number;
  average_score_percent: number | null;
  sync_log_count: number;
  readiness_flags: ReadinessFlags;
  content_summary: ContentSummary;
  quiz_summary: QuizSummary;
  resource_rights_summary: ResourceRightsSummary;
  device_health_summary: DeviceHealthSummary;
  recommended_agent_actions: string[];
  privacy_note?: string;
};

export type ValidationResult =
  | {
      ok: true;
      package: SanitizedEvidencePackage;
      warnings: string[];
      forbiddenKeysFound: string[];
    }
  | {
      ok: false;
      errors: string[];
      warnings: string[];
      forbiddenKeysFound: string[];
    };

export type AgentMapping = {
  agent: string;
  role: string;
  status: "Foundation ready" | "Setup-state" | "Future";
  detail: string;
  usesFromPackage: string[];
};

export const AGENT_MAPPINGS: AgentMapping[] = [
  {
    agent: "Evidence Agent",
    role: "Site impact reports and deployment evidence",
    status: "Foundation ready",
    detail:
      "Generates the Evidence Agent Report Preview below — executive summary, activity, and safety notes from validated packages.",
    usesFromPackage: [
      "executive summary",
      "learning activity",
      "content coverage",
      "quiz progress",
      "resource rights",
      "device readiness",
    ],
  },
  {
    agent: "LessonCraft Agent",
    role: "Lesson package planning and content improvement",
    status: "Setup-state",
    detail:
      "Generates LessonCraft Recommendations below — follow-up lessons, content improvements, quiz ideas, and offline package suggestions.",
    usesFromPackage: [
      "follow_up_lessons",
      "content_package_improvements",
      "quiz_improvement_ideas",
      "resource_rights_actions",
      "offline_package_suggestions",
    ],
  },
  {
    agent: "Teacher Support Agent",
    role: "Teaching recommendations and classroom readiness",
    status: "Setup-state",
    detail:
      "Generates the Teacher Support Action Plan — priorities, 7-day plan, discussion prompts, and sync next steps.",
    usesFromPackage: [
      "priority_focus",
      "weekly_plan",
      "discussion_prompts",
      "quiz_review_actions",
      "resource_usage_actions",
      "sync_reporting_next_step",
    ],
  },
  {
    agent: "Sync and Operations Agent",
    role: "Sync health and Nexus Learn OS handoff",
    status: "Foundation ready",
    detail: "Uses device readiness section — sync logs, failures, and configuration flags; secrets never exported.",
    usesFromPackage: ["device_readiness", "device_health_summary", "sync_log_count"],
  },
  {
    agent: "ExamShield Agent",
    role: "Assessment integrity and quiz patterns",
    status: "Future",
    detail: "Future phase: quiz and assessment readiness from aggregate attempt patterns — no individual attempts.",
    usesFromPackage: ["quiz_progress", "quiz_summary", "quiz_attempt_count"],
  },
];

export const SAMPLE_EVIDENCE_PACKAGE: SanitizedEvidencePackage = {
  package_type: PACKAGE_TYPE,
  package_schema: "edubox-agent-evidence/0.1",
  device_label: "EduBox Demo Device",
  generated_at: "2026-06-21T10:00:00.000Z",
  course_count: 2,
  lesson_count: 6,
  resource_count: 4,
  offline_allowed_resource_count: 2,
  online_only_resource_count: 2,
  quiz_attempt_count: 12,
  average_score_percent: 74.5,
  sync_log_count: 3,
  readiness_flags: {
    content_loaded: true,
    quiz_attempts_recorded: true,
    lesson_progress_recorded: true,
    sync_configured: false,
    agent_package_ready: true,
    send_to_nexus_agents: "Setup-state — preview only",
    admin_approval_required: true,
  },
  content_summary: {
    published_course_count: 2,
    sample_course_titles: ["Pilot Demo Biology", "Pilot Demo Mathematics"],
    sample_lesson_titles: ["Introduction to Cells", "Photosynthesis Basics"],
    category_labels: ["Science", "Mathematics"],
    has_demo_content: true,
  },
  quiz_summary: {
    attempt_count: 12,
    average_score_percent: 74.5,
    completed_at_70_percent_count: 8,
    lesson_progress_total: 10,
    lesson_progress_completed: 6,
    top_lessons_by_attempts: [
      {
        course_title: "Pilot Demo Biology",
        lesson_title: "Photosynthesis Basics",
        attempt_count: 7,
        average_score_percent: 78.0,
      },
    ],
  },
  resource_rights_summary: {
    resource_count: 4,
    offline_allowed_count: 2,
    online_only_count: 2,
    youtube_reference_count: 1,
    partner_package_count: 0,
    pending_rights_review_count: 1,
    youtube_online_only_policy: true,
  },
  device_health_summary: {
    device_label: "EduBox Demo Device",
    device_initialized: true,
    device_id_prefix: "EDU-DEMO",
    sync_endpoint_configured: false,
    sync_secret_configured: false,
    recent_sync_log_count: 3,
    recent_sync_failures: 0,
    server_responding: true,
  },
  recommended_agent_actions: [
    "Evidence Agent: archive this evidence package snapshot for deployment reporting.",
    "Teacher Support Agent: onboard teachers and run first offline quiz session.",
    "Sync Operations Agent: configure sync endpoint when site has internet.",
  ],
  privacy_note:
    "Agent evidence packages contain aggregate operational summaries only. They exclude passwords, emails, tokens, secrets, raw media, and individual learner records.",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function safeNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = safeNumber(value, NaN);
  return Number.isFinite(n) ? n : null;
}

function safeString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.slice(0, 500);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.slice(0, 500))
    .slice(0, 50);
}

function safeObject(value: unknown): Record<string, unknown> {
  return isPlainObject(value) ? value : {};
}

function safeReadinessFlags(value: unknown): ReadinessFlags {
  const obj = safeObject(value);
  const out: ReadinessFlags = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "boolean" || typeof val === "number") {
      out[key.slice(0, 80)] = val;
    } else if (typeof val === "string") {
      out[key.slice(0, 80)] = val.slice(0, 200);
    }
  }
  return out;
}

function sanitizeContentSummary(value: unknown): ContentSummary {
  const obj = safeObject(value);
  return {
    published_course_count: safeNumber(obj.published_course_count),
    sample_course_titles: safeStringArray(obj.sample_course_titles),
    sample_lesson_titles: safeStringArray(obj.sample_lesson_titles),
    category_labels: safeStringArray(obj.category_labels),
    has_demo_content: obj.has_demo_content === true,
  };
}

function sanitizeQuizSummary(value: unknown): QuizSummary {
  const obj = safeObject(value);
  const topRaw = Array.isArray(obj.top_lessons_by_attempts) ? obj.top_lessons_by_attempts : [];
  return {
    attempt_count: safeNumber(obj.attempt_count),
    average_score_percent: safeNullableNumber(obj.average_score_percent),
    completed_at_70_percent_count: safeNumber(obj.completed_at_70_percent_count),
    lesson_progress_total: safeNumber(obj.lesson_progress_total),
    lesson_progress_completed: safeNumber(obj.lesson_progress_completed),
    top_lessons_by_attempts: topRaw
      .filter(isPlainObject)
      .slice(0, 20)
      .map((row) => ({
        course_title: safeString(row.course_title),
        lesson_title: safeString(row.lesson_title),
        attempt_count: safeNumber(row.attempt_count),
        average_score_percent: safeNullableNumber(row.average_score_percent),
      })),
  };
}

function sanitizeResourceRightsSummary(value: unknown): ResourceRightsSummary {
  const obj = safeObject(value);
  return {
    resource_count: safeNumber(obj.resource_count),
    offline_allowed_count: safeNumber(obj.offline_allowed_count),
    online_only_count: safeNumber(obj.online_only_count),
    youtube_reference_count: safeNumber(obj.youtube_reference_count),
    partner_package_count: safeNumber(obj.partner_package_count),
    pending_rights_review_count: safeNumber(obj.pending_rights_review_count),
    youtube_online_only_policy: obj.youtube_online_only_policy === true,
  };
}

function sanitizeDeviceHealthSummary(value: unknown, deviceLabel: string): DeviceHealthSummary {
  const obj = safeObject(value);
  return {
    device_label: safeString(obj.device_label, deviceLabel),
    device_initialized: obj.device_initialized === true,
    device_id_prefix:
      typeof obj.device_id_prefix === "string" ? obj.device_id_prefix.slice(0, 32) : null,
    sync_endpoint_configured: obj.sync_endpoint_configured === true,
    sync_secret_configured: obj.sync_secret_configured === true,
    recent_sync_log_count: safeNumber(obj.recent_sync_log_count),
    recent_sync_failures: safeNumber(obj.recent_sync_failures),
    server_responding: obj.server_responding !== false,
  };
}

/** Walk JSON tree; collect forbidden key paths and return a stripped copy. */
export function stripForbiddenFields(
  input: unknown,
  path = "",
): { cleaned: unknown; forbiddenKeysFound: string[] } {
  const forbiddenKeysFound: string[] = [];

  function walk(value: unknown, currentPath: string): unknown {
    if (Array.isArray(value)) {
      return value.map((item, index) => walk(item, `${currentPath}[${index}]`));
    }
    if (!isPlainObject(value)) return value;

    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      const keyPath = currentPath ? `${currentPath}.${key}` : key;
      if (FORBIDDEN_SET.has(key.toLowerCase())) {
        forbiddenKeysFound.push(keyPath);
        continue;
      }
      out[key] = walk(val, keyPath);
    }
    return out;
  }

  return { cleaned: walk(input, path), forbiddenKeysFound };
}

/** Parse raw JSON text with size guard. Does not validate package shape. */
export function parseEvidenceJsonText(
  raw: string,
): { ok: true; data: unknown } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed)
    return { ok: false, error: "Paste or upload an EduBox evidence JSON package first." };
  if (new TextEncoder().encode(trimmed).length > MAX_PACKAGE_BYTES) {
    return { ok: false, error: `Package exceeds ${MAX_PACKAGE_BYTES / 1024} KB limit.` };
  }
  try {
    const data = JSON.parse(trimmed) as unknown;
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Invalid JSON — check formatting and try again." };
  }
}

/** Validate and sanitize an EduBox agent evidence package. */
export function validateEduboxEvidencePackage(input: unknown): ValidationResult {
  const warnings: string[] = [];
  const { cleaned, forbiddenKeysFound } = stripForbiddenFields(input);

  if (forbiddenKeysFound.length > 0) {
    warnings.push(
      `Removed ${forbiddenKeysFound.length} forbidden field(s): ${forbiddenKeysFound.slice(0, 8).join(", ")}${forbiddenKeysFound.length > 8 ? "…" : ""}`,
    );
  }

  if (!isPlainObject(cleaned)) {
    return {
      ok: false,
      errors: ["Package must be a JSON object."],
      warnings,
      forbiddenKeysFound,
    };
  }

  const packageType = cleaned.package_type;
  if (packageType !== PACKAGE_TYPE) {
    return {
      ok: false,
      errors: [
        `Invalid package_type: expected "${PACKAGE_TYPE}", received ${JSON.stringify(packageType)}.`,
      ],
      warnings,
      forbiddenKeysFound,
    };
  }

  const generatedAt = cleaned.generated_at;
  if (typeof generatedAt !== "string" || !generatedAt.trim()) {
    return {
      ok: false,
      errors: ["Missing or invalid generated_at (ISO timestamp string required)."],
      warnings,
      forbiddenKeysFound,
    };
  }

  const deviceLabel = safeString(cleaned.device_label, "EduBox Device");
  const sanitized: SanitizedEvidencePackage = {
    package_type: PACKAGE_TYPE,
    package_schema: safeString(cleaned.package_schema) || undefined,
    device_label: deviceLabel,
    generated_at: generatedAt.slice(0, 40),
    course_count: safeNumber(cleaned.course_count),
    lesson_count: safeNumber(cleaned.lesson_count),
    resource_count: safeNumber(cleaned.resource_count),
    offline_allowed_resource_count: safeNumber(cleaned.offline_allowed_resource_count),
    online_only_resource_count: safeNumber(cleaned.online_only_resource_count),
    quiz_attempt_count: safeNumber(cleaned.quiz_attempt_count),
    average_score_percent: safeNullableNumber(cleaned.average_score_percent),
    sync_log_count: safeNumber(cleaned.sync_log_count),
    readiness_flags: safeReadinessFlags(cleaned.readiness_flags),
    content_summary: sanitizeContentSummary(cleaned.content_summary),
    quiz_summary: sanitizeQuizSummary(cleaned.quiz_summary),
    resource_rights_summary: sanitizeResourceRightsSummary(cleaned.resource_rights_summary),
    device_health_summary: sanitizeDeviceHealthSummary(cleaned.device_health_summary, deviceLabel),
    recommended_agent_actions: safeStringArray(cleaned.recommended_agent_actions),
    privacy_note: safeString(cleaned.privacy_note) || undefined,
  };

  if (
    sanitized.recommended_agent_actions.length === 0 &&
    Array.isArray(cleaned.recommended_agent_actions)
  ) {
    warnings.push("recommended_agent_actions contained no safe string entries.");
  }

  return { ok: true, package: sanitized, warnings, forbiddenKeysFound };
}

/** Validate from raw JSON text (paste or file contents). */
export function validateEduboxEvidenceJson(
  raw: string,
): ValidationResult & { parseError?: string } {
  const parsed = parseEvidenceJsonText(raw);
  if (!parsed.ok) {
    return {
      ok: false,
      errors: [parsed.error],
      warnings: [],
      forbiddenKeysFound: [],
      parseError: parsed.error,
    };
  }
  return validateEduboxEvidencePackage(parsed.data);
}

export function formatGeneratedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** Plain-text evidence report for copy / download — no HTML. */
export function buildEvidenceReportText(pkg: SanitizedEvidencePackage): string {
  const cs = pkg.content_summary;
  const qs = pkg.quiz_summary;
  const rs = pkg.resource_rights_summary;
  const dh = pkg.device_health_summary;
  const lines: string[] = [
    "EduBox Evidence Report Preview",
    "EmpowerEd Nexus Agents — setup-state export",
    "============================================",
    "",
    `Device: ${pkg.device_label}`,
    `Generated: ${formatGeneratedDate(pkg.generated_at)}`,
    `Schema: ${pkg.package_schema ?? "edubox-agent-evidence/0.1"}`,
    "",
    "Counts",
    "------",
    `Courses: ${pkg.course_count}`,
    `Lessons: ${pkg.lesson_count}`,
    `Resources: ${pkg.resource_count}`,
    `Offline-allowed resources: ${pkg.offline_allowed_resource_count}`,
    `Online-only resources: ${pkg.online_only_resource_count}`,
    `Quiz attempts: ${pkg.quiz_attempt_count}`,
    `Average score: ${pkg.average_score_percent ?? "n/a"}%`,
    `Sync log entries: ${pkg.sync_log_count}`,
    "",
    "Readiness flags",
    "---------------",
    ...Object.entries(pkg.readiness_flags).map(([k, v]) => `- ${k}: ${String(v)}`),
    "",
    "Content summary",
    "---------------",
    `Published courses: ${cs.published_course_count ?? pkg.course_count}`,
    ...(cs.sample_course_titles?.length
      ? [`Sample courses: ${cs.sample_course_titles.join("; ")}`]
      : []),
    ...(cs.sample_lesson_titles?.length
      ? [`Sample lessons: ${cs.sample_lesson_titles.join("; ")}`]
      : []),
    ...(cs.category_labels?.length ? [`Categories: ${cs.category_labels.join("; ")}`] : []),
    "",
    "Quiz summary",
    "------------",
    `Attempts: ${qs.attempt_count ?? pkg.quiz_attempt_count}`,
    `Average score: ${qs.average_score_percent ?? pkg.average_score_percent ?? "n/a"}%`,
    `Lesson progress completed: ${qs.lesson_progress_completed ?? 0} / ${qs.lesson_progress_total ?? 0}`,
    "",
    "Resource rights",
    "---------------",
    `Total resources: ${rs.resource_count ?? pkg.resource_count}`,
    `Offline allowed: ${rs.offline_allowed_count ?? pkg.offline_allowed_resource_count}`,
    `Online only: ${rs.online_only_count ?? pkg.online_only_resource_count}`,
    `Pending rights review: ${rs.pending_rights_review_count ?? 0}`,
    "",
    "Device health",
    "-------------",
    `Initialized: ${dh.device_initialized ? "yes" : "no"}`,
    `Sync endpoint configured: ${dh.sync_endpoint_configured ? "yes" : "no"}`,
    `Recent sync failures: ${dh.recent_sync_failures ?? 0}`,
    "",
    "Recommended agent actions",
    "-------------------------",
    ...(pkg.recommended_agent_actions.length
      ? pkg.recommended_agent_actions.map((a) => `- ${a}`)
      : ["- (none provided)"]),
    "",
    "Privacy",
    "-------",
    pkg.privacy_note ??
      "Aggregate summaries only. No passwords, emails, tokens, raw media, or individual learner records.",
    "",
    "Status: Preview only — not sent to Nexus Learn OS or live agents.",
  ];
  return lines.join("\n");
}

export function downloadEvidenceReportTxt(pkg: SanitizedEvidencePackage): void {
  const text = buildEvidenceReportText(pkg);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = pkg.generated_at.slice(0, 10).replace(/[^\d-]/g, "") || "report";
  anchor.href = url;
  anchor.download = `edubox-evidence-${stamp}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}
