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
  | "draft"
  | "admin"
  | "seller"
  | "buyer"
  | "user"
  | "online";

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  className?: string;
  showDot?: boolean;
}

interface ColorScheme {
  bg: string;
  text: string;
  border: string;
  dot: string;
  defaultLabel: string;
}

const COLOR_MAP: Record<string, ColorScheme> = {
  admin: {
    bg: "#EEF2FF",
    text: "#4338CA",
    border: "#A5B4FC",
    dot: "#6366F1",
    defaultLabel: "Admin",
  },
  buyer: {
    bg: "#ECFDF5",
    text: "#047857",
    border: "#6EE7B7",
    dot: "#10B981",
    defaultLabel: "Buyer",
  },
  user: {
    bg: "#ECFDF5",
    text: "#047857",
    border: "#6EE7B7",
    dot: "#10B981",
    defaultLabel: "Buyer",
  },
  online: {
    bg: "#ECFDF5",
    text: "#047857",
    border: "#6EE7B7",
    dot: "#10B981",
    defaultLabel: "Online",
  },
  active: {
    bg: "#ECFDF5",
    text: "#047857",
    border: "#6EE7B7",
    dot: "#10B981",
    defaultLabel: "Active",
  },
  verified: {
    bg: "#ECFDF5",
    text: "#047857",
    border: "#6EE7B7",
    dot: "#10B981",
    defaultLabel: "Verified",
  },
  approved: {
    bg: "#ECFDF5",
    text: "#047857",
    border: "#6EE7B7",
    dot: "#10B981",
    defaultLabel: "Approved",
  },
  published: {
    bg: "#ECFDF5",
    text: "#047857",
    border: "#6EE7B7",
    dot: "#10B981",
    defaultLabel: "Published",
  },
  seller: {
    bg: "#FFFBEB",
    text: "#B45309",
    border: "#FCD34D",
    dot: "#F59E0B",
    defaultLabel: "Seller",
  },
  pending: {
    bg: "#FFFBEB",
    text: "#B45309",
    border: "#FCD34D",
    dot: "#F59E0B",
    defaultLabel: "Pending",
  },
  draft: {
    bg: "#FFFBEB",
    text: "#B45309",
    border: "#FCD34D",
    dot: "#F59E0B",
    defaultLabel: "Draft",
  },
  under_review: {
    bg: "#FFFBEB",
    text: "#B45309",
    border: "#FCD34D",
    dot: "#F59E0B",
    defaultLabel: "Under Review",
  },
  offline: {
    bg: "#FEF2F2",
    text: "#B91C1C",
    border: "#FCA5A5",
    dot: "#EF4444",
    defaultLabel: "Offline",
  },
  rejected: {
    bg: "#FEF2F2",
    text: "#B91C1C",
    border: "#FCA5A5",
    dot: "#EF4444",
    defaultLabel: "Rejected",
  },
  cancelled: {
    bg: "#FEF2F2",
    text: "#B91C1C",
    border: "#FCA5A5",
    dot: "#EF4444",
    defaultLabel: "Cancelled",
  },
  failed: {
    bg: "#FEF2F2",
    text: "#B91C1C",
    border: "#FCA5A5",
    dot: "#EF4444",
    defaultLabel: "Failed",
  },
  processing: {
    bg: "#EFF6FF",
    text: "#1D4ED8",
    border: "#93C5FD",
    dot: "#3B82F6",
    defaultLabel: "Processing",
  },
};

const DEFAULT_SCHEME: ColorScheme = {
  bg: "#F5F5F5",
  text: "#525252",
  border: "#E5E5E5",
  dot: "#A3A3A3",
  defaultLabel: "Unknown",
};

export function StatusBadge({
  status,
  label,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase();
  const scheme = COLOR_MAP[normalized] || DEFAULT_SCHEME;
  const displayLabel = label || scheme.defaultLabel || status;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide uppercase transition-colors",
        className
      )}
      style={{
        backgroundColor: scheme.bg,
        color: scheme.text,
        borderColor: scheme.border,
      }}
    >
      {showDot && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: scheme.dot }}
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
