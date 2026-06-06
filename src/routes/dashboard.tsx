import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { loadPacks, setCurrentPack, type LessonPack } from "@/lib/lesson";
import { ArrowRight, BookOpen, FileBox, Layers, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EduBox Agent Studio" },
      { name: "description", content: "Overview of your EduBox lesson packs." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [packs, setPacks] = useState<LessonPack[]>([]);
  useEffect(() => setPacks(loadPacks()), []);

  const total = packs.length;
  const drafts = packs.filter((p) => p.status === "draft").length;
  const ready = packs.filter((p) => p.status === "ready").length;
  const subjects = new Set(packs.map((p) => p.input.subject)).size;

  const stats = [
    { label: "Total lesson packs", value: total, icon: Layers },
    { label: "Draft packs", value: drafts, icon: BookOpen },
    { label: "Ready for EduBox", value: ready, icon: FileBox },
    { label: "Subjects covered", value: subjects, icon: Sparkles },
  ];

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">EmpowerEd Nexus</div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Teacher Dashboard</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">A live view of your AI-generated, offline-ready lesson packs.</p>
          </div>
          <Link to="/create" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
            New Lesson Pack <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-bold tracking-tight">{s.value}</div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent lesson packs</h2>
          <Link to="/saved" className="text-sm font-medium text-brand-blue hover:underline">View all →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packs.slice(0, 6).map((p) => (
            <Link
              key={p.id}
              to="/generated"
              onClick={() => setCurrentPack(p)}
              className="group rounded-3xl border border-border bg-card p-5 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${p.status === "ready" ? "bg-[color-mix(in_oklab,var(--color-brand-green)_18%,transparent)] text-[color:var(--color-brand-green)]" : "bg-muted text-muted-foreground"}`}>
                  {p.status === "ready" ? "Ready for EduBox" : "Draft"}
                </span>
                <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="mt-3 line-clamp-2 text-base font-semibold text-foreground">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.input.subject} · {p.input.grade} · {p.input.language}</p>
              <div className="mt-4 flex items-center text-sm font-medium text-brand-blue">
                Open pack <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}