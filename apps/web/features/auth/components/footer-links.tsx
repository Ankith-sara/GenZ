import Link from "next/link";

export function FooterLinks() {
  return (
    <footer className="font-graphik flex items-center justify-between border-t border-[#E5E5E0]/60 pt-6 text-xs text-[#73736E]">
      <div className="flex items-center gap-4">
        <Link
          href="/terms"
          className="transition-colors hover:text-black hover:underline"
        >
          Terms
        </Link>
        <span className="text-[#D4D4CE]">•</span>
        <Link
          href="/privacy"
          className="transition-colors hover:text-black hover:underline"
        >
          Privacy
        </Link>
        <span className="text-[#D4D4CE]">•</span>
        <Link
          href="/faqs"
          className="transition-colors hover:text-black hover:underline"
        >
          Help
        </Link>
      </div>
    </footer>
  );
}
