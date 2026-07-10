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
  if (typeof window !== "undefined" && typeof (window as unknown as Record<string, unknown>).gtag === "function") {
    ((window as unknown as Record<string, unknown>).gtag as (...args: unknown[]) => void)("consent", "update", {
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
  <div className="flex items-start gap-3 py-3 border-b border-ash last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-graphik font-medium text-ink-black">{label}</p>
      <p className="text-xs text-smoke mt-0.5 leading-snug font-graphik">{desc}</p>
    </div>

    {locked ? (
      <span className="flex-shrink-0 text-[10px] tracking-widest uppercase text-smoke mt-1 pt-0.5 font-graphik">
        Always on
      </span>
    ) : (
      <button
        role="checkbox"
        aria-checked={checked}
        aria-label={`${label} cookies`}
        onClick={onChange}
        className="flex-shrink-0 flex items-center justify-center w-11 h-11 -mr-1 -mt-1 focus-visible:outline-none group cursor-pointer"
      >
        <span
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150
            ${
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
  const [prefs, setPrefs] = useState<PreferenceState>({ analytics: true, marketing: false });

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
          className="cookie-banner flex flex-col w-full sm:max-w-lg bg-cream-paper border-t sm:border border-ink-black"
          style={{
            maxHeight: "min(92dvh, 500px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 border-b border-ash bg-cream-paper">
            <p className="text-[10px] tracking-[0.25em] uppercase font-normal text-ink-black font-graphik">
              Cookie preferences
            </p>
            <button
              onClick={acceptEssential}
              aria-label="Dismiss"
              className="w-11 h-11 -mr-2 flex items-center justify-center text-smoke hover:text-ink-black active:text-ink-black transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 bg-cream-paper">
            <p className="text-sm text-charcoal leading-relaxed font-graphik">
              We use cookies to keep your session active, remember preferences, and understand how people discover our verified manufacturing collections.{" "}
              <button
                onClick={() => setShowDetails((d) => !d)}
                className="underline underline-offset-2 text-ink-black hover:no-underline active:no-underline font-graphik cursor-pointer"
              >
                {showDetails ? "Hide details" : "Manage preferences"}
              </button>
            </p>

            {showDetails && (
              <div className="mt-4 border-t border-ash pt-1">
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
          <div className="flex-shrink-0 px-4 sm:px-5 pt-1 pb-3 flex flex-row gap-2 bg-cream-paper">
            <button
              onClick={acceptAll}
              className="flex-1 bg-ink-black text-pure-white text-[11px] tracking-[0.18em] uppercase py-3 px-3 hover:bg-charcoal active:bg-charcoal transition-colors min-h-[44px] cursor-pointer rounded-md font-graphik font-normal"
            >
              Accept all
            </button>
            {showDetails ? (
              <button
                onClick={saveCustom}
                className="flex-1 border border-ink-black text-ink-black text-[11px] tracking-[0.18em] uppercase py-3 px-3 hover:bg-pure-white active:bg-pure-white transition-colors min-h-[44px] cursor-pointer rounded-md font-graphik font-normal"
              >
                Save preferences
              </button>
            ) : (
              <button
                onClick={acceptEssential}
                className="flex-1 border border-ash text-charcoal text-[11px] tracking-[0.18em] uppercase py-3 px-3 hover:border-ink-black hover:text-ink-black transition-colors min-h-[44px] cursor-pointer rounded-md font-graphik font-normal"
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