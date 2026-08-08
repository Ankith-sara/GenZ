import React from "react";
import { clsx } from "clsx";

export type StatusVariant =
  | "active"
  | "offline"
  | "pending"
  | "rejected"
  | "processing"
  | "verified"
  | "published"
  | "draft";

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  label,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase();

  let styles = "bg-neutral-100 text-neutral-700 border-neutral-200";
  let dotStyle = "bg-neutral-400";
  let displayLabel = label || status;

  if (
    normalized === "active" ||
    normalized === "verified" ||
    normalized === "approved" ||
    normalized === "published"
  ) {
    styles = "bg-emerald-50 text-emerald-800 border-emerald-200/60";
    dotStyle = "bg-emerald-500";
    displayLabel =
      label ||
      (normalized === "verified"
        ? "Verified"
        : normalized === "approved"
          ? "Approved"
          : normalized === "published"
            ? "Published"
            : "Active");
  } else if (
    normalized === "pending" ||
    normalized === "under_review" ||
    normalized === "draft"
  ) {
    styles = "bg-amber-50 text-amber-800 border-amber-200/60";
    dotStyle = "bg-amber-500";
    displayLabel =
      label ||
      (normalized === "pending"
        ? "Pending"
        : normalized === "draft"
          ? "Draft"
          : "Under Review");
  } else if (
    normalized === "rejected" ||
    normalized === "cancelled" ||
    normalized === "failed"
  ) {
    styles = "bg-rose-50 text-rose-800 border-rose-200/60";
    dotStyle = "bg-rose-500";
    displayLabel = label || (normalized === "rejected" ? "Rejected" : "Failed");
  } else if (
    normalized === "processing" ||
    normalized === "in_progress" ||
    normalized === "reviewing"
  ) {
    styles = "bg-blue-50 text-blue-800 border-blue-200/60";
    dotStyle = "bg-blue-500";
    displayLabel = label || "Processing";
  } else if (normalized === "offline" || normalized === "archived") {
    styles = "bg-zinc-100 text-zinc-600 border-zinc-200";
    dotStyle = "bg-zinc-400";
    displayLabel = label || "Offline";
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide uppercase transition-colors select-none",
        styles,
        className
      )}
    >
      {showDot && (
        <span className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", dotStyle)} />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
