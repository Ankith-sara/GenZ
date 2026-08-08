"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Country } from "country-state-city";
import { Label } from "@/components/ui/atoms/label";
import { Input } from "@/components/ui/atoms/input";
import { ChevronDown, Search } from "lucide-react";

interface PhoneInputWithCountryCodeProps {
  countryCodeValue?: string;
  phoneValue?: string;
  onCountryCodeChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export function PhoneInputWithCountryCode({
  countryCodeValue = "+91",
  phoneValue = "",
  onCountryCodeChange,
  onPhoneChange,
  required = true,
}: PhoneInputWithCountryCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Major trade & Asian neighboring country codes for concise seller selection
  const countryCodes = useMemo(() => {
    const majorIsos = [
      "IN", // India
      "AE", // UAE
      "SG", // Singapore
      "SA", // Saudi Arabia
      "MY", // Malaysia
      "TH", // Thailand
      "VN", // Vietnam
      "ID", // Indonesia
      "BD", // Bangladesh
      "LK", // Sri Lanka
      "NP", // Nepal
      "JP", // Japan
      "KR", // South Korea
      "CN", // China
      "HK", // Hong Kong
      "US", // USA
      "GB", // UK
    ];
    const all = Country.getAllCountries();

    const formatted = majorIsos
      .map((iso) => all.find((c) => c.isoCode === iso))
      .filter((c): c is NonNullable<typeof c> => !!c && !!c.phonecode)
      .map((c) => ({
        iso: c.isoCode,
        name: c.name,
        code: c.phonecode.startsWith("+") ? c.phonecode : `+${c.phonecode}`,
      }));

    return formatted;
  }, []);

  // Filtered country codes based on search input
  const filteredCountryCodes = useMemo(() => {
    if (!search.trim()) return countryCodes;
    const query = search.toLowerCase().trim();
    return countryCodes.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.includes(query) ||
        c.iso.toLowerCase().includes(query)
    );
  }, [countryCodes, search]);

  // Find active selected country object
  const activeCountry = useMemo(() => {
    return countryCodes.find((c) => c.code === countryCodeValue) || countryCodes[0];
  }, [countryCodes, countryCodeValue]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCode = (code: string) => {
    setIsOpen(false);
    setSearch("");

    // Dispatch synthetic change event to parent handler
    if (onCountryCodeChange) {
      onCountryCodeChange({
        target: { name: "country_code", value: code },
      } as unknown as React.ChangeEvent<HTMLSelectElement>);
    } else {
      onPhoneChange({
        target: { name: "country_code", value: code },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Label htmlFor="phone">Mobile Number *</Label>
      <input type="hidden" name="country_code" value={countryCodeValue} />

      <div className="mt-1 flex rounded-md border border-neutral-200 bg-white focus-within:ring-1 focus-within:ring-black">
        {/* Custom Theme Dropdown Trigger (Compact with SVG Flag + Code) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-l-md border-r border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
        >
          <img
            src={`https://flagcdn.com/w20/${(activeCountry?.iso || "in").toLowerCase()}.png`}
            alt={activeCountry?.iso || "IN"}
            className="h-3.5 w-5 shrink-0 rounded-[2px] border border-neutral-200 object-cover"
          />
          <span>{activeCountry?.code || "+91"}</span>
          <ChevronDown
            className={`h-3 w-3 text-neutral-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Mobile Number Input */}
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={15}
          required={required}
          value={phoneValue}
          onChange={onPhoneChange}
          placeholder="9876543210"
          className="h-10 rounded-l-none border-0 font-mono text-sm tracking-wide focus-visible:ring-0"
        />
      </div>

      {/* Theme UI Dropdown Popover */}
      {isOpen && (
        <div className="animate-fade-in absolute top-full left-0 z-50 mt-1 w-64 rounded-md border border-neutral-200 bg-white p-1.5 text-left shadow-lg">
          {/* Search Box */}
          <div className="relative mb-1">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search country or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-neutral-200 bg-neutral-50 py-1.5 pr-2.5 pl-8 text-xs text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
              autoFocus
            />
          </div>

          {/* List of Country Dial Codes */}
          <div className="custom-scrollbar max-h-52 space-y-0.5 overflow-y-auto">
            {filteredCountryCodes.length === 0 ? (
              <p className="p-2 text-center text-xs text-neutral-500">No match found</p>
            ) : (
              filteredCountryCodes.map((c) => (
                <button
                  key={`${c.iso}-${c.code}`}
                  type="button"
                  onClick={() => handleSelectCode(c.code)}
                  className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-xs transition-colors ${
                    c.code === countryCodeValue
                      ? "bg-black font-medium text-white"
                      : "text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://flagcdn.com/w20/${c.iso.toLowerCase()}.png`}
                      alt={c.iso}
                      className="h-3 w-4.5 shrink-0 rounded-[1px] border border-neutral-200 object-cover"
                    />
                    <span className="max-w-[120px] truncate">{c.name}</span>
                  </div>
                  <span className="font-mono text-[11px] opacity-80">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
