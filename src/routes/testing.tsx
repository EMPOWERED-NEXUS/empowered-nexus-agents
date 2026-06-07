import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BrandLockup } from "@/components/brand/Logo";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/testing")({
  head: () => ({
    meta: [
      { title: "Testing Access — EduBox Agent Studio" },
      { name: "description", content: "How to test the EduBox Agent Studio MVP." },
    ],
  }),
  component: TestingPage,
});

const ROW = "flex items-start gap-2 py-1 text-sm";

function TestingPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-5 pt-12 pb-16">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Testing Access</h1>
              <p className="mt-2 text-muted-foreground">Quick demo instructions for hackathon judges and pilot reviewers.</p>
            </div>
            <BrandLockup variant="dark" className="h-12" />
          </div>

          <div className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">LessonCraft scenario</div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <Info
              label="Demo link"
              value="https://edubox-lesson-craft.lovable.app/"
              href="https://edubox-lesson-craft.lovable.app/"
            />
            <Info label="Login" value="No login required" />
            <Info label="Suggested test topic" value="Photosynthesis" />
            <Info label="Subject" value="Biology" />
            <Info label="Grade" value="Form 2" />
            <Info label="Language" value="English" />
            <Info label="Difficulty" value="Beginner" />
          </div>

          <div className="mt-8 rounded-2xl bg-muted p-5">
            <div className="text-sm font-semibold text-foreground">Expected result</div>
            <p className="mt-1 text-sm text-muted-foreground">
              The app generates a complete EduBox-ready lesson pack containing:
            </p>
            <div className="mt-2">
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Learning objectives</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Teacher explanation</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Student notes</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Quiz</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Answer key</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Flashcards</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Revision summary</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> EduBox package summary</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Evidence report</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
            The Create Pack form supports African school systems with country, subject, class, and
            language dropdowns plus Other fields for local curriculum flexibility.
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/create" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Run the test now</Link>
            <Link to="/architecture" className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">View architecture</Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">ExamShield scenario</div>
              <h2 className="text-2xl font-bold tracking-tight">Mock secure exam test</h2>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Prototype workflow using mock exam data only — not production security.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Info label="Exam name" value="Mock National Biology Exam" />
            <Info label="Subject" value="Biology" />
            <Info label="Level" value="Form 5" />
            <Info label="Centre code" value="CMR-YDE-001" />
            <Info label="Rooms" value="3" />
            <Info label="Candidates" value="120" />
          </div>

          <div className="mt-8 rounded-2xl bg-muted p-5">
            <div className="text-sm font-semibold text-foreground">Expected output</div>
            <div className="mt-2">
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Encrypted package</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Readiness checklist</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Simulated print authorization</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> QR / watermark metadata</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Leak trace result</div>
              <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Audit summary</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/examshield" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Open ExamShield</Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <div className="font-semibold text-foreground">Related ecosystem platform</div>
          <p className="mt-2">
            <a
              href="https://nexusaccess.empowerednexus.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-green hover:underline"
            >
              NexusAccess AI
            </a>
            {" — "}
            <span className="text-foreground">https://nexusaccess.empowerednexus.com</span>
          </p>
          <p className="mt-2">
            This is not required to test the EduBox Agent Studio MVP. It is included to show the
            wider EmpowerEd Nexus roadmap for inclusive education access.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block truncate font-semibold text-brand-green hover:underline"
        >
          {value}
        </a>
      ) : (
        <div className="mt-1 truncate font-semibold text-foreground">{value}</div>
      )}
    </div>
  );
}