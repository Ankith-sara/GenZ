import type { ReactNode } from "react";
import { cn } from "@genz/utils";

interface DashboardPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: DashboardPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-outline-variant/50 pb-5 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-on-surface-variant mb-1.5 text-[10px] font-bold tracking-[0.16em] uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-on-surface text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="text-on-surface-variant mt-1 max-w-2xl text-xs leading-relaxed sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
