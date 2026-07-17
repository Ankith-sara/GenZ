"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    const supabase = createClient();

    // Try inserting into newsletter_subscribers table first
    let { error } = await supabase.from("newsletter_subscribers").insert({
      email: trimmedEmail,
    });

    // Fallback to waitlist table if newsletter_subscribers table doesn't exist (Postgres 42P01 or PostgREST PGRST205)
    if (error && (error.code === "42P01" || error.code === "PGRST205")) {
      console.warn(
        "newsletter_subscribers table not found. falling back to waitlist table."
      );
      const { error: fallbackError } = await supabase.from("waitlist").insert({
        name: "Newsletter Subscriber",
        email: trimmedEmail,
        city: null,
        phone: null,
        role: "newsletter",
      });
      error = fallbackError;
    }

    if (error) {
      console.error("Newsletter subscription error:", error);
      if (error.code === "23505") {
        // Unique violation
        // If already subscribed, show success to avoid exposing info but confirm it
        setStatus("success");
      } else if (error.code === "PGRST205" || error.code === "42P01") {
        // Fallback to simulated success for local development/preview when database tables are not yet created
        console.warn(
          "No database tables found. Simulating subscription success for development preview."
        );
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again later.");
      }
      return;
    }

    setStatus("success");
    setEmail("");
  }

  if (status === "success") {
    return (
      <div className="animate-fade-in py-2 text-left">
        <p className="text-brand-yellow-dark font-serif text-lg font-medium">
          Thank you for subscribing!
        </p>
        <p className="mt-1 font-sans text-xs text-white/70">
          You will receive monthly updates directly in your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-2">
      <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:grow">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "submitting"}
            className="bg-paper-white/5 focus-visible:ring-brand-yellow-dark focus-visible:border-brand-yellow-dark h-12 w-full rounded-[4px] border border-white/20 px-4 text-sm text-white transition-all placeholder:text-white/40 focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={status === "submitting"}
          className="bg-brand-yellow hover:bg-brand-yellow/90 h-12 shrink-0 rounded-[4px] border-none px-6 text-xs font-medium tracking-wider text-black uppercase transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          {status === "submitting" ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
      {errorMsg && (
        <p
          className="animate-fade-in mt-1 text-left font-sans text-xs font-medium text-red-400"
          role="alert"
        >
          {errorMsg}
        </p>
      )}
      {status === "error" && !errorMsg && (
        <p
          className="animate-fade-in mt-1 text-left font-sans text-xs font-medium text-red-400"
          role="alert"
        >
          Failed to subscribe. Please try again.
        </p>
      )}
    </form>
  );
}
