"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "genz_cookie_consent";

interface PreferenceState {
  analytics: boolean;
  marketing: boolean;
}

const applyPreferences = (prefs: PreferenceState) => {
  if (
    typeof window !== "undefined" &&
    typeof (window as unknown as Record<string, unknown>).gtag === "function"
  ) {
    (
      (window as unknown as Record<string, unknown>).gtag as (
        ...args: unknown[]
      ) => void
    )("consent", "update", {
      analytics_storage: prefs.analytics ? "granted" : "denied",
      ad_storage: prefs.marketing ? "granted" : "denied",
      ad_user_data: prefs.marketing ? "granted" : "denied",
      ad_personalization: prefs.marketing ? "granted" : "denied",
    });
  }
};

interface PrefRowProps {
  label: string;
  desc: string;
  locked?: boolean;
  checked?: boolean;
  onChange?: () => void;
}

const PrefRow = ({ label, desc, locked, checked, onChange }: PrefRowProps) => (
  <div className="flex items-start gap-3 border-b border-[#E5E5E0] py-3 last:border-0">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-[#1A1A18]">{label}</p>
      <p className="mt-0.5 text-xs leading-snug text-[#73736E]">{desc}</p>
    </div>

    {locked ? (
      <span className="mt-1 flex-shrink-0 pt-0.5 text-[10px] tracking-widest text-[#73736E] uppercase">
        Always on
      </span>
    ) : (
      <button
        role="checkbox"
        aria-checked={checked}
        aria-label={`${label} cookies`}
        onClick={onChange}
        className="group -mt-1 -mr-1 flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center focus-visible:outline-none"
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors duration-150 ${
            checked
              ? "border-[#1A1A18] bg-[#1A1A18]"
              : "border-[#E5E5E0] bg-white group-hover:border-black"
          }`}
        >
          {checked && <Check size={12} strokeWidth={3} className="text-white" />}
        </span>
      </button>
    )}
  </div>
);

export function CookieConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<PreferenceState>({
    analytics: true,
    marketing: false,
  });

  const isBlocked = pathname === "/assistant" || pathname?.startsWith("/dashboard");
  const [prevBlocked, setPrevBlocked] = useState(isBlocked);

  if (isBlocked !== prevBlocked) {
    setPrevBlocked(isBlocked);
    if (isBlocked) {
      setVisible(false);
    }
  }

  useEffect(() => {
    if (isBlocked) {
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        applyPreferences(parsed.prefs || { analytics: false, marketing: false });
        return;
      }
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(t);
  }, [pathname, isBlocked]);

  const save = (accepted: boolean, customPrefs?: PreferenceState) => {
    const finalPrefs = accepted
      ? customPrefs || prefs
      : { analytics: false, marketing: false };
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ accepted, prefs: finalPrefs, ts: Date.now(), version: 1 })
      );
    } catch {
      /* private browsing */
    }
    applyPreferences(finalPrefs);
    setVisible(false);
  };

  const acceptAll = () => {
    const all = { analytics: true, marketing: true };
    setPrefs(all);
    save(true, all);
  };

  const acceptEssential = () => save(false);
  const saveCustom = () => save(true, prefs);
  const toggle = (key: keyof PreferenceState) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  if (!visible) return null;

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-[9999] flex justify-start sm:px-6 sm:pb-6"
        role="dialog"
        aria-label="Cookie consent"
        aria-modal="false"
      >
        <div
          className="flex w-full flex-col border-t border-black bg-[#FAF7F0] shadow-2xl sm:max-w-lg sm:rounded-2xl sm:border"
          style={{
            maxHeight: "min(92dvh, 500px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="flex flex-shrink-0 items-center justify-between border-b border-[#E5E5E0] px-4 pt-4 pb-3 sm:px-5">
            <p className="text-[10px] font-normal tracking-[0.25em] text-[#1A1A18] uppercase">
              Cookie preferences
            </p>
            <button
              onClick={acceptEssential}
              aria-label="Dismiss"
              className="-mr-2 flex h-11 w-11 cursor-pointer items-center justify-center text-[#73736E] transition-colors hover:text-black"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
            <p className="text-sm leading-relaxed text-[#52524E]">
              We use cookies to keep your session active, remember preferences, and
              understand how people discover our verified manufacturing collections.{" "}
              <button
                onClick={() => setShowDetails((d) => !d)}
                className="cursor-pointer font-medium text-black underline underline-offset-2 hover:no-underline"
              >
                {showDetails ? "Hide details" : "Manage preferences"}
              </button>
            </p>

            {showDetails && (
              <div className="mt-4 border-t border-[#E5E5E0] pt-1">
                <PrefRow
                  key="essential"
                  label="Essential"
                  desc="Cart, authentication, security. Cannot be disabled."
                  locked
                  checked
                />
                <PrefRow
                  key="analytics"
                  label="Analytics"
                  desc="Helps us understand which products and pages resonate most."
                  checked={prefs.analytics}
                  onChange={() => toggle("analytics")}
                />
                <PrefRow
                  key="marketing"
                  label="Marketing"
                  desc="Personalised ads and social media features."
                  checked={prefs.marketing}
                  onChange={() => toggle("marketing")}
                />
              </div>
            )}
          </div>

          <div className="flex flex-shrink-0 flex-row gap-2 px-4 pt-1 pb-3 sm:px-5">
            <button
              onClick={acceptAll}
              className="min-h-[44px] flex-1 cursor-pointer rounded-xl bg-black px-3 py-3 text-[11px] font-semibold tracking-[0.18em] text-white uppercase transition-colors hover:bg-neutral-800"
            >
              Accept all
            </button>
            {showDetails ? (
              <button
                onClick={saveCustom}
                className="min-h-[44px] flex-1 cursor-pointer rounded-xl border border-black bg-white px-3 py-3 text-[11px] font-semibold tracking-[0.18em] text-black uppercase transition-colors hover:bg-[#F5F5F3]"
              >
                Save preferences
              </button>
            ) : (
              <button
                onClick={acceptEssential}
                className="min-h-[44px] flex-1 cursor-pointer rounded-xl border border-[#E5E5E0] bg-white px-3 py-3 text-[11px] font-semibold tracking-[0.18em] text-[#52524E] uppercase transition-colors hover:border-black hover:text-black"
              >
                Essential only
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
