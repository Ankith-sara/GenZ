import { getSupabaseAdminClient } from "../../integrations/supabase";
import { ValidationError } from "../../common/errors";

export class SupportService {
  static async submitContactMessage(input: {
    name: string;
    email: string;
    reason: string;
    message: string;
  }) {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.from("contact_messages").insert({
      name: input.name,
      email: input.email,
      reason: input.reason,
      message: input.message,
    });

    if (error) {
      throw new ValidationError(`Failed to send message: ${error.message}`);
    }

    return { message: "Your message has been sent successfully. Our team will contact you shortly." };
  }

  static async subscribeNewsletter(email: string) {
    const admin = getSupabaseAdminClient();
    const trimmed = email.trim().toLowerCase();

    let { error } = await admin.from("newsletter_subscribers").insert({
      email: trimmed,
    });

    // Fallback if table doesn't exist
    if (error && (error.code === "42P01" || error.code === "PGRST205")) {
      const { error: fallbackError } = await admin.from("waitlist").insert({
        name: "Newsletter Subscriber",
        email: trimmed,
        city: null,
        phone: null,
        role: "newsletter",
      });
      error = fallbackError;
    }

    // Duplicate email is considered a success
    if (error && error.code !== "23505") {
      throw new ValidationError(`Failed to subscribe: ${error.message}`);
    }

    return { message: "Thank you for subscribing to our newsletter!" };
  }

  static async joinWaitlist(input: {
    name: string;
    email: string;
    role: string;
    city?: string;
    phone?: string;
  }) {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.from("waitlist").insert({
      name: input.name,
      email: input.email.trim().toLowerCase(),
      role: input.role,
      city: input.city || null,
      phone: input.phone || null,
    });

    if (error && error.code !== "23505") {
      throw new ValidationError(`Failed to join waitlist: ${error.message}`);
    }

    return { message: "You have reserved your spot on the waitlist!" };
  }

  static async trackPageView(input: {
    path: string;
    referrer?: string;
    user_agent?: string;
  }) {
    const admin = getSupabaseAdminClient();
    await admin.from("page_views").insert({
      path: input.path,
      referrer: input.referrer || null,
      user_agent: input.user_agent || null,
    });

    return { ok: true };
  }
}

