import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState, type ReactNode, type RefObject } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AGENT_MAPPINGS,
  SAMPLE_EVIDENCE_PACKAGE,
  formatGeneratedDate,
  validateEduboxEvidenceJson,
  validateEduboxEvidencePackage,
  type SanitizedEvidencePackage,
  type ValidationResult,
  type AgentMapping,
} from "@/lib/eduboxEvidence";
import {
  REPORT_MODES,
  buildEvidenceAgentReportText,
  downloadEvidenceAgentReportTxt,
  generateEvidenceReport,
  type EvidenceAgentReport,
  type ReportMode,
} from "@/lib/evidenceReport";
import {
  RECOMMENDATION_MODES,
  buildLessonCraftRecommendationsText,
  downloadLessonCraftRecommendationsTxt,
  generateLessonCraftRecommendations,
  type LessonCraftRecommendations,
  type RecommendationMode,
} from "@/lib/lessonCraftRecommendations";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardCopy,
  Download,
  FileJson,
  FileText,
  Loader2,
  Shield,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/edubox-evidence")({
  head: () => ({
    meta: [
      { title: "EduBox Evidence Receiver — EduBox Agent Studio" },
      {
        name: "description",
        content:
          "Validate and preview EduBox agent evidence packages safely — setup-state receiver for EmpowerEd Nexus Agents.",
      },
    ],
  }),
  component: EduboxEvidencePage,
});

function EduboxEvidencePage() {
  const [rawJson, setRawJson] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [reportMode, setReportMode] = useState<ReportMode>("school");
  const [lessonCraftMode, setLessonCraftMode] = useState<RecommendationMode>("teacher_support");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleValidate = useCallback(() => {
    setValidating(true);
    try {
      const next = validateEduboxEvidenceJson(rawJson);
      setResult(next);
      if (next.ok) {
        toast.success("Evidence package validated.");
        if (next.warnings.length) toast.warning(next.warnings[0]);
      } else {
        toast.error(next.errors[0] ?? "Validation failed.");
      }
    } finally {
      setValidating(false);
    }
  }, [rawJson]);

  const handleLoadSample = useCallback(() => {
    setRawJson(JSON.stringify(SAMPLE_EVIDENCE_PACKAGE, null, 2));
    const next = validateEduboxEvidencePackage(SAMPLE_EVIDENCE_PACKAGE);
    setResult(next);
    toast.success("Sample package loaded.");
  }, []);

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      toast.error("Only .json files are accepted.");
      return;
    }
    if (file.size > 512 * 1024) {
      toast.error("File exceeds 512 KB limit.");
      return;
    }
    try {
      const text = await file.text();
      setRawJson(text);
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error("Could not read file.");
    }
  }, []);

  const pkg = result?.ok ? result.package : null;
  const report = pkg ? generateEvidenceReport(pkg, reportMode) : null;
  const lessonCraft = pkg ? generateLessonCraftRecommendations(pkg, lessonCraftMode) : null;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-5 pt-12 pb-24">
        <Hero />
        <PrivacyNotice />

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <InputPanel
            rawJson={rawJson}
            onChange={setRawJson}
            onValidate={handleValidate}
            onLoadSample={handleLoadSample}
            validating={validating}
            fileRef={fileRef}
            onFile={handleFile}
          />
          <ValidationSummary result={result} />
        </div>

        {pkg && (
          <>
            <PackageSummary pkg={pkg} />
            <PackageDetailPreview pkg={pkg} />
            {report && (
              <EvidenceAgentReportPreview
                report={report}
                mode={reportMode}
                onModeChange={setReportMode}
              />
            )}
            {lessonCraft && (
              <LessonCraftRecommendationsPreview
                recommendations={lessonCraft}
                mode={lessonCraftMode}
                onModeChange={setLessonCraftMode}
              />
            )}
            <AgentMappingSection actions={pkg.recommended_agent_actions} />
            {report && (
              <ExportPanel report={report} generatedAt={pkg.generated_at} />
            )}
            {lessonCraft && (
              <LessonCraftExportPanel recommendations={lessonCraft} generatedAt={pkg.generated_at} />
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}

function Hero() {
  return (
    <div className="max-w-3xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
        <FileJson className="h-3.5 w-3.5 text-brand-blue" /> Phase A1–A3 — Evidence & LessonCraft
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
        EduBox Evidence Package Receiver
      </h1>
      <p className="mt-3 text-muted-foreground">
        Paste or upload an evidence package exported from EduBox{" "}
        <span className="font-mono text-xs">/agent-bridge/evidence-package.json</span>. Packages are
        validated locally in your browser — nothing is sent to AI providers or stored on a server.
      </p>
    </div>
  );
}

function PrivacyNotice() {
  return (
    <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-400/10 p-4 text-sm text-amber-900 dark:text-amber-100">
      <div className="flex items-start gap-2">
        <Shield className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <span className="font-semibold">Privacy and safety:</span> Treat all packages as untrusted
          input. Forbidden fields (passwords, emails, tokens, secrets, raw media, private learner
          records) are stripped before preview. This MVP does not persist packages, call AI, or
          expose API keys. Admin-approved live ingestion is a future phase.
        </div>
      </div>
    </div>
  );
}

function InputPanel({
  rawJson,
  onChange,
  onValidate,
  onLoadSample,
  validating,
  fileRef,
  onFile,
}: {
  rawJson: string;
  onChange: (v: string) => void;
  onValidate: () => void;
  onLoadSample: () => void;
  validating: boolean;
  fileRef: RefObject<HTMLInputElement | null>;
  onFile: (file: File | undefined) => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Import package</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Paste JSON or upload a .json file (max 512 KB).
      </p>

      <Textarea
        className="mt-4 min-h-[220px] font-mono text-xs"
        placeholder='{"package_type":"edubox_agent_evidence_package", ...}'
        value={rawJson}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onValidate} disabled={validating || !rawJson.trim()}>
          {validating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          Validate package
        </Button>
        <Button variant="outline" onClick={onLoadSample}>
          Load sample package
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" /> Upload JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function ValidationSummary({ result }: { result: ValidationResult | null }) {
  if (!result) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-6">
        <h2 className="text-lg font-semibold">Validation status</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Validate a package to see summary, evidence report preview, and agent recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Validation status</h2>
      {result.ok ? (
        <div className="mt-3 flex items-start gap-2 text-sm text-brand-green">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Package accepted — safe preview ready.</span>
        </div>
      ) : (
        <div className="mt-3 space-y-1">
          {result.errors.map((err) => (
            <div key={err} className="flex items-start gap-2 text-sm text-destructive">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}
      {result.warnings.length > 0 && (
        <div className="mt-4 space-y-1">
          {result.warnings.map((w) => (
            <div
              key={w}
              className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
      {result.forbiddenKeysFound.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Forbidden keys excluded from preview: {result.forbiddenKeysFound.join(", ")}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function PackageSummary({ pkg }: { pkg: SanitizedEvidencePackage }) {
  return (
    <section className="mt-10">
      <SectionHead title="Package summary" sub="Sanitized counts from validated package." />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Device" value={pkg.device_label} />
        <Stat label="Generated" value={formatGeneratedDate(pkg.generated_at)} />
        <Stat label="Courses" value={pkg.course_count} />
        <Stat label="Lessons" value={pkg.lesson_count} />
        <Stat label="Resources" value={pkg.resource_count} />
        <Stat label="Offline resources" value={pkg.offline_allowed_resource_count} />
        <Stat label="Online-only resources" value={pkg.online_only_resource_count} />
        <Stat label="Quiz attempts" value={pkg.quiz_attempt_count} />
        <Stat
          label="Average score"
          value={pkg.average_score_percent != null ? `${pkg.average_score_percent}%` : "n/a"}
        />
        <Stat label="Sync logs" value={pkg.sync_log_count} />
      </div>
    </section>
  );
}

function PackageDetailPreview({ pkg }: { pkg: SanitizedEvidencePackage }) {
  const cs = pkg.content_summary;
  const qs = pkg.quiz_summary;
  const rs = pkg.resource_rights_summary;
  const dh = pkg.device_health_summary;

  return (
    <section className="mt-10">
      <SectionHead
        title="Package detail preview"
        sub="Raw validated sections from the EduBox evidence package."
      />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ReportCard title="Readiness flags">
          <ul className="space-y-1 text-sm">
            {Object.entries(pkg.readiness_flags).map(([k, v]) => (
              <li key={k}>
                <span className="font-medium">{k}:</span> {String(v)}
              </li>
            ))}
            {Object.keys(pkg.readiness_flags).length === 0 && (
              <li className="text-muted-foreground">No readiness flags provided.</li>
            )}
          </ul>
        </ReportCard>

        <ReportCard title="Content summary">
          <p className="text-sm">
            {cs.published_course_count ?? pkg.course_count} published courses, {pkg.lesson_count}{" "}
            lessons
          </p>
          {cs.sample_course_titles && cs.sample_course_titles.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Courses: {cs.sample_course_titles.join(", ")}
            </p>
          )}
          {cs.sample_lesson_titles && cs.sample_lesson_titles.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Lessons: {cs.sample_lesson_titles.join(", ")}
            </p>
          )}
        </ReportCard>

        <ReportCard title="Quiz summary">
          <p className="text-sm">{pkg.quiz_attempt_count} quiz attempts recorded locally</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Average score: {qs.average_score_percent ?? pkg.average_score_percent ?? "n/a"}%
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lesson progress: {qs.lesson_progress_completed ?? 0} / {qs.lesson_progress_total ?? 0}{" "}
            completed
          </p>
        </ReportCard>

        <ReportCard title="Resource rights">
          <p className="text-sm">{rs.resource_count ?? pkg.resource_count} tracked resources</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Offline allowed: {rs.offline_allowed_count ?? pkg.offline_allowed_resource_count} ·
            Online only: {rs.online_only_count ?? pkg.online_only_resource_count}
          </p>
          {(rs.pending_rights_review_count ?? 0) > 0 && (
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              Pending rights review: {rs.pending_rights_review_count}
            </p>
          )}
        </ReportCard>

        <ReportCard title="Device health">
          <p className="text-sm">{dh.device_label ?? pkg.device_label}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Initialized: {dh.device_initialized ? "Yes" : "No"} · Sync configured:{" "}
            {dh.sync_endpoint_configured ? "Yes" : "No"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent sync failures: {dh.recent_sync_failures ?? 0}
          </p>
        </ReportCard>

        <ReportCard title="Recommended agent actions">
          <ul className="list-inside list-disc space-y-1 text-sm">
            {pkg.recommended_agent_actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
            {pkg.recommended_agent_actions.length === 0 && (
              <li className="list-none text-muted-foreground">No actions provided.</li>
            )}
          </ul>
        </ReportCard>
      </div>
    </section>
  );
}

function EvidenceAgentReportPreview({
  report,
  mode,
  onModeChange,
}: {
  report: EvidenceAgentReport;
  mode: ReportMode;
  onModeChange: (mode: ReportMode) => void;
}) {
  return (
    <section className="mt-10">
      <SectionHead
        title="Evidence Agent Report Preview"
        sub="Deterministic impact report — Evidence Agent MVP (no live AI)."
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {REPORT_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onModeChange(m.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              mode === m.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title={m.description}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {REPORT_MODES.find((m) => m.id === mode)?.description}
      </p>

      <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-semibold">{report.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.deviceLabel} · Evidence generated {report.generatedDate}
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <AgentReportSection section={report.executiveSummary} />
          <AgentReportSection section={report.learningActivity} />
          <AgentReportSection section={report.contentCoverage} />
          <AgentReportSection section={report.quizProgress} />
          <AgentReportSection section={report.resourceRights} />
          <AgentReportSection section={report.deviceReadiness} />

          <div>
            <h4 className="text-sm font-semibold">Recommended Next Actions</h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {report.recommendedNextActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-4">
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Safety Notes</h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-900/90 dark:text-amber-100/90">
              {report.safetyNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">{report.footer}</p>
      </div>
    </section>
  );
}

function AgentReportSection({
  section,
}: {
  section: { heading: string; paragraphs?: string[]; bullets?: string[]; items?: string[] };
}) {
  const bullets = section.bullets ?? section.items ?? [];
  return (
    <div>
      <h4 className="text-sm font-semibold">{section.heading}</h4>
      {section.paragraphs?.map((p) => (
        <p key={p} className="mt-2 text-sm text-muted-foreground">
          {p}
        </p>
      ))}
      {bullets.length > 0 && (
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LessonCraftRecommendationsPreview({
  recommendations,
  mode,
  onModeChange,
}: {
  recommendations: LessonCraftRecommendations;
  mode: RecommendationMode;
  onModeChange: (mode: RecommendationMode) => void;
}) {
  return (
    <section className="mt-10">
      <SectionHead
        title="LessonCraft Recommendations"
        sub="Deterministic teaching and content suggestions — LessonCraft Agent MVP (no live AI)."
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {RECOMMENDATION_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onModeChange(m.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              mode === m.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title={m.description}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {RECOMMENDATION_MODES.find((m) => m.id === mode)?.description}
      </p>

      <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-start gap-3 border-b border-border pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="h-5 w-5 text-brand-green" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{recommendations.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {recommendations.deviceLabel} · Evidence {recommendations.generatedDate}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{recommendations.intro}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <AgentReportSection section={recommendations.followUpLessons} />
          <AgentReportSection section={recommendations.teacherActions} />
          <AgentReportSection section={recommendations.contentPackageImprovements} />
          <AgentReportSection section={recommendations.quizImprovementIdeas} />
          <AgentReportSection section={recommendations.resourceRightsActions} />
          <AgentReportSection section={recommendations.offlinePackageSuggestions} />
        </div>

        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-400/10 p-4">
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Safety Notes</h4>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-900/90 dark:text-amber-100/90">
            {recommendations.safetyNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">{recommendations.footer}</p>
      </div>
    </section>
  );
}

function AgentMappingSection({ actions }: { actions: string[] }) {
  return (
    <section className="mt-10">
      <SectionHead
        title="Agent mapping"
        sub="How validated evidence feeds each EmpowerEd Nexus Agent after report generation."
      />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {AGENT_MAPPINGS.map((agent) => (
          <div key={agent.agent} className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">{agent.agent}</h3>
              <StatusBadge status={agent.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{agent.role}</p>
            <p className="mt-2 text-sm">{agent.detail}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Uses: {agent.usesFromPackage.join(", ")}
            </p>
          </div>
        ))}
      </div>
      {actions.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          EduBox suggested {actions.length} action(s) in this package — mapped to agents above by
          prefix.
        </p>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: AgentMapping["status"] }) {
  const cls =
    status === "Foundation ready"
      ? "bg-[color-mix(in_oklab,var(--color-brand-blue)_18%,transparent)] text-[color:var(--color-brand-blue)]"
      : status === "Setup-state"
        ? "bg-[color-mix(in_oklab,var(--color-brand-green)_18%,transparent)] text-[color:var(--color-brand-green)]"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>{status}</span>
  );
}

function LessonCraftExportPanel({
  recommendations,
  generatedAt,
}: {
  recommendations: LessonCraftRecommendations;
  generatedAt: string;
}) {
  const copyRecommendations = async () => {
    try {
      await navigator.clipboard.writeText(buildLessonCraftRecommendationsText(recommendations));
      toast.success("LessonCraft recommendations copied.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <section className="mt-10 rounded-3xl border border-border bg-card p-6">
      <SectionHead
        title="LessonCraft export"
        sub="Copy or download recommendations. Live LessonCraft and AI generation remain setup-state."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={copyRecommendations}>
          <ClipboardCopy className="mr-2 h-4 w-4" /> Copy recommendations
        </Button>
        <Button
          variant="outline"
          onClick={() => downloadLessonCraftRecommendationsTxt(recommendations, generatedAt)}
        >
          <Download className="mr-2 h-4 w-4" /> Download recommendations .txt
        </Button>
        <Button variant="outline" disabled title="Requires admin-approved LessonCraft agent ingestion">
          Send to LessonCraft Agent — setup-state
        </Button>
        <Button variant="outline" disabled title="Requires admin-approved server-side AI integration">
          <Sparkles className="mr-2 h-4 w-4" /> Generate with AI Agent — setup-state
        </Button>
      </div>
    </section>
  );
}

function ExportPanel({ report, generatedAt }: { report: EvidenceAgentReport; generatedAt: string }) {
  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildEvidenceAgentReportText(report));
      toast.success("Evidence Agent report copied.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <section className="mt-10 rounded-3xl border border-border bg-card p-6">
      <SectionHead
        title="Evidence Agent export"
        sub="Copy or download the impact report. Live send and AI generation remain setup-state."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={copyReport}>
          <ClipboardCopy className="mr-2 h-4 w-4" /> Copy report
        </Button>
        <Button variant="outline" onClick={() => downloadEvidenceAgentReportTxt(report, generatedAt)}>
          <Download className="mr-2 h-4 w-4" /> Download .txt report
        </Button>
        <Button variant="outline" disabled title="PDF export planned for a future phase">
          <FileText className="mr-2 h-4 w-4" /> PDF — coming later
        </Button>
        <Button variant="outline" disabled title="Requires secure backend handoff">
          Send to Nexus Learn OS — setup-state
        </Button>
        <Button variant="outline" disabled title="Requires admin-approved server-side AI integration">
          <Sparkles className="mr-2 h-4 w-4" /> Generate with AI Agent — setup-state
        </Button>
      </div>
    </section>
  );
}

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ReportCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}
