import type { ReactNode } from "react";
import { cn } from "@genz/utils";

interface DashboardStatProps {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const toneClasses = {
  default: "bg-surface-container text-on-surface-variant",
  success: "bg-success-container text-on-success-container",
  warning: "bg-warning-container text-on-warning-container",
  danger: "bg-error-container text-on-error-container",
};

export function DashboardStat({
  label,
  value,
  detail,
  icon,
  tone = "default",
  className,
}: DashboardStatProps) {
  return (
    <div
      className={cn(
        "border-outline-variant/60 bg-surface-container-lowest min-w-0 rounded-2xl border p-4 shadow-elevation-1",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-on-surface-variant truncate text-[10px] font-bold tracking-[0.12em] uppercase">
            {label}
          </p>
          <p className="text-on-surface mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {detail && <p className="text-on-surface-variant mt-1 truncate text-[11px]">{detail}</p>}
        </div>
        {icon && (
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", toneClasses[tone])}>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
