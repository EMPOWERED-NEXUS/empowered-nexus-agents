import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BookOpen, ClipboardList, GraduationCap, Layers, Package, WifiOff, ArrowRight, CheckCircle2, FileText, ShieldCheck, Accessibility } from "lucide-react";

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
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-14 pb-16 md:pt-20 md:pb-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green" /> Prototype · EmpowerEd Nexus
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Offline-ready AI lesson packs for low-connectivity schools.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              EduBox Agent Studio helps teachers generate structured lesson packs, quizzes,
              activities, evidence reports, and offline EduBox-ready materials from simple
              classroom input.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/create" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                Create a Lesson Pack <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/testing" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
                View Testing Access
              </Link>
              <Link to="/examshield" className="inline-flex items-center gap-1.5 px-1 py-2 text-sm font-medium text-brand-blue hover:underline">
                Explore ExamShield <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><WifiOff className="h-3.5 w-3.5" /> Works offline</span>
              <span className="inline-flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> EduBox-ready</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Exam integrity workflows</span>
            </div>
          </div>
          <div className="lg:col-span-5">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* What it does */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <SectionHead eyebrow="What it does" title="Two focused workflows." />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <ModeCard
            to="/create"
            icon={BookOpen}
            tag="LessonCraft"
            title="Generate offline lesson packs"
            desc="Turn a topic into a complete, EduBox-ready lesson pack — objectives, teacher explanation, student notes, quiz, flashcards, revision summary and evidence report."
            cta="Open LessonCraft"
          />
          <ModeCard
            to="/examshield"
            icon={ShieldCheck}
            tag="ExamShield"
            title="Simulate secure exam delivery"
            desc="Demonstrate centre printing, traceability, and results audit for paper-based exams with encrypted packages, time-locks, QR/watermark tracing and audit evidence."
            cta="Open ExamShield"
          />
        </div>
      </section>

      {/* Agent workflow */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <SectionHead eyebrow="Agent workflow" title="Six agents, one structured pack." sub="Each agent contributes to a complete, offline-ready lesson pack." />
          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((a, i) => (
              <div key={a.name} className="bg-card p-5">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="tabular-nums">0{i + 1}</span>
                  <a.icon className="h-3.5 w-3.5" />
                </div>
                <div className="mt-3 text-sm font-semibold text-foreground">{a.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why offline-first */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <SectionHead eyebrow="Why offline-first matters" title="Built for African classrooms with limited connectivity." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: WifiOff, t: "Works without internet", d: "Every pack is bundled into a self-contained EduBox file delivered on the school's local network." },
            { icon: Package, t: "Light on devices", d: "Packs use Markdown, PDF and JSON — fast to open on basic tablets, shared laptops, and feature-class hardware." },
            { icon: CheckCircle2, t: "Evidence-ready", d: "Quiz outcomes and participation are bundled into reports for school leaders, NGOs and pilot tracking." },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-border bg-card p-5">
              <c.icon className="h-4 w-4 text-brand-blue" />
              <div className="mt-3 text-sm font-semibold text-foreground">{c.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ExamShield proof of concept */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <div className="grid items-center gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ExamShield · Proof of concept</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Secure exam workflows for paper-based schools.</h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                Simulated encrypted exam packages, centre readiness checks, controlled printing, QR
                and watermark tracing, and audit evidence. Mock exam data only — no real candidate
                data, papers or credentials.
              </p>
              <Link to="/examshield" className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">
                Open ExamShield <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="md:col-span-5">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between border-b border-border pb-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">CMR-YDE-001 · Biology</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">Locked</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-border p-3"><div className="text-muted-foreground">Package</div><div className="mt-1 font-mono text-[11px] text-foreground">EXM-7F2A</div></div>
                  <div className="rounded-lg border border-border p-3"><div className="text-muted-foreground">Encryption</div><div className="mt-1 font-medium text-foreground">AES-256</div></div>
                  <div className="rounded-lg border border-border p-3"><div className="text-muted-foreground">Centre lock</div><div className="mt-1 font-medium text-brand-green">Active</div></div>
                  <div className="rounded-lg border border-border p-3"><div className="text-muted-foreground">Time lock</div><div className="mt-1 font-medium text-brand-green">Active</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <SectionHead eyebrow="EmpowerEd Nexus ecosystem" title="One agent platform across the school." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <EcosystemCard icon={BookOpen} title="EduBox Agent Studio" desc="Creates offline-ready lesson packs for teachers." to="/create" />
          <EcosystemCard icon={ShieldCheck} title="ExamShield" desc="Simulates secure exam package delivery, controlled printing, traceability and audit evidence." to="/examshield" />
          <EcosystemCard icon={Accessibility} title="NexusAccess AI" desc="Inclusive access layer for SMS, USSD, voice scripts, captions and EduBox package preparation." href="https://nexusaccess.empowerednexus.com" badge="Roadmap" />
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h2>
      {sub && <p className="mt-2 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

function EcosystemCard({
  icon: Icon,
  title,
  desc,
  to,
  href,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  to?: string;
  href?: string;
  badge?: string;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        {badge && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4 text-base font-semibold text-foreground">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </>
  );

  const cls =
    "rounded-xl border border-border bg-card p-5 transition hover:border-foreground/20";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  }

  return (
    <Link to={to!} className={cls}>
      {inner}
    </Link>
  );
}

function ModeCard({
  to,
  icon: Icon,
  tag,
  title,
  desc,
  cta,
}: {
  to: string;
  icon: React.ElementType;
  tag: string;
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-xl border border-border bg-card p-6 transition hover:border-foreground/20"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-brand-blue">{tag}</div>
      <div className="mt-1 text-lg font-semibold tracking-tight text-foreground">{title}</div>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
        {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function HeroPreview() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between border-b border-border pb-3 text-xs">
          <span className="font-mono text-muted-foreground">edubox/photosynthesis.pack</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--color-brand-green)_14%,transparent)] px-2 py-0.5 font-medium text-[color:var(--color-brand-green)]">Ready</span>
        </div>
        <div className="space-y-3 pt-4">
          <div className="rounded-lg bg-muted px-3 py-2.5 text-sm">
            <span className="font-semibold text-foreground">Topic:</span> Photosynthesis · Biology · Form 2
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border p-3"><div className="font-semibold text-foreground">Objectives</div><div className="text-muted-foreground">4 generated</div></div>
            <div className="rounded-lg border border-border p-3"><div className="font-semibold text-foreground">Quiz</div><div className="text-muted-foreground">5 questions</div></div>
            <div className="rounded-lg border border-border p-3"><div className="font-semibold text-foreground">Flashcards</div><div className="text-muted-foreground">5 cards</div></div>
            <div className="rounded-lg border border-border p-3"><div className="font-semibold text-foreground">Activity</div><div className="text-muted-foreground">20 min</div></div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2.5 text-xs font-medium text-foreground">
            <div className="flex items-center gap-2"><Package className="h-4 w-4" /> EduBox package · 4.2 MB</div>
            <div className="flex items-center gap-1 text-muted-foreground"><FileText className="h-3.5 w-3.5" /> 6 files</div>
          </div>
        </div>
    </div>
  );
}
