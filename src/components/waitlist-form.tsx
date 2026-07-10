"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  "Consumer",
  "Manufacturer",
  "Startup / MSME",
  "Investor",
  "Incubator",
  "Student",
] as const;

export function WaitlistForm() {
  const [role, setRole] = useState<(typeof ROLES)[number]>("Consumer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Please enter your name.";
    if (!/\S+@\S+\.\S+/.test(email.trim()))
      nextErrors.email = "Please enter a valid email.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    const supabase = createClient();
    const { error } = await supabase.from("waitlist").insert({
      name: name.trim(),
      email: email.trim(),
      city: city.trim() || null,
      phone: phone.trim() || null,
      role,
    });

    if (error) {
      console.error(error);
      setStatus("error");
      return;
    }
    document.cookie = "waitlist_joined=true; path=/; max-age=31536000; SameSite=Lax";
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className="py-5 text-center">
        <h3 className="font-serif text-2xl">
          You&apos;re on the list, {name.trim().split(" ")[0]}.
        </h3>
        <p className="text-muted-foreground mt-2 text-sm">
          We&apos;ll reach out as GenZ opens up to the founding cohort.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border-ash bg-paper-white rounded-[4px] border p-8 text-left shadow-none"
    >
      <fieldset className="mb-6 border-0 p-0">
        <legend className="text-smoke mb-3 text-xs uppercase tracking-wider font-sans">
          I am joining as a...
        </legend>
        <div
          role="group"
          aria-label="Select your role"
          className="flex flex-wrap gap-2"
        >
          {ROLES.map((r) => (
            <Button
              key={r}
              type="button"
              variant="pill"
              size="sm"
              data-active={role === r}
              aria-pressed={role === r}
              onClick={() => setRole(r)}
              className="text-xs"
            >
              {r}
            </Button>
          ))}
        </div>
      </fieldset>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="wlName" className="text-charcoal text-xs mb-1.5 block">
            Full name <span aria-hidden="true" className="text-destructive">*</span>
          </Label>
          <Input
            id="wlName"
            name="name"
            autoComplete="name"
            required
            aria-invalid={!!errors.name}
            value={name}
            className="border-ash focus-visible:ring-black rounded-[4px] h-11 animate-none"
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <p role="alert" className="text-destructive mt-1.5 text-xs">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="wlEmail" className="text-charcoal text-xs mb-1.5 block">
            Email <span aria-hidden="true" className="text-destructive">*</span>
          </Label>
          <Input
            id="wlEmail"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!errors.email}
            value={email}
            className="border-ash focus-visible:ring-black rounded-[4px] h-11 animate-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p role="alert" className="text-destructive mt-1.5 text-xs">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="wlCity" className="text-charcoal text-xs mb-1.5 block">City</Label>
          <Input
            id="wlCity"
            name="city"
            autoComplete="address-level2"
            value={city}
            className="border-ash focus-visible:ring-black rounded-[4px] h-11 animate-none"
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="wlPhone" className="text-charcoal text-xs mb-1.5 block">Phone (optional)</Label>
          <Input
            id="wlPhone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            className="border-ash focus-visible:ring-black rounded-[4px] h-11 animate-none"
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <p className="text-smoke mb-6 text-xs font-sans">
        We&apos;ll only use this to reach out about the founding cohort.
      </p>

      {status === "error" && (
        <p role="alert" className="text-destructive mb-4 text-sm">
          Something went wrong. Please try again.
        </p>
      )}

      <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 rounded-[4px] h-11 font-sans text-sm uppercase tracking-wider font-normal" disabled={status === "submitting"}>
        {status === "submitting" ? "Reserving your spot…" : "Reserve My Spot"}
      </Button>
    </form>
  );
}
