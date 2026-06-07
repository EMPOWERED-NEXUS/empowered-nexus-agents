import { BrandMark } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-3">
        <div className="flex items-start gap-3">
          <BrandMark className="h-10 w-10" />
          <div>
            <div className="text-base font-semibold text-foreground">EduBox Agent Studio</div>
            <div className="text-sm text-muted-foreground">by EmpowerEd Nexus</div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Offline-first AI lesson packs for low-connectivity schools.
            </p>
          </div>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold text-foreground">Contact</div>
          <a href="mailto:info@empowerednexus.com" className="block text-muted-foreground hover:text-foreground">info@empowerednexus.com</a>
          <a href="https://www.empowerednexus.com" target="_blank" rel="noreferrer" className="block text-muted-foreground hover:text-foreground">www.empowerednexus.com</a>
          <div className="mb-2 mt-5 font-semibold text-foreground">Ecosystem</div>
          <a href="https://nexusaccess.empowerednexus.com" target="_blank" rel="noreferrer" className="block text-muted-foreground hover:text-foreground">NexusAccess AI</a>
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          © {new Date().getFullYear()} EmpowerEd Nexus.<br />
          Learn, Heal, Innovate &amp; Thrive.<br />
          <span className="mt-2 inline-block">
            Prototype built for the Google for Startups AI Agents Challenge.
          </span>
        </div>
      </div>
    </footer>
  );
}