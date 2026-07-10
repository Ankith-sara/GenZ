"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const REASONS = [
  "General",
  "Manufacturer partnership",
  "Investor / Incubator",
  "Press",
] as const;

export function ContactForm() {
  const [reason, setReason] = useState<(typeof REASONS)[number]>("General");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Please enter your name.";
    if (!/\S+@\S+\.\S+/.test(email.trim()))
      nextErrors.email = "Please enter a valid email.";
    if (!message.trim()) nextErrors.message = "Please add a short message.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      reason,
      message: message.trim(),
    });

    if (error) {
      console.error(error);
      setStatus("error");
      return;
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className="py-5 text-center">
        <h3 className="font-nantes text-2xl text-ink-black">Thanks, {name.trim().split(" ")[0]}.</h3>
        <p className="text-smoke mt-2 text-sm font-graphik">
          We&apos;ve received your message and will get back to you at {email.trim()}.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border-ash bg-pure-white rounded-md border p-8 text-left shadow-none"
    >
      <fieldset className="mb-6 border-0 p-0">
        <legend className="text-smoke mb-3 text-xs uppercase tracking-[0.154px] font-graphik">
          What&apos;s this about?
        </legend>
        <div role="group" aria-label="Select a reason" className="flex flex-wrap gap-2.5">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={reason === r}
              onClick={() => setReason(r)}
              className={`h-9 px-4 rounded-full text-xs font-graphik font-normal tracking-[0.009em] border transition-colors ${
                reason === r
                  ? "bg-ink-black text-pure-white border-ink-black"
                  : "bg-pure-white text-charcoal border-charcoal hover:border-ink-black"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contactName" className="text-charcoal text-xs mb-1.5 block font-graphik">
            Full name <span aria-hidden="true" className="text-destructive">*</span>
          </Label>
          <Input
            id="contactName"
            name="name"
            autoComplete="name"
            required
            aria-invalid={!!errors.name}
            value={name}
            className="border-ash focus-visible:ring-ink-black rounded-md h-11 animate-none font-graphik"
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <p role="alert" className="text-destructive mt-1.5 text-xs font-graphik">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="contactEmail" className="text-charcoal text-xs mb-1.5 block font-graphik">
            Email <span aria-hidden="true" className="text-destructive">*</span>
          </Label>
          <Input
            id="contactEmail"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!errors.email}
            value={email}
            className="border-ash focus-visible:ring-ink-black rounded-md h-11 animate-none font-graphik"
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p role="alert" className="text-destructive mt-1.5 text-xs font-graphik">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <Label htmlFor="contactMessage" className="text-charcoal text-xs mb-1.5 block font-graphik">
          Message <span aria-hidden="true" className="text-destructive">*</span>
        </Label>
        <Textarea
          id="contactMessage"
          name="message"
          rows={5}
          required
          aria-invalid={!!errors.message}
          value={message}
          className="border-ash focus-visible:ring-ink-black rounded-md animate-none font-graphik"
          onChange={(e) => setMessage(e.target.value)}
        />
        {errors.message && (
          <p role="alert" className="text-destructive mt-1.5 text-xs font-graphik">
            {errors.message}
          </p>
        )}
      </div>

      {status === "error" && (
        <p role="alert" className="text-destructive mb-4 text-sm font-graphik">
          Something went wrong. Please try again.
        </p>
      )}

      <Button
        type="submit"
        className="w-full bg-ink-black text-pure-white hover:bg-charcoal rounded-md h-11 font-graphik text-sm uppercase tracking-[0.009em] font-normal"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}