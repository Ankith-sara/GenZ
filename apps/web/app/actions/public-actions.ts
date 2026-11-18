"use server";

import { createClient } from "@genz/database";
import { checkRateLimit, logRateLimitAttempt } from "@genz/utils/rate-limiter";
import { contactSchema, waitlistSchema, newsletterSchema } from "@genz/validation";
import { apiClient } from "@genz/api-client";

export async function submitWaitlist(formData: {
  name: string;
  email: string;
  city?: string;
  phone?: string;
  role: "Buyer" | "Manufacturer / Artisan" | "Curator" | "Investor / Partner";
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

  // Centralized Fastify API
  try {
    await apiClient.support.waitlist({
      name,
      email,
      role,
      city: city || undefined,
      phone: phone || undefined,
    });

    await logRateLimitAttempt({
      endpointType: "public",
      actionName: "submit_waitlist",
    });

    return { success: true };
  } catch (apiErr: unknown) {
    console.error("[SubmitWaitlist] Fastify API error:", apiErr);
    return {
      error:
        apiErr instanceof Error
          ? apiErr.message
          : "Failed to reserve your spot via backend API.",
    };
  }
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

  // Centralized Fastify API
  try {
    await apiClient.support.contact({
      name,
      email,
      reason,
      message,
    });

    await logRateLimitAttempt({
      endpointType: "public",
      actionName: "submit_contact",
    });

    return { success: true };
  } catch (apiErr: unknown) {
    console.error("[SubmitContactMessage] Fastify API error:", apiErr);
    return {
      error:
        apiErr instanceof Error
          ? apiErr.message
          : "Failed to send your message via backend API.",
    };
  }
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

  // Centralized Fastify API
  try {
    await apiClient.support.newsletter(trimmedEmail);

    await logRateLimitAttempt({
      endpointType: "public",
      actionName: "subscribe_newsletter",
    });

    return { success: true };
  } catch (apiErr: unknown) {
    console.error("[SubscribeNewsletter] Fastify API error:", apiErr);
    return {
      error:
        apiErr instanceof Error
          ? apiErr.message
          : "Failed to subscribe to newsletter via backend API.",
    };
  }
}
