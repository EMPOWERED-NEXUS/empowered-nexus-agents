import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { loadPacks, setCurrentPack, type LessonPack } from "@/lib/lesson";
import { ArrowRight, FileBox } from "lucide-react";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Lesson Packs — EduBox Agent Studio" },
      { name: "description", content: "All your saved EduBox lesson packs." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const [packs, setPacks] = useState<LessonPack[]>([]);
  useEffect(() => setPacks(loadPacks()), []);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-16">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Saved Lesson Packs</h1>
            <p className="mt-2 text-muted-foreground">All packs stored locally and ready for EduBox deployment.</p>
          </div>
          <Link to="/create" className="hidden rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:inline-flex">+ New Pack</Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="hidden grid-cols-12 gap-3 border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
            <div className="col-span-5">Lesson</div>
            <div className="col-span-2">Subject</div>
            <div className="col-span-2">Grade</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Open</div>
          </div>
          {packs.map((p) => (
            <Link
              key={p.id}
              to="/generated"
              onClick={() => setCurrentPack(p)}
              className="grid grid-cols-1 items-center gap-3 border-b border-border px-5 py-4 transition last:border-b-0 hover:bg-muted/50 md:grid-cols-12"
            >
              <div className="col-span-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground"><FileBox className="h-5 w-5" /></div>
                  <div>
                    <div className="font-semibold text-foreground">{p.input.topic}</div>
                    <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()} · {p.input.country}</div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">{p.input.subject}</div>
              <div className="col-span-2 text-sm text-muted-foreground">{p.input.grade}</div>
              <div className="col-span-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${p.status === "ready" ? "bg-[color-mix(in_oklab,var(--color-brand-green)_18%,transparent)] text-[color:var(--color-brand-green)]" : "bg-muted text-muted-foreground"}`}>
                  {p.status === "ready" ? "Ready" : "Draft"}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-end text-brand-blue"><ArrowRight className="h-4 w-4" /></div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}