import { BrandMark } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-4">
        <div className="flex items-start gap-3 md:col-span-2">
          <BrandMark className="h-9 w-9" />
          <div>
            <div className="text-sm font-semibold text-foreground">EduBox Agent Studio</div>
            <div className="text-sm text-muted-foreground">by EmpowerEd Nexus</div>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Offline-first AI lesson packs for low-connectivity schools.
            </p>
          </div>
        </div>
        <div className="text-sm">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</div>
          <a href="/create" className="block py-1 text-foreground hover:text-brand-blue">EduBox Agent Studio</a>
          <a href="/testing" className="block py-1 text-foreground hover:text-brand-blue">Testing Access</a>
          <a href="https://nexusaccess.empowerednexus.com" target="_blank" rel="noreferrer" className="block py-1 text-foreground hover:text-brand-blue">NexusAccess AI</a>
        </div>
        <div className="text-sm">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</div>
          <a href="https://www.empowerednexus.com" target="_blank" rel="noreferrer" className="block py-1 text-foreground hover:text-brand-blue">EmpowerEd Nexus</a>
          <a href="mailto:info@empowerednexus.com" className="block py-1 text-foreground hover:text-brand-blue">Contact</a>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-5 py-5 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} EmpowerEd Nexus · Learn, Heal, Innovate &amp; Thrive.</div>
          <div>Prototype for the Google for Startups AI Agents Challenge.</div>
        </div>
      </div>
    </footer>
  );
}