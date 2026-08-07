import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#E5E5E0] pb-5 select-none sm:flex-row sm:items-center">
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="font-graphik flex items-center gap-1.5 text-xs text-[#73736E]">
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-[#A3A39D]" />}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-black hover:underline"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-black">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="font-graphik text-2xl font-bold tracking-tight text-[#1A1A18] sm:text-3xl">
            {title}
          </h1>
          {badge}
        </div>

        {description && (
          <p className="font-graphik text-xs text-[#73736E] sm:text-sm">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
    </div>
  );
}
