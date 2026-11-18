"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@genz/database";
import { checkRateLimit, logRateLimitAttempt } from "@genz/utils/rate-limiter";
import { profileSchema, addressesSchema } from "@genz/validation";
import { getAuthenticatedApiClient } from "@/lib/api-server-client";

export async function updateProfile(formData: {
  fullName: string;
  phone: string;
  city: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // 1. User rate limit check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "update_profile",
    identifier: user.id,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Input validation
  const validation = profileSchema.safeParse(formData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // 3. Try centralized Fastify API first
  try {
    const client = await getAuthenticatedApiClient();
    await client.customers.updateProfile({
      fullName: validation.data.fullName,
      phone: validation.data.phone,
      city: validation.data.city,
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (apiErr: unknown) {
    console.warn("[UpdateProfile] Fastify API notice, using local database fallback:", apiErr);
  }

  // 4. Local fallback
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: validation.data.fullName,
      phone: validation.data.phone,
      city: validation.data.city,
    })
    .eq("id", user.id);

  // Log rate attempt
  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "update_profile",
    identifier: user.id,
  });

  if (error) {
    console.error("Update profile DB error:", error);
    return { error: "Failed to update profile. Please try again." };
  }

  revalidatePath("/profile");
  return { success: true };
}

interface Address {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export async function saveAddresses(addresses: Address[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // 1. User rate limit check
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "save_addresses",
    identifier: user.id,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Input validation
  const validation = addressesSchema.safeParse(addresses);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // 3. Auth metadata operation via Supabase Auth
  const { error } = await supabase.auth.updateUser({
    data: { addresses: validation.data },
  });

  // Log rate attempt
  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "save_addresses",
    identifier: user.id,
  });

  if (error) {
    console.error("Save addresses auth error:", error);
    return { error: "Failed to save address. Please try again." };
  }

  revalidatePath("/profile");
  revalidatePath("/checkout");
  return { success: true };
}
