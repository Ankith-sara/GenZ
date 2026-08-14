"use server";

import { createClient } from "@genz/database/server";
import { checkRateLimit, logRateLimitAttempt } from "@genz/utils/rate-limiter";
import { waitlistSchema, contactSchema, newsletterSchema } from "@genz/validation";

export async function submitWaitlist(formData: {
  name: string;
  email: string;
  city?: string;
  phone?: string;
  role: string;
}) {
  const rateLimit = await checkRateLimit({
    endpointType: "public",
    actionName: "submit_waitlist",
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  const validation = waitlistSchema.safeParse(formData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { name, email, city, phone, role } = validation.data;

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({
    name,
    email,
    city: city || null,
    phone: phone || null,
    role,
  });

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
  reason: "General" | "Seller partnership" | "Investor / Incubator" | "Press";
  message: string;
}) {
  const rateLimit = await checkRateLimit({
    endpointType: "public",
    actionName: "submit_contact",
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  const validation = contactSchema.safeParse(formData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { name, email, reason, message } = validation.data;

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    reason,
    message,
  });

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
  const rateLimit = await checkRateLimit({
    endpointType: "public",
    actionName: "subscribe_newsletter",
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  const validation = newsletterSchema.safeParse({ email });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const trimmedEmail = validation.data.email;

  const supabase = await createClient();

  let { error } = await supabase.from("newsletter_subscribers").insert({
    email: trimmedEmail,
  });

  if (error && (error.code === "42P01" || error.code === "PGRST205")) {
    const { error: fallbackError } = await supabase.from("waitlist").insert({
      name: "Newsletter Subscriber",
      email: trimmedEmail,
      city: null,
      phone: null,
      role: "newsletter",
    });
    error = fallbackError;
  }

  await logRateLimitAttempt({
    endpointType: "public",
    actionName: "subscribe_newsletter",
  });

  if (error) {
    if (error.code === "23505" || error.code === "PGRST205" || error.code === "42P01") {
      return { success: true };
    }
    return { error: "Something went wrong. Please try again later." };
  }

  return { success: true };
}
