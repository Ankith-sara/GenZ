import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/lib/require-role";
import { InquiriesClient } from "./inquiries-client";

export default async function AdminInquiriesPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return <InquiriesClient initialInquiries={inquiries ?? []} />;
}
