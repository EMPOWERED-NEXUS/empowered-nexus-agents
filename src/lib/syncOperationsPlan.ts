/**
 * Sync Operations and Device Health — deterministic ops plans from validated
 * EduBox evidence. No AI, no secrets, no Passport integration (readiness only).
 */

import {
  FORBIDDEN_FIELDS,
  formatGeneratedDate,
  type SanitizedEvidencePackage,
  type ValidationResult,
} from "./eduboxEvidence";

export type OperationsMode =
  | "device_operator"
  | "school_admin"
  | "nexus_support"
  | "manufacturer_qa"
  | "rental_fleet_manager"
  | "ngo_deployment_officer";

export type OpsSection = {
  heading: string;
  items: string[];
  status?: "ok" | "warn" | "alert" | "setup";
};

export type PassportReadinessItem = {
  label: string;
  status: "Setup-state";
  detail: string;
};

export type SyncOperationsPlan = {
  mode: OperationsMode;
  title: string;
  deviceLabel: string;
  generatedDate: string;
  intro: string;
  deviceStatus: OpsSection;
  syncStatus: OpsSection;
  storageOfflineReadiness: OpsSection;
  contentPackageReadiness: OpsSection;
  quizProgressReadiness: OpsSection;
  resourceRightsWarnings: OpsSection;
  launchReadiness: OpsSection;
  supportChecklist: OpsSection;
  recommendedNextSyncActions: OpsSection;
  passportReadinessNotes: OpsSection;
  passportBridgePreview: PassportReadinessItem[];
  safetyNotes: string[];
  footer: string;
};

export const OPERATIONS_MODES: {
  id: OperationsMode;
  label: string;
  description: string;
}[] = [
  {
    id: "device_operator",
    label: "Device operator",
    description: "On-site EduBox LAN, storage, and daily sync checks.",
  },
  {
    id: "school_admin",
    label: "School admin",
    description: "School rollout, content readiness, and staff coordination.",
  },
  {
    id: "nexus_support",
    label: "EmpowerEd Nexus support",
    description: "Remote support, sync troubleshooting, and handoff to Learn OS.",
  },
  {
    id: "manufacturer_qa",
    label: "Manufacturer QA",
    description: "Factory or refurb QA checklist before shipment.",
  },
  {
    id: "rental_fleet_manager",
    label: "Rental fleet manager",
    description: "Multi-site fleet health, returns, and redeployment.",
  },
  {
    id: "ngo_deployment_officer",
    label: "NGO deployment officer",
    description: "Programme deployment evidence and field operations.",
  },
];

/** Future Nexus Passport capabilities — preview only, not connected in A5. */
export const PASSPORT_BRIDGE_PREVIEW: PassportReadinessItem[] = [
  {
    label: "Verified student learning proof",
    status: "Setup-state",
    detail: "Aggregate quiz and progress signals could attest learning activity — no individual records in current package.",
  },
  {
    label: "Teacher activity proof",
    status: "Setup-state",
    detail: "Operational readiness flags and session counts — teacher PII excluded by design.",
  },
  {
    label: "School deployment proof",
    status: "Setup-state",
    detail: "Course, lesson, and device health summaries suitable for deployment certificates.",
  },
  {
    label: "Device usage proof",
    status: "Setup-state",
    detail: "Device label, sync logs, and aggregate usage — no device tokens exported.",
  },
  {
    label: "Certificate readiness",
    status: "Setup-state",
    detail: "Evidence package schema can feed certificate templates after Passport bridge.",
  },
  {
    label: "Entitlement and subscription checks",
    status: "Setup-state",
    detail: "Resource rights metadata aligns with future entitlement verification — not live yet.",
  },
  {
    label: "Audit log readiness",
    status: "Setup-state",
    detail: "Sync log counts and readiness flags — full audit stream requires backend integration.",
  },
  {
    label: "Badge or credential generation",
    status: "Setup-state",
    detail: "Aggregate milestones could trigger badges — individual credentials require Passport Phase B.",
  },
];

const MODE_TITLES: Record<OperationsMode, string> = {
  device_operator: "Sync Operations — Device Operator Plan",
  school_admin: "Sync Operations — School Admin Plan",
  nexus_support: "Sync Operations — Nexus Support Plan",
  manufacturer_qa: "Sync Operations — Manufacturer QA Checklist",
  rental_fleet_manager: "Sync Operations — Rental Fleet Plan",
  ngo_deployment_officer: "Sync Operations — NGO Deployment Plan",
};

function modeIntro(mode: OperationsMode, device: string): string {
  switch (mode) {
    case "device_operator":
      return `Operational checklist for on-site staff managing "${device}" — LAN, storage, and sync windows.`;
    case "school_admin":
      return `Deployment readiness for school leadership using evidence from "${device}".`;
    case "nexus_support":
      return `EmpowerEd Nexus support view for "${device}" — troubleshooting without secrets or PII.`;
    case "manufacturer_qa":
      return `Pre-shipment QA checklist derived from "${device}" evidence export.`;
    case "rental_fleet_manager":
      return `Fleet operations plan for rented EduBox unit "${device}" — return and redeploy readiness.`;
    case "ngo_deployment_officer":
      return `Field deployment operations for programme site "${device}" — evidence suitable for donor reporting.`;
  }
}

function statusLabel(ok: boolean, warn = false): OpsSection["status"] {
  if (ok) return "ok";
  if (warn) return "warn";
  return "alert";
}

function buildDeviceStatus(pkg: SanitizedEvidencePackage, mode: OperationsMode): OpsSection {
  const dh = pkg.device_health_summary;
  const items: string[] = [];
  const initialized = dh.device_initialized === true;
  const responding = dh.server_responding !== false;

  items.push(`Device label: ${dh.device_label ?? pkg.device_label}`);
  items.push(`Initialized: ${initialized ? "Yes" : "No — complete setup before classroom use"}`);
  items.push(`Server responding: ${responding ? "Yes" : "Check EduBox service on device"}`);
  if (dh.device_id_prefix) {
    items.push(`Device ID prefix: ${dh.device_id_prefix} (non-secret preview only)`);
  }

  if (mode === "manufacturer_qa") {
    items.push("QA gate: confirm factory image loads Agent Bridge and exports evidence JSON.");
    items.push("QA gate: verify no forbidden fields in sample export before shipment.");
  }
  if (mode === "rental_fleet_manager") {
    items.push("Record device return condition and re-initialisation before next rental.");
  }

  const ok = initialized && responding;
  return {
    heading: "Device Status",
    items,
    status: statusLabel(ok, !initialized && responding),
  };
}

function buildSyncStatus(pkg: SanitizedEvidencePackage, mode: OperationsMode): OpsSection {
  const dh = pkg.device_health_summary;
  const endpointOk = dh.sync_endpoint_configured === true;
  const secretFlag = dh.sync_secret_configured === true;
  const failures = dh.recent_sync_failures ?? 0;
  const logs = dh.recent_sync_log_count ?? pkg.sync_log_count;

  const items: string[] = [
    `Sync endpoint configured: ${endpointOk ? "Yes" : "No — configure when internet available"}`,
    `Sync secret flag: ${secretFlag ? "Set on device (value never exported)" : "Not configured"}`,
    `Sync log entries (aggregate): ${pkg.sync_log_count}`,
    `Recent sync log sample count: ${logs}`,
    `Recent sync failures: ${failures}${failures > 0 ? " — investigate before next handoff" : ""}`,
  ];

  if (mode === "nexus_support") {
    items.push("Remote check: ask site to re-export evidence after successful sync test.");
  }
  if (!endpointOk) {
    items.push("Nexus Learn OS handoff blocked until sync endpoint is configured.");
  }

  return {
    heading: "Sync Status",
    items,
    status: statusLabel(endpointOk && failures === 0, endpointOk && failures > 0),
  };
}

function buildStorageOfflineReadiness(pkg: SanitizedEvidencePackage, mode: OperationsMode): OpsSection {
  const offline = pkg.offline_allowed_resource_count;
  const online = pkg.online_only_resource_count;
  const items: string[] = [
    `${pkg.lesson_count} lesson(s) and ${pkg.course_count} course(s) on device storage.`,
    `${offline} offline-allowed resource(s); ${online} online-only reference(s).`,
    "Confirm classroom LAN serves lessons without internet before relying on offline mode.",
    "Monitor local storage if adding large partner packages — aggregate counts only in this export.",
  ];

  if (offline === 0 && pkg.resource_count > 0) {
    items.push("Alert: no resources marked offline-allowed — review media rights before deployment.");
  }

  if (mode === "device_operator") {
    items.push("Weekly: reboot EduBox server during low-use window if sync failures persist.");
  }
  if (mode === "rental_fleet_manager") {
    items.push("Clear or refresh demo content between rentals per fleet policy.");
  }

  return {
    heading: "Storage and Offline Readiness",
    items,
    status: statusLabel(offline > 0 || pkg.resource_count === 0, offline === 0 && pkg.resource_count > 0),
  };
}

function buildContentPackageHealth(pkg: SanitizedEvidencePackage): OpsSection {
  const cs = pkg.content_summary;
  const items: string[] = [
    `Published courses: ${pkg.course_count} (summary count: ${cs.published_course_count ?? pkg.course_count})`,
    `Lessons on device: ${pkg.lesson_count}`,
    `Content loaded flag: ${pkg.readiness_flags.content_loaded === true ? "Yes" : "Not confirmed"}`,
  ];

  if (cs.has_demo_content) {
    items.push("Warning: demo/pilot content detected — swap for production packages before launch.");
  }
  if (pkg.course_count === 0) {
    items.push("Alert: no courses published — load content before site launch.");
  }
  if (cs.sample_course_titles?.length) {
    items.push(`Sample courses: ${cs.sample_course_titles.slice(0, 4).join("; ")}`);
  }

  return {
    heading: "Content Package Readiness",
    items,
    status: statusLabel(pkg.course_count > 0 && pkg.readiness_flags.content_loaded === true, pkg.course_count > 0),
  };
}

function buildQuizProgressReadiness(pkg: SanitizedEvidencePackage): OpsSection {
  const qs = pkg.quiz_summary;
  const items: string[] = [
    `Quiz attempts (aggregate): ${pkg.quiz_attempt_count}`,
    `Quiz attempts recorded flag: ${pkg.readiness_flags.quiz_attempts_recorded === true ? "Yes" : "No"}`,
    `Lesson progress: ${qs.lesson_progress_completed ?? 0} / ${qs.lesson_progress_total ?? 0} completed`,
    `Progress recorded flag: ${pkg.readiness_flags.lesson_progress_recorded === true ? "Yes" : "No"}`,
  ];

  if (pkg.quiz_attempt_count > 0) {
    items.push("Quiz/progress data suitable for aggregate sync to Nexus Learn OS when online.");
  } else {
    items.push("No quiz attempts yet — sync payload will lack activity proof until teachers run sessions.");
  }

  return {
    heading: "Quiz and Progress Sync Readiness",
    items,
    status: statusLabel(pkg.quiz_attempt_count > 0, pkg.course_count > 0 && pkg.quiz_attempt_count === 0),
  };
}

function buildResourceRightsWarnings(pkg: SanitizedEvidencePackage): OpsSection {
  const rs = pkg.resource_rights_summary;
  const pending = rs.pending_rights_review_count ?? 0;
  const items: string[] = [];

  if (pending > 0) {
    items.push(`Alert: ${pending} resource(s) pending rights review — block offline classroom use until cleared.`);
  }
  if ((rs.online_only_count ?? pkg.online_only_resource_count) > 0) {
    items.push(
      `${rs.online_only_count ?? pkg.online_only_resource_count} online-only resource(s) — require connectivity or substitutes.`,
    );
  }
  if (rs.youtube_online_only_policy) {
    items.push("YouTube references must remain online-only per EduBox policy.");
  }
  if (items.length === 0) {
    items.push("No critical resource-rights alerts in this export.");
  }

  items.push(`Total tracked resources: ${rs.resource_count ?? pkg.resource_count}`);

  return {
    heading: "Resource Rights Warnings",
    items,
    status: statusLabel(pending === 0, pending > 0),
  };
}

function buildLaunchReadiness(pkg: SanitizedEvidencePackage, mode: OperationsMode): OpsSection {
  const flags = pkg.readiness_flags;
  const items: string[] = [
    `Agent package ready: ${flags.agent_package_ready === true ? "Yes" : "Setup-state"}`,
    `Admin approval required: ${flags.admin_approval_required === true ? "Yes" : "No"}`,
    `Send to Nexus agents: ${String(flags.send_to_nexus_agents ?? "Setup-state")}`,
  ];

  const checks = [
    flags.content_loaded === true,
    pkg.device_health_summary.device_initialized === true,
    pkg.course_count > 0,
  ];
  const readyCount = checks.filter(Boolean).length;
  items.push(`Launch checklist: ${readyCount}/3 core gates passed (content, device init, courses).`);

  if (mode === "ngo_deployment_officer") {
    items.push("Archive this export for programme M&E before announcing site launch.");
  }
  if (mode === "school_admin") {
    items.push("Brief teachers only after device init and content load checks pass.");
  }

  return {
    heading: "Launch Readiness",
    items,
    status: statusLabel(readyCount >= 3, readyCount >= 2),
  };
}

function buildSupportChecklist(pkg: SanitizedEvidencePackage, mode: OperationsMode): OpsSection {
  const templates: Record<OperationsMode, string[]> = {
    device_operator: [
      "Confirm EduBox LAN IP reachable from classroom tablets.",
      "Export fresh evidence JSON after content or sync changes.",
      "Log sync window times when internet is available.",
      "Escalate to Nexus support if recent sync failures > 0.",
    ],
    school_admin: [
      "Assign a device operator and backup contact.",
      "Schedule teacher onboarding after content load verified.",
      "Store evidence export in school records (aggregates only).",
    ],
    nexus_support: [
      "Review device_health_summary flags — never ask for sync secrets in chat.",
      "Compare sync_log_count across two exports to confirm progress.",
      "Guide site to Agent Bridge export if package looks stale.",
    ],
    manufacturer_qa: [
      "Run evidence export on golden image.",
      "Verify package_type and schema version.",
      "Confirm forbidden-field scan passes on sample export.",
      "Seal device with QA sticker and device_id_prefix recorded.",
    ],
    rental_fleet_manager: [
      "Log rental start/end dates with device label.",
      "Reset or refresh content per fleet policy between clients.",
      "Capture evidence export at return and redeploy.",
    ],
    ngo_deployment_officer: [
      "Match aggregate quiz counts to field visit notes.",
      "Confirm resource rights cleared for offline use.",
      "Plan next evidence export date for donor reporting.",
    ],
  };

  return {
    heading: "Support Checklist",
    items: templates[mode],
    status: "ok",
  };
}

function buildRecommendedNextSyncActions(pkg: SanitizedEvidencePackage): OpsSection {
  const items: string[] = [];
  const dh = pkg.device_health_summary;

  if (!dh.sync_endpoint_configured) {
    items.push("Configure EDUBOX_SYNC_BASE_URL when site has stable internet.");
  } else {
    items.push("Run a test sync during next connectivity window and re-export evidence.");
  }

  if (pkg.sync_log_count === 0) {
    items.push("Record first sync log entry after endpoint configuration.");
  }

  const syncActions = pkg.recommended_agent_actions.filter((a) =>
    a.toLowerCase().includes("sync"),
  );
  for (const action of syncActions) {
    items.push(action);
  }

  items.push("Hand off validated evidence to Nexus Learn OS when admin approval is granted (setup-state).");
  items.push("Do not transmit sync secrets, tokens, or credentials in support tickets.");

  return {
    heading: "Recommended Next Sync Actions",
    items: items.slice(0, 8),
    status: dh.sync_endpoint_configured ? "ok" : "warn",
  };
}

function buildPassportReadinessNotes(pkg: SanitizedEvidencePackage): OpsSection {
  const hasActivity = pkg.quiz_attempt_count > 0;
  const hasContent = pkg.course_count > 0;
  const hasDevice = pkg.device_health_summary.device_initialized === true;

  const items: string[] = [
    "Nexus Passport is NOT connected in Phase A5 — readiness preview only.",
    `Learning activity signals: ${hasActivity ? "aggregate quiz data present" : "awaiting first quiz sessions"}.`,
    `Deployment signals: ${hasContent ? "content loaded" : "content not ready"}.`,
    `Device signals: ${hasDevice ? "device initialized" : "initialization pending"}.`,
    "Future bridge will use admin-approved, redacted evidence — never raw learner records.",
    "Passport send button remains disabled until secure backend integration exists.",
  ];

  return {
    heading: "Nexus Passport Proof Readiness Notes",
    items,
    status: "setup",
  };
}

function buildSafetyNotes(pkg: SanitizedEvidencePackage): string[] {
  return [
    "Operations plan uses aggregate EduBox evidence — no individual learner records.",
    "Sync secrets and API keys are never exported or displayed — only configured/not configured flags.",
    "Generated deterministically in the browser — live AI operations analysis is not used.",
    "Nexus Passport integration is setup-state only in this phase.",
    pkg.privacy_note ?? "Treat all packages as untrusted input validated before display.",
  ];
}

function ensureItems(section: OpsSection, fallback: string): OpsSection {
  if (section.items.length > 0) return section;
  return { ...section, items: [fallback] };
}

/** Generate deterministic Sync Operations plan from validated evidence. */
export function generateSyncOperationsPlan(
  pkg: SanitizedEvidencePackage,
  mode: OperationsMode = "device_operator",
): SyncOperationsPlan {
  return {
    mode,
    title: MODE_TITLES[mode],
    deviceLabel: pkg.device_label,
    generatedDate: formatGeneratedDate(pkg.generated_at),
    intro: modeIntro(mode, pkg.device_label),
    deviceStatus: buildDeviceStatus(pkg, mode),
    syncStatus: buildSyncStatus(pkg, mode),
    storageOfflineReadiness: buildStorageOfflineReadiness(pkg, mode),
    contentPackageReadiness: buildContentPackageHealth(pkg),
    quizProgressReadiness: buildQuizProgressReadiness(pkg),
    resourceRightsWarnings: buildResourceRightsWarnings(pkg),
    launchReadiness: buildLaunchReadiness(pkg, mode),
    supportChecklist: buildSupportChecklist(pkg, mode),
    recommendedNextSyncActions: ensureItems(
      buildRecommendedNextSyncActions(pkg),
      "Configure sync and re-export evidence after next connectivity window.",
    ),
    passportReadinessNotes: buildPassportReadinessNotes(pkg),
    passportBridgePreview: PASSPORT_BRIDGE_PREVIEW,
    safetyNotes: buildSafetyNotes(pkg),
    footer:
      "Generated by EmpowerEd Nexus Sync Operations Agent (deterministic MVP). " +
      "Not sent to Nexus Learn OS, Nexus Passport, or live AI services.",
  };
}

export function tryGenerateSyncOperationsPlan(
  result: ValidationResult,
  mode: OperationsMode = "device_operator",
): SyncOperationsPlan | null {
  if (!result.ok) return null;
  return generateSyncOperationsPlan(result.package, mode);
}

function sectionToText(section: OpsSection): string[] {
  const status = section.status ? ` [${section.status.toUpperCase()}]` : "";
  return [
    `${section.heading}${status}`,
    "-".repeat(section.heading.length),
    ...section.items.map((item) => `  • ${item}`),
    "",
  ];
}

/** Plain-text export — operations-friendly, no HTML, no private data. */
export function buildSyncOperationsPlanText(plan: SyncOperationsPlan): string {
  const modeLabel = OPERATIONS_MODES.find((m) => m.id === plan.mode)?.label ?? plan.mode;
  const passportLines = plan.passportBridgePreview.map(
    (p) => `  • ${p.label} (${p.status}): ${p.detail}`,
  );

  return [
    plan.title,
    "EmpowerEd Nexus — Sync Operations and Device Health Plan",
    "=".repeat(52),
    "",
    `Mode: ${modeLabel}`,
    `Device: ${plan.deviceLabel}`,
    `Evidence date: ${plan.generatedDate}`,
    "",
    plan.intro,
    "",
    ...sectionToText(plan.deviceStatus),
    ...sectionToText(plan.syncStatus),
    ...sectionToText(plan.storageOfflineReadiness),
    ...sectionToText(plan.contentPackageReadiness),
    ...sectionToText(plan.quizProgressReadiness),
    ...sectionToText(plan.resourceRightsWarnings),
    ...sectionToText(plan.launchReadiness),
    ...sectionToText(plan.supportChecklist),
    ...sectionToText(plan.recommendedNextSyncActions),
    ...sectionToText(plan.passportReadinessNotes),
    "Nexus Passport Bridge Preview (not connected)",
    "----------------------------------------------",
    ...passportLines,
    "",
    "Safety Notes",
    "------------",
    ...plan.safetyNotes.map((n) => `  • ${n}`),
    "",
    plan.footer,
  ].join("\n");
}

export function downloadSyncOperationsPlanTxt(plan: SyncOperationsPlan, dateStamp?: string): void {
  const text = buildSyncOperationsPlanText(plan);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = dateStamp?.slice(0, 10).replace(/[^\d-]/g, "") || "ops";
  anchor.href = url;
  anchor.download = `sync-operations-plan-${plan.mode}-${stamp}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function syncPlanExcludesForbiddenContent(text: string): boolean {
  const lower = text.toLowerCase();
  return !FORBIDDEN_FIELDS.some((field) => {
    const pattern = new RegExp(`["']?${field}["']?\\s*:`, "i");
    return pattern.test(lower);
  });
}

export function isPassportIntegrationSetupStateOnly(plan: SyncOperationsPlan): boolean {
  return (
    plan.passportReadinessNotes.status === "setup" &&
    plan.passportBridgePreview.every((p) => p.status === "Setup-state") &&
    plan.passportReadinessNotes.items.some((i) => i.includes("NOT connected"))
  );
}
