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
        className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#E5E5E0] bg-white text-[#52524E] shadow-2xs transition-colors hover:border-black hover:text-black"
        aria-label="Notifications"
      >
        <Bell className="h-3.5 w-3.5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 font-mono text-[9px] font-bold text-white shadow-sm">
            {count}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="font-graphik absolute top-full right-0 z-50 mt-2 w-[340px] rounded-xl border border-[#E5E5E0] bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F0F0EC] px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-black" />
              <span className="text-xs font-bold text-[#1A1A18]">Notifications</span>
              {count > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 font-mono text-[10px] font-bold text-red-700">
                  {count} pending
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-[#73736E] transition-colors hover:bg-[#FAF8F4] hover:text-black"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Notification list */}
          <div className="max-h-[320px] overflow-y-auto p-2">
            {allComplete ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-[#1A1A18]">All steps complete!</p>
                <p className="text-[11px] text-[#73736E]">
                  Your seller profile is fully set up.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {pendingSteps.map((step, idx) => (
                  <Link
                    key={idx}
                    href={step.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-[#FAF8F4]"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-amber-50">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-semibold text-[#1A1A18] group-hover:text-black">
                        {step.label}
                      </span>
                      <span className="text-[10px] font-medium text-[#73736E]">
                        Required to complete seller onboarding
                      </span>
                    </div>
                    <ArrowRight className="mt-1 h-3 w-3 shrink-0 text-[#8C8C85] transition-transform group-hover:translate-x-0.5 group-hover:text-black" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!allComplete && (
            <div className="border-t border-[#F0F0EC] px-4 py-2.5">
              <p className="text-[10px] leading-relaxed text-[#73736E]">
                Complete all steps to activate your storefront and start receiving buyer
                inquiries.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
