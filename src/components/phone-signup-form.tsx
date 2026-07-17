"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/types/database";
import { Country, type ICountry } from "country-state-city";
import { ChevronDown, Search } from "lucide-react";

const SIGNUP_ROLES: { value: Role; label: string }[] = [
  { value: "buyer", label: "Buyer" },
  { value: "manufacturer", label: "Manufacturer" },
];

function flagUrl(isoCode: string) {
  return `https://flagcdn.com/w40/${isoCode.toLowerCase()}.png`;
}

/**
 * Custom country-code select. Native <select><option> elements can't render
 * <img> tags, so this renders its own trigger + listbox to show a real flag
 * icon (instead of the emoji flag glyph, which falls back to plain two-letter
 * text on platforms/fonts that don't support it) next to every entry.
 */
function CountryCodeSelect({
  countries,
  value,
  onChange,
}: {
  countries: ICountry[];
  value: string;
  onChange: (isoCode: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const active = countries.find((c) => c.isoCode === value);

  const filtered = countries.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phonecode.includes(q) ||
      c.isoCode.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="border-border bg-background text-foreground hover:border-foreground/40 focus:ring-ring flex h-11 w-[104px] items-center gap-1.5 rounded-[4px] border px-2.5 text-sm transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none"
      >
        {active && (
          <Image
            src={flagUrl(active.isoCode)}
            alt=""
            width={20}
            height={14}
            className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover"
            unoptimized
          />
        )}
        <span className="flex-1 truncate text-left tabular-nums">
          +{active?.phonecode ?? "—"}
        </span>
        <ChevronDown
          className={`text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-border bg-background absolute top-[calc(100%+6px)] left-0 z-50 w-[280px] overflow-hidden rounded-[4px] border">
          <div className="border-border flex items-center gap-2 border-b px-3">
            <Search className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="text-foreground placeholder:text-muted-foreground h-10 w-full bg-transparent text-sm focus:outline-none"
            />
          </div>

          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="text-muted-foreground px-3 py-6 text-center text-sm">
                No matches
              </li>
            )}
            {filtered.map((c) => (
              <li key={`${c.isoCode}-${c.phonecode}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.isoCode === value}
                  onClick={() => {
                    onChange(c.isoCode);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`hover:bg-muted flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                    c.isoCode === value ? "bg-muted" : ""
                  }`}
                >
                  <Image
                    src={flagUrl(c.isoCode)}
                    alt=""
                    width={20}
                    height={14}
                    className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover"
                    unoptimized
                  />
                  <span className="text-foreground flex-1 truncate">{c.name}</span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    +{c.phonecode}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function PhoneSignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "code">("details");
  const [role, setRole] = useState<Role>("buyer");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedIsoCode, setSelectedIsoCode] = useState("IN");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const countries = Country.getAllCountries();
  const activeCountry = countries.find((c) => c.isoCode === selectedIsoCode);
  const countryCode = activeCountry?.phonecode ?? "91";

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }

    const finalPhone = phone.trim().startsWith("+")
      ? phone.trim()
      : `+${countryCode}${phone.replace(/\D/g, "")}`;

    setStatus("pending");
    setError(null);
    setFormattedPhone(finalPhone);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: finalPhone,
      options: {
        shouldCreateUser: true,
        data: { full_name: fullName.trim(), role },
      },
    });

    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }
    setStatus("idle");
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus("pending");
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: code.trim(),
      type: "sms",
    });

    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (step === "code") {
    return (
      <form onSubmit={verifyCode} noValidate>
        <div className="mb-2">
          <Label htmlFor="otp">Enter the code sent to {formattedPhone}</Label>
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1.5 tracking-widest"
            required
          />
        </div>
        {error && (
          <p role="alert" className="text-destructive mt-2 mb-4 text-sm">
            {error}
          </p>
        )}
        <Button type="submit" className="mt-4 w-full" disabled={status === "pending"}>
          {status === "pending" ? "Verifying…" : "Verify & create account"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setStep("details");
            setCode("");
            setError(null);
            setStatus("idle");
          }}
          className="text-muted-foreground mt-3 w-full text-center text-xs underline-offset-2 hover:underline"
        >
          Use a different number
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} noValidate>
      <fieldset className="mb-5 border-0 p-0">
        <legend className="text-muted-foreground mb-2.5 text-xs">
          I am signing up as a...
        </legend>
        <div role="group" aria-label="Select account type" className="flex gap-2">
          {SIGNUP_ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              aria-pressed={role === r.value}
              onClick={() => setRole(r.value)}
              className={`h-11 flex-1 rounded-[4px] border text-sm transition-colors ${
                role === r.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground/40"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mb-4">
        <Label htmlFor="fullNamePhone">Full name</Label>
        <Input
          id="fullNamePhone"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1.5"
          required
        />
      </div>

      <div className="mb-2">
        <Label htmlFor="phoneSignup">Phone number</Label>
        <div className="mt-1.5 flex gap-2">
          <CountryCodeSelect
            countries={countries}
            value={selectedIsoCode}
            onChange={setSelectedIsoCode}
          />
          <Input
            id="phoneSignup"
            type="tel"
            placeholder="XXXXXXXXXX"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1"
            required
          />
        </div>
        <p className="text-muted-foreground mt-1.5 text-xs">
          Select country code and enter phone number.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-destructive mt-2 mb-4 text-sm">
          {error}
        </p>
      )}

      <Button type="submit" className="mt-4 w-full" disabled={status === "pending"}>
        {status === "pending" ? "Sending…" : "Send code"}
      </Button>
    </form>
  );
}
