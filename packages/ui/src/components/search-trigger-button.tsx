"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

export function SearchTriggerButton({
  placeholder = "Search...",
}: {
  placeholder?: string;
}) {
  const [shortcutText] = useState(() => {
    if (
      typeof window !== "undefined" &&
      /Mac|iPod|iPhone|iPad/i.test(navigator.userAgent)
    ) {
      return "⌘K";
    }
    return "Ctrl+K";
  });

  const handleClick = () => {
    const isMac =
      typeof window !== "undefined" &&
      /Mac|iPod|iPhone|iPad/i.test(navigator.userAgent);
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground flex h-8 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs shadow-2xs transition-colors select-none"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden font-semibold md:inline">{placeholder}</span>
      <kbd className="border-border bg-muted hidden rounded-full border px-1.5 py-0.5 font-mono text-[10px] font-bold sm:inline">
        {shortcutText}
      </kbd>
    </button>
  );
}
