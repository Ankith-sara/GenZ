"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Country, type ICountry } from "country-state-city";
import { ChevronDown, Search } from "lucide-react";

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
        className="flex h-11 w-[104px] items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm text-foreground transition-colors hover:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
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
          className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[280px] overflow-hidden rounded-md border border-border bg-background shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="h-10 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
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
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
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
                  <span className="flex-1 truncate text-foreground">{c.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
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

export function PhoneLoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
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
    if (!phone.trim()) return;

    const finalPhone = phone.trim().startsWith("+")
      ? phone.trim()
      : `+${countryCode}${phone.replace(/\D/g, "")}`;

    setStatus("pending");
    setError(null);
    setFormattedPhone(finalPhone);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: finalPhone,
      options: { shouldCreateUser: false },
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

    router.push(redirectTo);
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
          <p role="alert" className="mb-4 mt-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="mt-4 w-full" disabled={status === "pending"}>
          {status === "pending" ? "Verifying…" : "Verify & sign in"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setCode("");
            setError(null);
            setStatus("idle");
          }}
          className="mt-3 w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Use a different number
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} noValidate>
      <div className="mb-2">
        <Label htmlFor="phone">Phone number</Label>
        <div className="mt-1.5 flex gap-2">
          <CountryCodeSelect
            countries={countries}
            value={selectedIsoCode}
            onChange={setSelectedIsoCode}
          />
          <Input
            id="phone"
            type="tel"
            placeholder="XXXXXXXXXX"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1"
            required
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Select country code and enter phone number.
        </p>
      </div>
      {error && (
        <p role="alert" className="mb-4 mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="mt-4 w-full" disabled={status === "pending"}>
        {status === "pending" ? "Sending…" : "Send code"}
      </Button>
    </form>
  );
}