"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl" | "2xl";
}

export function SlideOverDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "xl",
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

  const widthClasses = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${widthClasses} flex transform flex-col justify-between bg-white shadow-2xl transition-transform duration-200 ease-in-out`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-[#E5E5E0] bg-[#FAF8F4] px-6 py-4">
            <div>
              <h2 className="font-graphik text-lg font-bold text-[#1A1A18]">{title}</h2>
              {subtitle && (
                <p className="font-graphik mt-0.5 text-xs text-[#73736E]">{subtitle}</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#73736E] transition-colors hover:bg-[#EAEAE6] hover:text-black"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 space-y-6 overflow-y-auto p-6">{children}</div>

          {/* Drawer Footer */}
          {footer && (
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#E5E5E0] bg-[#FAF8F4] p-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
