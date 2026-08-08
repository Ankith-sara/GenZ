"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef("");

  useEffect(() => {
    // Avoid duplicate tracking for the same path
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    // Fire and forget — don't block the UI
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null,
      }),
    }).catch(() => {
      // Silently fail — analytics should never break the app
    });
  }, [pathname]);

  return null;
}
