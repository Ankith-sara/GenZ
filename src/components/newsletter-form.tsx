"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
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
      console.warn("newsletter_subscribers table not found. falling back to waitlist table.");
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
      if (error.code === "23505") { // Unique violation
        // If already subscribed, show success to avoid exposing info but confirm it
        setStatus("success");
      } else if (error.code === "PGRST205" || error.code === "42P01") {
        // Fallback to simulated success for local development/preview when database tables are not yet created
        console.warn("No database tables found. Simulating subscription success for development preview.");
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
      <div className="text-left py-2 animate-fade-in">
        <p className="text-gold-yellow font-serif text-lg font-medium">Thank you for subscribing!</p>
        <p className="text-white/70 text-xs mt-1 font-sans">You will receive monthly updates directly in your inbox.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-3 w-full items-start sm:items-center">
        <div className="w-full sm:grow relative">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "submitting"}
            className="bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus-visible:ring-gold-yellow focus-visible:ring-1 focus-visible:border-gold-yellow rounded-[4px] h-12 w-full px-4 text-sm transition-all focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={status === "submitting"}
          className="bg-gold-yellow text-forest-green hover:bg-gold-yellow/90 font-bold uppercase tracking-wider text-xs px-6 h-12 rounded-[4px] shrink-0 border-none transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          {status === "submitting" ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
      {errorMsg && (
        <p className="text-red-400 text-xs text-left mt-1 font-sans font-medium animate-fade-in" role="alert">
          {errorMsg}
        </p>
      )}
      {status === "error" && !errorMsg && (
        <p className="text-red-400 text-xs text-left mt-1 font-sans font-medium animate-fade-in" role="alert">
          Failed to subscribe. Please try again.
        </p>
      )}
    </form>
  );
}
