"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { clsx } from "clsx";

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface ActionDropdownProps {
  actions: ActionItem[];
  align?: "left" | "right";
  buttonClassName?: string;
}

export function ActionDropdown({
  actions,
  align = "right",
  buttonClassName,
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left?: number;
    right?: number;
    openUp: boolean;
  } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < 180 && rect.top > 180;

        if (align === "right") {
          setCoords({
            top: openUp ? rect.top - 4 : rect.bottom + 4,
            right: window.innerWidth - rect.right,
            openUp,
          });
        } else {
          setCoords({
            top: openUp ? rect.top - 4 : rect.bottom + 4,
            left: rect.left,
            openUp,
          });
        }
      };

      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [isOpen, align]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={clsx(
          "flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E0] bg-white text-[#52524E] transition-all hover:border-black/30 hover:bg-[#FAF7F0] hover:text-black focus:outline-none",
          isOpen && "border-black bg-[#FAF7F0] text-black",
          buttonClassName
        )}
        aria-label="Actions menu"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen &&
        coords &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: coords.openUp ? "auto" : `${coords.top}px`,
              bottom: coords.openUp ? `${window.innerHeight - coords.top}px` : "auto",
              left: coords.left !== undefined ? `${coords.left}px` : "auto",
              right: coords.right !== undefined ? `${coords.right}px` : "auto",
            }}
            className="animate-in fade-in-80 zoom-in-95 z-[9999] min-w-[175px] overflow-hidden rounded-xl border border-[#E5E5E0] bg-white p-1.5 shadow-xl ring-1 ring-black/5 duration-100"
          >
            {actions.map((item, idx) => (
              <button
                key={idx}
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!item.disabled) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                className={clsx(
                  "font-graphik flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors select-none disabled:cursor-not-allowed disabled:opacity-50",
                  item.variant === "destructive"
                    ? "text-rose-600 hover:bg-rose-50"
                    : "text-[#1A1A18] hover:bg-[#F5F5F3]"
                )}
              >
                {item.icon && (
                  <span className="h-3.5 w-3.5 shrink-0 text-[#73736E]">
                    {item.icon}
                  </span>
                )}
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
