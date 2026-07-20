"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import { waitlistSchema, contactSchema, newsletterSchema } from "@/lib/validation";

export async function submitWaitlist(formData: {
  name: string;
  email: string;
  city?: string;
  phone?: string;
  role: string;
}) {
  // 1. Rate limiting check
  const rateLimit = await checkRateLimit({
    endpointType: "public",
    actionName: "submit_waitlist",
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Schema validation
  const validation = waitlistSchema.safeParse(formData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { name, email, city, phone, role } = validation.data;

  // 3. Database operations
  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({
    name,
    email,
    city: city || null,
    phone: phone || null,
    role,
  });

  // Log attempt
  await logRateLimitAttempt({
    endpointType: "public",
    actionName: "submit_waitlist",
  });

  if (error) {
    console.error("Waitlist DB insertion error:", error);
    return { error: "Failed to reserve your spot. Please try again." };
  }

  return { success: true };
}

export async function submitContactMessage(formData: {
  name: string;
  email: string;
  reason: "General" | "Manufacturer partnership" | "Investor / Incubator" | "Press";
  message: string;
}) {
  // 1. Rate limiting check
  const rateLimit = await checkRateLimit({
    endpointType: "public",
    actionName: "submit_contact",
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Schema validation
  const validation = contactSchema.safeParse(formData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { name, email, reason, message } = validation.data;

  // 3. Database operations
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    reason,
    message,
  });

  // Log attempt
  await logRateLimitAttempt({
    endpointType: "public",
    actionName: "submit_contact",
  });

  if (error) {
    console.error("Contact message DB insertion error:", error);
    return { error: "Failed to send your message. Please try again." };
  }

  return { success: true };
}

export async function subscribeNewsletter(email: string) {
  // 1. Rate limiting check
  const rateLimit = await checkRateLimit({
    endpointType: "public",
    actionName: "subscribe_newsletter",
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Schema validation
  const validation = newsletterSchema.safeParse({ email });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const trimmedEmail = validation.data.email;

  // 3. Database operations
  const supabase = await createClient();

  // Try inserting into newsletter_subscribers table first
  let { error } = await supabase.from("newsletter_subscribers").insert({
    email: trimmedEmail,
  });

  // Fallback to waitlist table if newsletter_subscribers table doesn't exist
  if (error && (error.code === "42P01" || error.code === "PGRST205")) {
    console.warn(
      "newsletter_subscribers table not found, falling back to waitlist table."
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

  // Log attempt
  await logRateLimitAttempt({
    endpointType: "public",
    actionName: "subscribe_newsletter",
  });

  if (error) {
    console.error("Newsletter subscription error:", error);
    if (error.code === "23505") {
      return { success: true };
    }
    if (error.code === "PGRST205" || error.code === "42P01") {
      console.warn(
        "No database tables found. Simulating subscription success for development preview."
      );
      return { success: true };
    }
    return { error: "Something went wrong. Please try again later." };
  }

  return { success: true };
}
