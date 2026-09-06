import { HelpCircle } from "lucide-react";

export function SupportLink() {
  return (
    <div className="flex items-center text-xs text-[#73736E]">
      <a
        href="mailto:support@genz.in?subject=Admin%20Console%20Access%20Assistance"
        className="inline-flex items-center gap-1.5 font-medium text-[#52524E] transition-colors hover:text-black hover:underline"
      >
        <HelpCircle className="h-4 w-4 text-[#73736E]" />
        <span>Operations Helpdesk</span>
      </a>
    </div>
  );
}

