"use client";

import React from "react";
import { Search } from "lucide-react";

export function SearchTriggerButton({
  placeholder = "Search...",
}: {
  placeholder?: string;
}) {
  const handleClick = () => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-[#E5E5E0] bg-white px-2.5 text-xs text-[#73736E] shadow-2xs transition-colors select-none hover:border-black hover:text-black"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden font-semibold md:inline">{placeholder}</span>
      <kbd className="hidden rounded border border-[#E5E5E0] bg-[#FAF8F4] px-1.5 py-0.5 font-mono text-[10px] font-bold sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
