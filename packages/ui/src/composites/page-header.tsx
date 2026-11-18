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
    <div className="border-border mb-6 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="text-muted-foreground flex items-center gap-1.5 text-xs">
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <ChevronRight className="text-muted-foreground/60 h-3 w-3" />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors hover:underline"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {badge}
        </div>

        {description && (
          <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>
        )}
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
    </div>
  );
}
