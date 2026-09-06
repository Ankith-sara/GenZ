"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Country } from "country-state-city";
import { Label } from "./label";
import { Input } from "./input";
import { ChevronDown, Search } from "lucide-react";

export interface PhoneInputWithCountryCodeProps {
  id?: string;
  name?: string;
  countryCodeName?: string;
  countryCodeValue?: string;
  phoneValue?: string;
  value?: string;
  defaultValue?: string;
  onCountryCodeChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPhoneChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string | null;
}

export function PhoneInputWithCountryCode({
  id = "phone",
  name = "phone",
  countryCodeName = "country_code",
  countryCodeValue = "+91",
  phoneValue,
  value,
  defaultValue,
  onCountryCodeChange,
  onPhoneChange,
  onChange,
  placeholder = "9876543210",
  required = true,
  className,
  label = null,
}: PhoneInputWithCountryCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeValue = value !== undefined ? value : phoneValue;
  const activeChange = onChange || onPhoneChange;

  const countryCodes = useMemo(() => {
    const majorIsos = [
      "IN",
      "AE",
      "SG",
      "SA",
      "MY",
      "TH",
      "VN",
      "ID",
      "BD",
      "LK",
      "NP",
      "JP",
      "KR",
      "CN",
      "HK",
      "US",
      "GB",
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

  const activeCountry = useMemo(() => {
    return countryCodes.find((c) => c.code === countryCodeValue) || countryCodes[0];
  }, [countryCodes, countryCodeValue]);

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

    if (onCountryCodeChange) {
      onCountryCodeChange({
        target: { name: countryCodeName, value: code },
      } as unknown as React.ChangeEvent<HTMLSelectElement>);
    }
    if (activeChange) {
      activeChange({
        target: { name: countryCodeName, value: code },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <input type="hidden" name={countryCodeName} value={countryCodeValue} />

      <div className="mt-1 flex rounded-lg border border-neutral-300 bg-white shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/30">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-l-lg border-r border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
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

        <Input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={15}
          required={required}
          value={activeValue}
          defaultValue={activeValue === undefined ? defaultValue : undefined}
          onChange={activeChange}
          readOnly={activeValue !== undefined && !activeChange ? true : undefined}
          placeholder={placeholder}
          className="h-11 rounded-l-none border-0 font-mono text-sm tracking-wide shadow-none focus-visible:border-0 focus-visible:ring-0"
        />
      </div>

      {isOpen && (
        <div className="animate-fade-in absolute top-full left-0 z-50 mt-1 w-64 rounded-xl border border-neutral-200 bg-white p-1.5 text-left shadow-lg">
          <div className="relative mb-1">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search country or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-1.5 pr-2.5 pl-8 text-xs text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
              autoFocus
            />
          </div>

          <div className="custom-scrollbar max-h-52 space-y-0.5 overflow-y-auto">
            {filteredCountryCodes.length === 0 ? (
              <p className="p-2 text-center text-xs text-neutral-500">No match found</p>
            ) : (
              filteredCountryCodes.map((c) => (
                <button
                  key={`${c.iso}-${c.code}`}
                  type="button"
                  onClick={() => handleSelectCode(c.code)}
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors ${
                    c.code === countryCodeValue
                      ? "bg-black font-medium text-white"
                      : "text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
