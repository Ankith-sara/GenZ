"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl" | "2xl";
  size?: "md" | "lg" | "xl" | "2xl" | string;
}

export function SlideOverDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  children,
  footer,
  maxWidth = "xl",
  size,
}: SlideOverDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedWidth = (size as "md" | "lg" | "xl" | "2xl") || maxWidth || "xl";
  const widthClasses =
    {
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
    }[resolvedWidth] || "max-w-xl";
  const displaySubtitle = subtitle || description;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-[#1A1A18]/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${widthClasses} flex transform flex-col justify-between border-l border-[#E5E5E0] bg-white text-[#1A1A18] shadow-2xl transition-transform duration-200 ease-in-out`}
        >
          <div className="flex items-center justify-between border-b border-[#E5E5E0] bg-[#FAF8F4] px-6 py-4">
            <div>
              <h2 className="text-base font-bold tracking-tight text-[#1A1A18]">
                {title}
              </h2>
              {displaySubtitle && (
                <p className="mt-0.5 text-xs text-[#52524E]">{displaySubtitle}</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#E5E5E0] bg-white text-[#52524E] transition-colors hover:bg-[#FAF8F4] hover:text-[#1A1A18]"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">{children}</div>

          {footer && (
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#E5E5E0] bg-[#FAF8F4] px-6 py-3.5">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
