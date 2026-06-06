import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BrandMark } from "@/components/brand/Logo";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture — EduBox Agent Studio" },
      { name: "description", content: "How EduBox Agent Studio is structured." },
    ],
  }),
  component: ArchitecturePage,
});

const NODES = [
  { title: "Teacher Input", sub: "Topic, subject, grade, language, objective" },
  { title: "EduBox Agent Studio (Frontend)", sub: "React + TanStack Start" },
  { title: "Gemini Agent Workflow", sub: "6 cooperating agents" },
  { title: "Lesson Pack Generator", sub: "Structured JSON pack" },
  { title: "Saved Lesson Pack Database", sub: "Local + future cloud sync" },
  { title: "PDF / Markdown / JSON Export", sub: "Portable artefacts" },
  { title: "EduBox Offline Deployment", sub: "Micro-cloud at school" },
  { title: "Teacher Dashboard & Learning Evidence", sub: "Reports and pilot tracking" },
];

function ArchitecturePage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Architecture</h1>
          <p className="mt-3 text-muted-foreground">A simple, end-to-end view from teacher input to classroom deployment and evidence reporting.</p>
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-card p-6 md:p-10">
          <div className="grid gap-4 md:grid-cols-2">
            {NODES.map((n, i) => (
              <div key={n.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-sm font-bold text-primary-foreground">{i + 1}</div>
                <div className="flex-1 rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-start gap-3">
                    <BrandMark className="h-6 w-6" />
                    <div>
                      <div className="font-semibold text-foreground">{n.title}</div>
                      <div className="text-sm text-muted-foreground">{n.sub}</div>
                    </div>
                  </div>
                  {i < NODES.length - 1 && (
                    <div className="mt-3 flex items-center text-xs font-medium text-brand-blue">
                      <ChevronRight className="h-4 w-4" /> flows to <span className="ml-1 font-semibold">{NODES[i + 1].title}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Tech title="Frontend" body="React 19, TanStack Start, Tailwind v4 with EmpowerEd Nexus brand tokens." />
          <Tech title="Agent layer" body="Mock generator today; structured to swap in Gemini API (Curriculum, Lesson, Quiz, Support, Packaging, Evidence)." />
          <Tech title="Delivery" body="Markdown/JSON/PDF artefacts deployed to EduBox micro-cloud for offline classrooms." />
        </div>
      </section>
    </SiteLayout>
  );
}

function Tech({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <p className="mt-2 text-sm text-foreground">{body}</p>
    </div>
  );
}