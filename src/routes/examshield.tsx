import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import {
  ShieldCheck,
  Lock,
  Clock,
  QrCode,
  FileSearch,
  Printer,
  ClipboardCheck,
  KeyRound,
  HardDrive,
  Users,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  FileBarChart2,
} from "lucide-react";
import {
  SAMPLE_EXAM,
  buildExamPackage,
  buildPrintMetadata,
  traceLeak,
  READINESS_CHECKLIST,
  ENCRYPTION_GUARANTEES,
  ENCRYPTION_TIMELINE,
  RESULTS_AUDIT,
  type ExamInput,
  type ExamPackage,
  type PrintMetadata,
  type LeakTrace,
  type ReadinessStatus,
} from "@/lib/examshield";

export const Route = createFileRoute("/examshield")({
  head: () => ({
    meta: [
      { title: "ExamShield — EduBox Agent Studio" },
      {
        name: "description",
        content:
          "Prototype workflow: secure offline-first exam integrity for paper-based schools — simulated encrypted packages, printing, traceability and audit.",
      },
    ],
  }),
  component: ExamShieldPage,
});

const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-[color:var(--color-brand-blue)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20";

function ExamShieldPage() {
  return (
    <SiteLayout>
      <Hero />
      <div className="mx-auto max-w-6xl space-y-16 px-5 pb-24">
        <Overview />
        <PackageBuilder />
        <EncryptionAgent />
        <ReadinessAgent />
        <SecurePrintAgent />
        <LeakInvestigationAgent />
        <ResultsAuditAgent />
      </div>
    </SiteLayout>
  );
}

/* ----------------------------- Shared UI ----------------------------- */

function SectionHeading({
  index,
  icon: Icon,
  title,
  subtitle,
}: {
  index: number;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Agent {index}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReadinessStatus | "Active" | "Locked" | "Authorized" }) {
  const map: Record<string, string> = {
    Ready: "bg-brand-green/12 text-brand-green ring-1 ring-brand-green/25",
    Active: "bg-brand-green/12 text-brand-green ring-1 ring-brand-green/25",
    Authorized: "bg-brand-green/12 text-brand-green ring-1 ring-brand-green/25",
    Warning: "bg-amber-400/15 text-amber-600 ring-1 ring-amber-500/30",
    Failed: "bg-destructive/12 text-destructive ring-1 ring-destructive/25",
    Locked: "bg-navy/10 text-navy ring-1 ring-navy/20",
  };
  const Icon =
    status === "Warning" ? AlertTriangle : status === "Failed" ? XCircle : status === "Locked" ? Lock : CheckCircle2;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] ?? "bg-muted text-muted-foreground"}`}
    >
      <Icon className="h-3.5 w-3.5" /> {status}
    </span>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-semibold text-foreground ${mono ? "break-all font-mono text-xs" : "text-sm"}`}>
        {value}
      </div>
    </div>
  );
}

/* ------------------------------- Hero -------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--color-accent)_0%,_transparent_55%)]" />
      <div className="mx-auto max-w-6xl px-5 pt-14 pb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-blue" /> ExamShield · Prototype workflow
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Secure offline-first exam integrity for paper-based schools.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          ExamShield demonstrates how EduBox can help schools and examination bodies protect
          paper-based exams with encrypted packages, controlled printing, traceability, and audit
          evidence.
        </p>
        <div className="mt-5 inline-flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Prototype demonstration using mock exam data only. Encryption and locks are simulated —
            this is not production security.
          </span>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- 1. Overview ----------------------------- */

const OVERVIEW_CARDS = [
  { icon: Lock, title: "Encrypted Exam Packages", desc: "Papers sealed into encrypted, tamper-evident packages before they ever leave the question bank." },
  { icon: Clock, title: "Time-Locked Centre Printing", desc: "Packages stay sealed until the approved unlock time at the assigned examination centre." },
  { icon: QrCode, title: "QR & Watermark Traceability", desc: "Every printed script carries a unique QR and watermark ID for end-to-end traceability." },
  { icon: FileSearch, title: "Results & Script Audit", desc: "Scanned scripts, anonymized candidates, and flagged anomalies feed an exportable audit report." },
];

function Overview() {
  return (
    <section id="overview" className="pt-12">
      <SectionHeading
        index={1}
        icon={ShieldCheck}
        title="Overview"
        subtitle="Four cooperating agents protect a paper-based exam from question bank to audit evidence."
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {OVERVIEW_CARDS.map((c) => (
          <div key={c.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy/5 text-brand-blue ring-1 ring-border">
              <c.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-base font-semibold text-foreground">{c.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------- 2. Exam Package Builder ----------------------- */

function PackageBuilder() {
  const [form, setForm] = useState<ExamInput>({
    examName: "",
    subject: "",
    level: "",
    examDate: "",
    unlockTime: "",
    centreCode: "",
    rooms: 1,
    candidates: 1,
  });
  const [loading, setLoading] = useState(false);
  const [pkg, setPkg] = useState<ExamPackage | null>(null);

  const useSample = () => {
    setForm(SAMPLE_EXAM);
    toast.success("Sample mock paper loaded.");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.examName.trim() || !form.centreCode.trim()) {
      toast.error("Enter at least an exam name and centre code.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setPkg(buildExamPackage(form));
    setLoading(false);
    toast.success("Encrypted exam package built (simulated).");
  };

  const set = (k: keyof ExamInput, v: string | number) => setForm({ ...form, [k]: v });

  return (
    <section id="builder">
      <SectionHeading
        index={2}
        icon={Lock}
        title="Exam Package Builder"
        subtitle="Define a mock exam and generate a simulated encrypted, locked package."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-6 shadow-sm lg:col-span-3">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Exam name">
              <input className={inputCls} value={form.examName} onChange={(e) => set("examName", e.target.value)} placeholder="e.g. Mock National Biology Exam" />
            </Field>
            <Field label="Subject">
              <input className={inputCls} value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="e.g. Biology" />
            </Field>
            <Field label="Level">
              <input className={inputCls} value={form.level} onChange={(e) => set("level", e.target.value)} placeholder="e.g. Form 5" />
            </Field>
            <Field label="Centre code">
              <input className={inputCls} value={form.centreCode} onChange={(e) => set("centreCode", e.target.value)} placeholder="e.g. CMR-YDE-001" />
            </Field>
            <Field label="Exam date">
              <input type="date" className={inputCls} value={form.examDate} onChange={(e) => set("examDate", e.target.value)} />
            </Field>
            <Field label="Unlock time">
              <input type="time" className={inputCls} value={form.unlockTime} onChange={(e) => set("unlockTime", e.target.value)} />
            </Field>
            <Field label="Number of rooms">
              <input type="number" min={1} className={inputCls} value={form.rooms} onChange={(e) => set("rooms", Number(e.target.value))} />
            </Field>
            <Field label="Number of candidates">
              <input type="number" min={1} className={inputCls} value={form.candidates} onChange={(e) => set("candidates", Number(e.target.value))} />
            </Field>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-70">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Encrypting…</> : <><Lock className="h-4 w-4" /> Build Encrypted Package</>}
            </button>
            <button type="button" onClick={useSample} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">
              Use sample mock paper
            </button>
          </div>
        </form>

        <div className="lg:col-span-2">
          {pkg ? (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">Package generated</div>
                <StatusBadge status="Locked" />
              </div>
              <div className="mt-4 space-y-3">
                <KV label="Package ID" value={pkg.packageId} mono />
                <KV label="SHA-256 hash" value={pkg.hash} mono />
                <div className="grid grid-cols-2 gap-3">
                  <KV label="Encryption" value={pkg.encryption} />
                  <KV label="Package status" value={pkg.status} />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <LockChip label="Centre lock" />
                  <LockChip label="Time lock" />
                  <LockChip label="Device lock" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[16rem] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background p-6 text-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Build a package to generate a simulated ID, hash, and lock status.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LockChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/12 px-2.5 py-1 text-xs font-semibold text-brand-green ring-1 ring-brand-green/25">
      <CheckCircle2 className="h-3.5 w-3.5" /> {label}: Active
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

/* ------------------ 3. Encryption & Locking Agent -------------------- */

function EncryptionAgent() {
  return (
    <section id="encryption">
      <SectionHeading
        index={3}
        icon={KeyRound}
        title="Encryption & Locking Agent"
        subtitle="How a package stays sealed until the right place, time, device, and people align."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="text-sm font-semibold text-foreground">Guarantees (simulated)</div>
          <ul className="mt-4 space-y-3">
            {ENCRYPTION_GUARANTEES.map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm text-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" /> {g}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="text-sm font-semibold text-foreground">Workflow timeline</div>
          <ol className="mt-4 space-y-2">
            {ENCRYPTION_TIMELINE.map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-primary-foreground">{i + 1}</span>
                <span className="text-sm font-medium text-foreground">{step}</span>
                {i < ENCRYPTION_TIMELINE.length - 1 && <ChevronRight className="ml-auto h-4 w-4 text-brand-blue" />}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* -------------------- 4. Centre Readiness Agent ---------------------- */

function ReadinessAgent() {
  const counts = READINESS_CHECKLIST.reduce(
    (acc, i) => ((acc[i.status] = (acc[i.status] ?? 0) + 1), acc),
    {} as Record<ReadinessStatus, number>,
  );
  return (
    <section id="readiness">
      <SectionHeading
        index={4}
        icon={ClipboardCheck}
        title="Centre Readiness Agent"
        subtitle="A pre-unlock checklist confirming the centre is ready for secure printing."
      />
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Summary:</span>
        <StatusBadge status="Ready" /> <span className="text-xs text-muted-foreground">{counts.Ready ?? 0}</span>
        <StatusBadge status="Warning" /> <span className="text-xs text-muted-foreground">{counts.Warning ?? 0}</span>
        <StatusBadge status="Failed" /> <span className="text-xs text-muted-foreground">{counts.Failed ?? 0}</span>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {READINESS_CHECKLIST.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <HardDrive className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-semibold text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.detail}</div>
              </div>
            </div>
            <StatusBadge status={item.status} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------- 5. Secure Print Agent ------------------------ */

function SecurePrintAgent() {
  const [approved, setApproved] = useState(false);
  const [meta, setMeta] = useState<PrintMetadata | null>(null);

  const approve = () => {
    const m = buildPrintMetadata(SAMPLE_EXAM.centreCode, SAMPLE_EXAM.rooms);
    setMeta(m);
    setApproved(true);
    toast.success("Print authorized (simulated).");
  };

  return (
    <section id="print">
      <SectionHeading
        index={5}
        icon={Printer}
        title="Secure Print Agent"
        subtitle="Printing stays locked until unlock conditions are approved at the centre."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">Print status</div>
            <StatusBadge status={approved ? "Authorized" : "Locked"} />
          </div>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 text-brand-blue" /> Locked before exam time</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Unlock conditions: time + centre + device + approval</li>
            <li className="flex items-start gap-2"><Users className="mt-0.5 h-4 w-4 text-brand-blue" /> Multi-person approval required</li>
          </ul>
          <button
            onClick={approve}
            disabled={approved}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-70"
          >
            {approved ? <><CheckCircle2 className="h-4 w-4" /> Print Authorized</> : <><KeyRound className="h-4 w-4" /> Simulate Approval</>}
          </button>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="text-sm font-semibold text-foreground">Print metadata</div>
          {meta ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <KV label="Centre code" value={meta.centreCode} />
              <KV label="Room code" value={meta.roomCode} />
              <KV label="Printer ID" value={meta.printerId} />
              <KV label="EduBox ID" value={meta.eduboxId} />
              <KV label="Timestamp" value={new Date(meta.timestamp).toLocaleString()} />
              <KV label="QR placeholder" value={meta.qrPlaceholder} mono />
              <div className="col-span-2"><KV label="Watermark ID" value={meta.watermarkId} mono /></div>
            </div>
          ) : (
            <div className="mt-4 flex min-h-[10rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-6 text-center">
              <Printer className="h-7 w-7 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Approve printing to generate traceable metadata.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------- 6. Leak Investigation Agent --------------------- */

function LeakInvestigationAgent() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<LeakTrace | null>(null);
  const [searched, setSearched] = useState(false);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const r = traceLeak(code);
    setResult(r);
    setSearched(true);
    if (!r) toast.error("Enter a QR code or watermark ID to trace.");
  };

  const riskTone: Record<string, ReadinessStatus> = { Low: "Ready", Medium: "Warning", High: "Failed" };

  return (
    <section id="leak">
      <SectionHeading
        index={6}
        icon={FileSearch}
        title="Leak Investigation Agent"
        subtitle="Trace a leaked QR code or watermark ID back to its source (mock data). Try WM-7A3F or QR-9F2C1D."
      />
      <form onSubmit={search} className="mt-8 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[16rem]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter leaked QR code or watermark ID…"
            className={`${inputCls} pl-9`}
          />
        </div>
        <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">
          <Search className="h-4 w-4" /> Trace source
        </button>
      </form>

      {result ? (
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">Trace result · <span className="font-mono">{result.code}</span></div>
            <StatusBadge status={riskTone[result.riskLevel]} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <KV label="Centre" value={result.centre} />
            <KV label="Room" value={result.room} />
            <KV label="Printer" value={result.printer} />
            <KV label="EduBox device" value={result.eduboxDevice} />
            <KV label="Print time" value={result.printTime} />
            <KV label="Authorized officer" value={result.authorizedOfficer} />
            <KV label="Risk level" value={result.riskLevel} />
            <div className="md:col-span-2"><KV label="Recommended action" value={result.recommendedAction} /></div>
          </div>
        </div>
      ) : (
        searched && (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
            Enter a QR code or watermark ID to run a trace.
          </div>
        )
      )}
    </section>
  );
}

/* --------------------- 7. Results Audit Agent ------------------------ */

function ResultsAuditAgent() {
  const toneCls: Record<string, string> = {
    ok: "text-brand-green",
    warn: "text-amber-600",
    alert: "text-destructive",
  };
  return (
    <section id="audit">
      <SectionHeading
        index={7}
        icon={FileBarChart2}
        title="Results Audit Agent"
        subtitle="Post-exam reconciliation of scanned scripts, anonymized candidates, and flagged anomalies."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RESULTS_AUDIT.map((m) => (
          <div key={m.label} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="text-sm text-muted-foreground">{m.label}</div>
            <div className={`mt-1 text-2xl font-bold tracking-tight ${toneCls[m.tone]}`}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted p-5">
        <FileBarChart2 className="h-5 w-5 text-brand-blue" />
        <span className="text-sm text-foreground">
          Audit report generated — exportable for examination-body review and pilot tracking (simulated).
        </span>
      </div>
    </section>
  );
}
