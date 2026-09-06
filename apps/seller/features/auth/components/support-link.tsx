import { HelpCircle } from "lucide-react";

export function SupportLink() {
  return (
    <div className="flex items-center text-xs text-[#73736E]">
      <a
        href="mailto:sellers@genz.in?subject=Seller%20Desk%20Support%20Inquiry"
        className="inline-flex items-center gap-1.5 font-medium text-[#52524E] transition-colors hover:text-black hover:underline"
      >
        <HelpCircle className="h-4 w-4 text-[#73736E]" />
        <span>Seller Helpdesk</span>
      </a>
    </div>
  );
}

