import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BrandLockup } from "@/components/brand/Logo";
import { CheckCircle2 } from "lucide-react";

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

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Info label="Demo link" value={typeof window !== "undefined" ? window.location.origin : "—"} />
            <Info label="Suggested test topic" value="Photosynthesis" />
            <Info label="Subject" value="Biology" />
            <Info label="Grade" value="Form 2" />
            <Info label="Language" value="English" />
            <Info label="Difficulty" value="Beginner" />
          </div>

          <div className="mt-8 rounded-2xl bg-muted p-5">
            <div className="text-sm font-semibold text-foreground">Expected output</div>
            <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Full lesson pack with 4 objectives</div>
            <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> 5-question quiz with answer key</div>
            <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Flashcards and revision summary</div>
            <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> EduBox offline package summary (4.2 MB)</div>
            <div className={ROW}><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Evidence report summary</div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/create" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Run the test now</Link>
            <Link to="/architecture" className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">View architecture</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 truncate font-semibold text-foreground">{value}</div>
    </div>
  );
}