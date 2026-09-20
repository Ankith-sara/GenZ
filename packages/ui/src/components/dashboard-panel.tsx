import type { ReactNode } from "react";
import { cn } from "@genz/utils";

interface DashboardPanelProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DashboardPanel({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: DashboardPanelProps) {
  return (
    <section
      className={cn(
        "border-outline-variant/60 bg-surface-container-lowest rounded-2xl border shadow-elevation-1",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="border-outline-variant/50 flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-on-surface text-sm font-bold tracking-tight">{title}</h2>}
            {description && (
              <p className="text-on-surface-variant mt-0.5 text-[11px] leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  );
}
