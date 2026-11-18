import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4D4CE] bg-[#FAF8F4]/50 px-6 py-12 text-center select-none ${className}`}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E5E5E0] bg-white text-[#52524E] shadow-2xs">
        {icon || <FolderOpen className="h-7 w-7 text-[#73736E]" />}
      </div>

      <h3 className="text-lg font-bold text-[#1A1A18]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#73736E] sm:text-sm">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="h-10 rounded-xl bg-black px-5 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800"
            >
              {primaryAction.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="h-10 rounded-xl border-[#E5E5E0] bg-white px-5 text-xs font-semibold text-black hover:bg-[#F5F5F3]"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
