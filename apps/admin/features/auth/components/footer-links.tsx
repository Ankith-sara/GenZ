import { Shield } from "lucide-react";

export function FooterLinks() {
  return (
    <footer className="font-graphik flex flex-col gap-2 border-t border-[#E5E5E0]/70 pt-6 text-[11px] text-[#73736E] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Shield className="h-3.5 w-3.5 text-[#8C8C85]" />
        <span>Confidential & Proprietary · GenZ Platform Ops</span>
      </div>
      <span className="text-[#8C8C85]">
        Restricted to Authorized Personnel
      </span>
    </footer>
  );
}

