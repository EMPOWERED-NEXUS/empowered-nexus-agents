import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BrandLockup } from "@/components/brand/Logo";
import { BookOpen, BrainCircuit, ClipboardList, GraduationCap, Layers, Package, Sparkles, WifiOff, ArrowRight, CheckCircle2, FileText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduBox Agent Studio — EmpowerEd Nexus" },
      { name: "description", content: "Offline-first AI lesson packs for low-connectivity schools." },
      { property: "og:title", content: "EduBox Agent Studio — EmpowerEd Nexus" },
      { property: "og:description", content: "Offline-first AI lesson packs for low-connectivity schools." },
    ],
  }),
  component: Index,
});

const AGENTS = [
  { icon: BookOpen, name: "Curriculum Agent", desc: "Understands subject, grade, topic and learner level." },
  { icon: Layers, name: "Lesson Builder Agent", desc: "Creates structured lessons, examples and notes." },
  { icon: ClipboardList, name: "Quiz Agent", desc: "Generates questions, answers and revision checks." },
  { icon: GraduationCap, name: "Teacher Support Agent", desc: "Suggests classroom activities and teaching tips." },
  { icon: Package, name: "EduBox Packaging Agent", desc: "Formats content for offline EduBox deployment." },
  { icon: CheckCircle2, name: "Evidence Agent", desc: "Summarizes outcomes for school reports & pilots." },
];

function Index() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-accent)_0%,_transparent_55%)]" />
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-brand-green" />
                AI agents for offline classrooms
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Offline-first <span className="text-brand-gradient">AI lesson packs</span> for low-connectivity schools.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                EduBox Agent Studio helps teachers generate complete, EduBox-ready lesson packs — explanations, quizzes, activities and evidence reports — in seconds.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/create" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">
                  Create a Lesson Pack <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">
                  Open Dashboard
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><WifiOff className="h-4 w-4 text-brand-blue" /> Works offline</div>
                <div className="flex items-center gap-2"><Package className="h-4 w-4 text-brand-green" /> EduBox-ready</div>
                <div className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-brand-blue" /> 6 AI agents</div>
              </div>
            </div>

            <HeroPreview />
          </div>

          <div className="mt-16 flex items-center justify-center">
            <BrandLockup variant="dark" className="h-14 opacity-90" />
          </div>
        </div>
      </section>

      {/* Agents */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">A workspace of six teaching agents</h2>
          <p className="mt-3 text-muted-foreground">Each agent contributes to a complete, structured, offline-ready lesson pack.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((a) => (
            <div key={a.name} className="group rounded-3xl border border-border bg-card p-6 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground">
                <a.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-base font-semibold text-foreground">{a.name}</div>
              <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact strip */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { stat: "10×", label: "Faster lesson prep for teachers" },
            { stat: "100%", label: "Offline-ready lesson packs" },
            { stat: "1 click", label: "From topic to EduBox deployment" },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl border border-border bg-card p-8 text-center">
              <div className="text-4xl font-bold tracking-tight text-brand-gradient">{s.stat}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground md:p-14">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-bold md:text-3xl">Ready to build your first EduBox lesson pack?</h3>
              <p className="mt-2 max-w-xl text-sm opacity-80">Enter a topic, pick a grade, and the agents handle the rest.</p>
            </div>
            <Link to="/create" className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-primary-foreground">
              Start generating <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function HeroPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-gradient opacity-20 blur-2xl" />
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <div className="ml-3 text-xs text-muted-foreground">edubox/photosynthesis.pack</div>
        </div>
        <div className="space-y-3 pt-4">
          <div className="rounded-xl bg-muted px-4 py-3 text-sm">
            <span className="font-semibold text-foreground">Topic:</span> Photosynthesis · Biology · Form 2
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-border bg-card p-3"><div className="font-semibold text-foreground">Objectives</div><div className="text-muted-foreground">4 generated</div></div>
            <div className="rounded-xl border border-border bg-card p-3"><div className="font-semibold text-foreground">Quiz</div><div className="text-muted-foreground">5 questions</div></div>
            <div className="rounded-xl border border-border bg-card p-3"><div className="font-semibold text-foreground">Flashcards</div><div className="text-muted-foreground">5 cards</div></div>
            <div className="rounded-xl border border-border bg-card p-3"><div className="font-semibold text-foreground">Activity</div><div className="text-muted-foreground">20 min</div></div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-brand-gradient px-4 py-3 text-xs font-medium text-primary-foreground">
            <div className="flex items-center gap-2"><Package className="h-4 w-4" /> EduBox package · 4.2 MB</div>
            <div className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> 6 files</div>
          </div>
        </div>
      </div>
    </div>
  );
}
