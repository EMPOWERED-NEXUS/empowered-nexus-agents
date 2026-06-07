// ExamShield — simulated secure exam integrity workflow.
//
// PROTOTYPE / DEMO ONLY.
// - Uses mock exam data only. No real GCE/national papers.
// - No real candidate data. No real government credentials.
// - "Encryption" and "locks" below are simulated for demonstration and are NOT
//   production security. Do not present this as a live secure-exam system.

export type ExamInput = {
  examName: string;
  subject: string;
  level: string;
  examDate: string;
  unlockTime: string;
  centreCode: string;
  rooms: number;
  candidates: number;
};

export const SAMPLE_EXAM: ExamInput = {
  examName: "Mock National Biology Exam",
  subject: "Biology",
  level: "Form 5",
  examDate: "2026-07-15",
  unlockTime: "08:30",
  centreCode: "CMR-YDE-001",
  rooms: 3,
  candidates: 120,
};

export type ExamPackage = {
  packageId: string;
  hash: string;
  encryption: string;
  centreLock: "Active";
  timeLock: "Active";
  deviceLock: "Active";
  status: "Locked";
  input: ExamInput;
  createdAt: string;
};

export type PrintMetadata = {
  centreCode: string;
  roomCode: string;
  printerId: string;
  eduboxId: string;
  timestamp: string;
  qrPlaceholder: string;
  watermarkId: string;
};

export type RiskLevel = "Low" | "Medium" | "High";

export type LeakTrace = {
  code: string;
  centre: string;
  room: string;
  printer: string;
  eduboxDevice: string;
  printTime: string;
  authorizedOfficer: string;
  riskLevel: RiskLevel;
  recommendedAction: string;
};

export type ReadinessStatus = "Ready" | "Warning" | "Failed";

export type ReadinessItem = {
  label: string;
  status: ReadinessStatus;
  detail: string;
};

export type AuditMetric = {
  label: string;
  value: string;
  tone: "ok" | "warn" | "alert";
};

const HEX = "0123456789abcdef";

function randomHex(len: number): string {
  const cryptoObj =
    typeof globalThis !== "undefined" ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(Math.ceil(len / 2));
    cryptoObj.getRandomValues(bytes);
    let out = "";
    for (const b of bytes) out += b.toString(16).padStart(2, "0");
    return out.slice(0, len);
  }
  let out = "";
  for (let i = 0; i < len; i++) out += HEX[Math.floor(Math.random() * 16)];
  return out;
}

/** Section 2 — Exam Package Builder. Returns a simulated encrypted package. */
export function buildExamPackage(input: ExamInput): ExamPackage {
  const idPart = randomHex(8).toUpperCase();
  const centre = (input.centreCode || "CTR-000").toUpperCase();
  return {
    packageId: `EXS-${centre}-${idPart}`,
    hash: randomHex(64),
    encryption: "AES-256-GCM (simulated)",
    centreLock: "Active",
    timeLock: "Active",
    deviceLock: "Active",
    status: "Locked",
    input,
    createdAt: new Date().toISOString(),
  };
}

/** Section 5 — Secure Print Agent. Generates simulated print metadata after approval. */
export function buildPrintMetadata(centreCode: string, rooms = 3): PrintMetadata {
  const room = Math.floor(Math.random() * Math.max(1, rooms)) + 1;
  return {
    centreCode: (centreCode || "CTR-000").toUpperCase(),
    roomCode: `RM-${String(room).padStart(2, "0")}`,
    printerId: `PRN-${randomHex(3).toUpperCase()}`,
    eduboxId: `EDX-${randomHex(4).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    qrPlaceholder: `QR-${randomHex(6).toUpperCase()}`,
    watermarkId: `WM-${randomHex(4).toUpperCase()}`,
  };
}

// A few known sample codes so the demo returns a consistent, believable trace.
const KNOWN_TRACES: Record<string, LeakTrace> = {
  "WM-7A3F": {
    code: "WM-7A3F",
    centre: "CMR-YDE-001 — Yaoundé Central",
    room: "RM-02",
    printer: "PRN-A19",
    eduboxDevice: "EDX-4C2B",
    printTime: "2026-07-15 08:34:12",
    authorizedOfficer: "Supt. A. Mballa (mock)",
    riskLevel: "High",
    recommendedAction:
      "Freeze centre RM-02 distribution, revoke printer PRN-A19 token, and open a chain-of-custody review.",
  },
  "QR-9F2C1D": {
    code: "QR-9F2C1D",
    centre: "CMR-DLA-004 — Douala North",
    room: "RM-01",
    printer: "PRN-B07",
    eduboxDevice: "EDX-88AA",
    printTime: "2026-07-15 08:31:47",
    authorizedOfficer: "Inv. R. Ngono (mock)",
    riskLevel: "Medium",
    recommendedAction:
      "Cross-check invigilator log for RM-01 and re-verify watermark batch before next session.",
  },
};

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Section 6 — Leak Investigation Agent. Looks up a QR/watermark code (mock). */
export function traceLeak(rawCode: string): LeakTrace | null {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;
  if (KNOWN_TRACES[code]) return KNOWN_TRACES[code];

  // Deterministic mock trace derived from the code so repeated lookups match.
  const h = hashCode(code);
  const risks: RiskLevel[] = ["Low", "Medium", "High"];
  const risk = risks[h % 3];
  const room = (h % 3) + 1;
  const actions: Record<RiskLevel, string> = {
    Low: "Log the trace and monitor. No immediate containment required.",
    Medium: "Re-verify the invigilator log and watermark batch for this room.",
    High: "Freeze distribution for the affected room and open a chain-of-custody review.",
  };
  return {
    code,
    centre: `CMR-YDE-00${(h % 5) + 1} — Mock Examination Centre`,
    room: `RM-${String(room).padStart(2, "0")}`,
    printer: `PRN-${HEX[h % 16].toUpperCase()}${(h % 90) + 10}`,
    eduboxDevice: `EDX-${(h % 9000 + 1000).toString(16).toUpperCase()}`,
    printTime: "2026-07-15 08:3" + (h % 9) + ":0" + (h % 6),
    authorizedOfficer: "Supt. Mock Officer (demo)",
    riskLevel: risk,
    recommendedAction: actions[risk],
  };
}

/** Section 4 — Centre Readiness Agent checklist (mock statuses). */
export const READINESS_CHECKLIST: ReadinessItem[] = [
  { label: "EduBox online", status: "Ready", detail: "Connected to centre micro-cloud." },
  { label: "Local drive connected", status: "Ready", detail: "Encrypted volume mounted." },
  { label: "Printer connected", status: "Ready", detail: "PRN-A19 responding." },
  { label: "Backup power available", status: "Warning", detail: "UPS at 64% — verify before unlock." },
  { label: "Paper stock confirmed", status: "Ready", detail: "Stock for 120 candidates + 5% spare." },
  { label: "Invigilator verified", status: "Ready", detail: "2 of 2 invigilators checked in." },
  { label: "Centre superintendent verified", status: "Ready", detail: "Identity confirmed (mock)." },
  { label: "Emergency unlock token available", status: "Failed", detail: "Token not yet issued for this session." },
];

/** Section 3 — Encryption & Locking Agent guarantees (simulated). */
export const ENCRYPTION_GUARANTEES: string[] = [
  "Paper encrypted before delivery",
  "Package cannot open before unlock time",
  "Package only opens on assigned EduBox device",
  "Multi-person approval required",
  "Local drive stores only encrypted files",
];

export const ENCRYPTION_TIMELINE: string[] = [
  "Question Bank",
  "Encrypted Package",
  "EduBox Centre",
  "Unlock Approval",
  "Secure Print",
  "Audit Log",
];

/** Section 7 — Results Audit Agent metrics (mock). */
export const RESULTS_AUDIT: AuditMetric[] = [
  { label: "Scripts scanned", value: "118 / 120", tone: "ok" },
  { label: "Candidate IDs anonymized", value: "120 (100%)", tone: "ok" },
  { label: "Marks recorded", value: "118", tone: "ok" },
  { label: "Suspicious score changes detected", value: "2 flagged", tone: "warn" },
  { label: "Missing scripts flagged", value: "2 missing", tone: "alert" },
  { label: "Audit report generated", value: "Ready to export", tone: "ok" },
];
