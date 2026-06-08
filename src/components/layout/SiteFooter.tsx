import { BrandMark } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-3">
        <div className="flex items-start gap-3 md:col-span-1">
          <BrandMark className="h-8 w-8" />
          <div>
            <div className="text-sm font-semibold text-foreground">EduBox Agent Studio</div>
            <div className="text-sm text-muted-foreground">by EmpowerEd Nexus</div>
          </div>
        </div>
        <nav className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm md:col-span-2 md:grid-cols-3">
          <a href="/create" className="py-1 text-foreground hover:text-brand-blue">EduBox Agent Studio</a>
          <a href="https://nexusaccess.empowerednexus.com" target="_blank" rel="noreferrer" className="py-1 text-foreground hover:text-brand-blue">NexusAccess AI</a>
          <a href="https://github.com/empowerednexus" target="_blank" rel="noreferrer" className="py-1 text-foreground hover:text-brand-blue">GitHub</a>
          <a href="/testing" className="py-1 text-foreground hover:text-brand-blue">Testing Access</a>
          <a href="/architecture" className="py-1 text-foreground hover:text-brand-blue">Architecture</a>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl space-y-1 px-5 py-5 text-xs text-muted-foreground">
          <div>© 2026 EmpowerEd Nexus · Learn, Heal, Innovate &amp; Thrive.</div>
          <div className="max-w-3xl">EduBox Agent Studio supports offline-ready lesson creation, exam integrity workflows, and inclusive access across low-connectivity schools.</div>
        </div>
      </div>
    </footer>
  );
}