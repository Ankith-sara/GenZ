import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { VerificationsSplitClient } from "./verifications-split-client";

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const { status: statusParam } = await searchParams;
  const activeStatus = statusParam || "pending";

  const supabase = await createClient();

  const { data: allApplications } = await supabase
    .from("seller_applications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <VerificationsSplitClient
      initialList={allApplications ?? []}
      initialStatus={activeStatus}
    />
  );
}
