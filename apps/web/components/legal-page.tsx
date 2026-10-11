import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export interface LegalSection {
  title: string;
  /** Plain text is wrapped in a paragraph; pass JSX for lists and links. */
  body: ReactNode;
}

interface LegalPageProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  sections: LegalSection[];
  cta?: { text: string; linkLabel: string; href: string };
}

/** Shared presentational shell for the storefront's legal & policy pages. */
export function LegalPage({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  sections,
  cta,
}: LegalPageProps) {
  return (
    <main className="bg-cream-paper text-ink-black min-h-screen flex-1 font-sans antialiased">
      {/* Hero Section (CREAM BG) */}
      <section className="border-ash border-b bg-[#FAF7F0] px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-4xl text-left">
          <div className="tag border-ash mb-4 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 shadow-xs">
            <Icon className="text-brand-yellow-dark h-3.5 w-3.5" />
            <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
              {eyebrow}
            </span>
          </div>
          <h1 className="font-nantes text-ink-black mb-4 text-4xl leading-[1.08] font-normal tracking-tight sm:text-6xl">
            {title}
          </h1>
          <p className="font-graphik text-smoke text-sm">{subtitle}</p>
        </div>
      </section>

      {/* Content Section (WHITE BG) */}
      <section className="border-ash border-b bg-white px-6 py-12 sm:px-12 sm:py-20">
        <div className="border-ash mx-auto flex max-w-4xl flex-col gap-10 rounded-2xl border bg-[#FAF7F0] p-8 shadow-xs sm:p-12">
          {sections.map((s) => (
            <div
              key={s.title}
              className="border-ash/60 border-b pb-8 last:border-b-0 last:pb-0"
            >
              <h2 className="font-nantes text-ink-black mb-3 text-xl font-normal tracking-tight sm:text-2xl">
                {s.title}
              </h2>
              <div className="font-graphik text-smoke space-y-3 text-sm leading-relaxed sm:text-base [&_a]:font-semibold [&_a]:text-black [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5">
                {typeof s.body === "string" ? <p>{s.body}</p> : s.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {cta && (
        <section className="bg-[#FAF7F0] px-6 py-16 sm:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-graphik text-smoke text-sm">
              {cta.text}{" "}
              <Link
                href={cta.href}
                className="decoration-brand-yellow-dark hover:text-brand-yellow-dark font-semibold text-black underline underline-offset-4"
              >
                {cta.linkLabel}
              </Link>
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
