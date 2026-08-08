import Link from "next/link";
import { HelpCircle } from "lucide-react";

export function SupportLink() {
  return (
    <div className="flex items-center text-xs text-[#73736E]">
      <Link
        href="/contact"
        className="inline-flex items-center gap-1.5 font-medium text-black transition-colors hover:text-neutral-700 hover:underline"
      >
        <HelpCircle className="h-4 w-4 text-[#73736E]" />
        <span>Contact Support</span>
      </Link>
    </div>
  );
}
