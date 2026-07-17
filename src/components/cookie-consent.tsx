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
  <div className="border-ash flex items-start gap-3 border-b py-3 last:border-0">
    <div className="min-w-0 flex-1">
      <p className="font-graphik text-ink-black text-sm font-medium">{label}</p>
      <p className="text-smoke font-graphik mt-0.5 text-xs leading-snug">{desc}</p>
    </div>

    {locked ? (
      <span className="text-smoke font-graphik mt-1 flex-shrink-0 pt-0.5 text-[10px] tracking-widest uppercase">
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
              ? "bg-ink-black border-ink-black"
              : "bg-pure-white border-ash group-hover:border-charcoal group-active:border-ink-black"
          }`}
        >
          {checked && <Check size={12} strokeWidth={3} className="text-pure-white" />}
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

  // Reset/hide when navigating to a blocked path (e.g. /assistant or /dashboard)
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
      <style>{`
        @keyframes cookieSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cookie-banner { animation: cookieSlideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>

      <div
        className="fixed inset-x-0 bottom-0 z-[9999] flex justify-start sm:px-6 sm:pb-6"
        role="dialog"
        aria-label="Cookie consent"
        aria-modal="false"
      >
        <div
          className="cookie-banner bg-cream-paper border-ink-black flex w-full flex-col border-t sm:max-w-lg sm:border"
          style={{
            maxHeight: "min(92dvh, 500px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {/* Header */}
          <div className="border-ash bg-cream-paper flex flex-shrink-0 items-center justify-between border-b px-4 pt-4 pb-3 sm:px-5">
            <p className="text-ink-black font-graphik text-[10px] font-normal tracking-[0.25em] uppercase">
              Cookie preferences
            </p>
            <button
              onClick={acceptEssential}
              aria-label="Dismiss"
              className="text-smoke hover:text-ink-black active:text-ink-black -mr-2 flex h-11 w-11 cursor-pointer items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="bg-cream-paper flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
            <p className="text-charcoal font-graphik text-sm leading-relaxed">
              We use cookies to keep your session active, remember preferences, and
              understand how people discover our verified manufacturing collections.{" "}
              <button
                onClick={() => setShowDetails((d) => !d)}
                className="text-ink-black font-graphik cursor-pointer underline underline-offset-2 hover:no-underline active:no-underline"
              >
                {showDetails ? "Hide details" : "Manage preferences"}
              </button>
            </p>

            {showDetails && (
              <div className="border-ash mt-4 border-t pt-1">
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

          {/* Actions */}
          <div className="bg-cream-paper flex flex-shrink-0 flex-row gap-2 px-4 pt-1 pb-3 sm:px-5">
            <button
              onClick={acceptAll}
              className="bg-ink-black text-pure-white hover:bg-charcoal active:bg-charcoal font-graphik min-h-[44px] flex-1 cursor-pointer rounded-md px-3 py-3 text-[11px] font-normal tracking-[0.18em] uppercase transition-colors"
            >
              Accept all
            </button>
            {showDetails ? (
              <button
                onClick={saveCustom}
                className="border-ink-black text-ink-black hover:bg-pure-white active:bg-pure-white font-graphik min-h-[44px] flex-1 cursor-pointer rounded-md border px-3 py-3 text-[11px] font-normal tracking-[0.18em] uppercase transition-colors"
              >
                Save preferences
              </button>
            ) : (
              <button
                onClick={acceptEssential}
                className="border-ash text-charcoal hover:border-ink-black hover:text-ink-black font-graphik min-h-[44px] flex-1 cursor-pointer rounded-md border px-3 py-3 text-[11px] font-normal tracking-[0.18em] uppercase transition-colors"
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
