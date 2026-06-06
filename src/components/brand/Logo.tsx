import mainLogo from "@/assets/brand/empowered-nexus-logo-main.png.asset.json";
import darkLogo from "@/assets/brand/empowered-nexus-logo-dark.png.asset.json";
import mark from "@/assets/brand/empowered-nexus-mark.png.asset.json";

export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return <img src={mark.url} alt="EmpowerEd Nexus" className={className} />;
}

export function BrandLockup({ variant = "dark", className = "h-10" }: { variant?: "dark" | "light"; className?: string }) {
  const src = variant === "light" ? mainLogo.url : darkLogo.url;
  return <img src={src} alt="EmpowerEd Nexus" className={className} />;
}