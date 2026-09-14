"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, AlertCircle, ArrowRight, X } from "lucide-react";

interface PendingStep {
  label: string;
  href: string;
}

export function SellerHeaderNotifications({
  pendingSteps,
}: {
  pendingSteps: PendingStep[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const count = pendingSteps.length;
  const allComplete = count === 0;

  return (
    <div ref={ref} className="relative">
      {/* Bell trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus-visible:ring-primary relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-colors focus-visible:ring-2"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="bg-error text-on-error absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full font-mono text-[9px] font-bold shadow-xs">
            {count}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-3 animate-in fade-in slide-in-from-top-2 absolute top-full right-0 z-50 mt-2 w-[340px] rounded-2xl border duration-150">
          {/* Header */}
          <div className="border-outline-variant/40 flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell className="text-on-surface h-4 w-4" />
              <span className="text-on-surface text-xs font-bold">Action Items</span>
              {count > 0 && (
                <span className="bg-warning-container border-warning/20 text-on-warning-container rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                  {count} pending
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-full p-1 transition-colors"
              aria-label="Close action panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Notification list */}
          <div className="max-h-[320px] overflow-y-auto p-2">
            {allComplete ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="bg-success-container text-success flex h-10 w-10 items-center justify-center rounded-full">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-on-surface text-xs font-semibold">
                  All tasks completed!
                </p>
                <p className="text-on-surface-variant text-[11px]">
                  Your store setup and verification are up to date.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {pendingSteps.map((step, idx) => (
                  <Link
                    key={idx}
                    href={step.href}
                    onClick={() => setOpen(false)}
                    className="group hover:bg-surface-container flex items-start gap-3 rounded-xl p-2.5 transition-colors"
                  >
                    <div className="border-warning/20 bg-warning-container mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border">
                      <AlertCircle className="text-warning h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-on-surface block truncate text-xs font-semibold">
                        {step.label}
                      </span>
                      <span className="text-on-surface-variant text-[10px] font-medium">
                        Recommended to complete store setup
                      </span>
                    </div>
                    <ArrowRight className="text-on-surface-variant group-hover:text-primary mt-1 h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!allComplete && (
            <div className="border-outline-variant/40 bg-surface-container-low rounded-b-2xl border-t px-4 py-2.5">
              <p className="text-on-surface-variant text-[10px] leading-relaxed">
                Complete these items to strengthen your store profile and start
                processing orders seamlessly.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
