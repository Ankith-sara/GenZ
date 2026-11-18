"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  className = "",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options to { value, label }
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Hidden input for native form serialization */}
      {name && <input type="hidden" name={name} value={value} required={required} />}

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex h-12 w-full cursor-pointer items-center justify-between rounded-lg border bg-white px-3.5 text-left text-sm transition-all focus:outline-none ${
          isOpen
            ? "border-[#1A1A18] ring-1 ring-[#1A1A18]"
            : "border-[#E5E5E0] hover:border-[#1A1A18]/40"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <span
          className={`truncate ${
            selectedOption && selectedOption.value
              ? "font-medium text-[#1A1A18]"
              : "text-[#52524E]/60"
          }`}
        >
          {selectedOption && selectedOption.value ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#52524E] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#1A1A18]" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="animate-in fade-in zoom-in-95 absolute top-full right-0 left-0 z-50 mt-1.5 max-h-64 scrollbar-thin overflow-y-auto rounded-xl border border-[#E5E5E0] bg-white p-1.5 shadow-lg shadow-black/5 duration-100"
        >
          {placeholder && (
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                !value
                  ? "bg-[#FAF8F4] font-semibold text-[#1A1A18]"
                  : "text-[#52524E] hover:bg-[#FAF8F4] hover:text-[#1A1A18]"
              }`}
            >
              <span>{placeholder}</span>
              {!value && <Check className="h-4 w-4 text-[#1A1A18]" />}
            </button>
          )}

          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-[#FAF8F4] font-semibold text-[#1A1A18]"
                    : "text-[#1A1A18] hover:bg-[#FAF8F4]"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-4 w-4 text-[#1A1A18]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
