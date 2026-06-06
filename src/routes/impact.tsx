import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BookOpen, Cloud, Database, MonitorSmartphone, ShieldCheck, Timer, WifiOff } from "lucide-react";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "EduBox Impact — EmpowerEd Nexus" },
      { name: "description", content: "How EduBox Agent Studio supports low-connectivity schools." },
    ],
  }),
  component: ImpactPage,
});

const ITEMS = [
  { icon: Timer, title: "Reduces teacher prep time", desc: "Generate a full lesson pack in under a minute instead of hours of manual prep." },
  { icon: WifiOff, title: "Offline-ready content", desc: "Every pack is bundled into a self-contained EduBox file — no internet needed in class." },
  { icon: MonitorSmartphone, title: "Works on shared devices", desc: "Lightweight HTML, Markdown and JSON load fast on basic tablets and laptops." },
  { icon: Cloud, title: "EduBox micro-cloud", desc: "Deploy directly to the school's local EduBox server. Students access the pack on the LAN." },
  { icon: Database, title: "Learning evidence", desc: "Quiz outcomes and activity participation are bundled as an evidence report for school leaders and NGOs." },
  { icon: ShieldCheck, title: "Quizzes, dashboards & future sync", desc: "Designed to sync with Nexus dashboards when the school is back online." },
];

function ImpactPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-brand-green" /> EduBox Impact
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Built for low-connectivity classrooms.</h1>
          <p className="mt-3 text-muted-foreground">EduBox Agent Studio turns AI into something a teacher in a low-bandwidth school can actually use — by packaging everything for offline delivery and reporting.</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((i) => (
            <div key={i.title} className="rounded-3xl border border-border bg-card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                <i.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-base font-semibold">{i.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{i.desc}</p>
            </div>
          ))}
        </div>

        {/* Diagrammatic visual */}
        <div className="mt-12 rounded-3xl border border-border bg-card p-6 md:p-10">
          <h2 className="text-xl font-semibold">How a lesson pack reaches a student</h2>
          <div className="mt-6 grid items-center gap-4 text-center md:grid-cols-5">
            {[
              { label: "Teacher", sub: "Creates pack" },
              { label: "EduBox", sub: "Local micro-cloud" },
              { label: "Classroom LAN", sub: "Offline network" },
              { label: "Shared devices", sub: "Tablets / laptops" },
              { label: "Evidence", sub: "Synced when online" },
            ].map((n, i, arr) => (
              <div key={n.label} className="relative">
                <div className="rounded-2xl bg-brand-gradient p-[1px]">
                  <div className="rounded-2xl bg-card p-4">
                    <div className="font-semibold">{n.label}</div>
                    <div className="text-xs text-muted-foreground">{n.sub}</div>
                  </div>
                </div>
                {i < arr.length - 1 && <div className="absolute right-[-12px] top-1/2 hidden h-0.5 w-6 -translate-y-1/2 bg-border md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}