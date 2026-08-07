"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutGrid,
  Building2,
  Users,
  ShoppingBag,
  MessageSquare,
  UserCheck,
  Mail,
  X,
  ArrowRight,
} from "lucide-react";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open menu via trigger
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutGrid,
      category: "Pages",
    },
    {
      label: "Verifications",
      href: "/admin/dashboard/verifications",
      icon: Building2,
      category: "Pages",
    },
    {
      label: "User Profiles",
      href: "/admin/dashboard/users",
      icon: Users,
      category: "Pages",
    },
    {
      label: "Product Catalog",
      href: "/admin/dashboard/products",
      icon: ShoppingBag,
      category: "Pages",
    },
    {
      label: "Inquiry Stream",
      href: "/admin/dashboard/inquiries",
      icon: MessageSquare,
      category: "Pages",
    },
    {
      label: "Waitlist Leads",
      href: "/admin/dashboard/waitlist",
      icon: UserCheck,
      category: "Leads",
    },
    {
      label: "Contact Messages",
      href: "/admin/dashboard/contact",
      icon: Mail,
      category: "Leads",
    },
  ];

  const filteredNav = quickNav.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 select-none sm:pt-28">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Command Box */}
      <div className="animate-in fade-in-90 zoom-in-95 relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-2xl duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-[#E5E5E0] px-4">
          <Search className="h-4 w-4 shrink-0 text-[#73736E]" />
          <input
            type="text"
            placeholder="Type a command or search pages (e.g. Users, Products)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="font-graphik h-13 w-full bg-transparent px-3 text-sm text-black placeholder:text-[#A3A39D] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#73736E] hover:bg-[#F5F5F3] hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredNav.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#73736E]">
              No pages or commands matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredNav.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="font-graphik group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs text-[#1A1A18] transition-colors hover:bg-[#FAF7F0]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E5E0] bg-white text-[#52524E] group-hover:border-black group-hover:bg-black group-hover:text-white">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-black">{item.label}</span>
                      <span className="ml-2 font-mono text-[10px] text-[#8C8C85]">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[#A3A39D] opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between border-t border-[#E5E5E0] bg-[#FAF8F4] px-4 py-2 font-mono text-[11px] text-[#73736E]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-[#E5E5E0] bg-white px-1.5 py-0.5">
                ↵
              </kbd>{" "}
              select
            </span>
            <span>
              <kbd className="rounded border border-[#E5E5E0] bg-white px-1.5 py-0.5">
                esc
              </kbd>{" "}
              close
            </span>
          </div>
          <span>GenZ Platform Command Palette</span>
        </div>
      </div>
    </div>
  );
}
