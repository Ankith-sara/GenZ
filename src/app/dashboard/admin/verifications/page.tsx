import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL } from "@/lib/verification";
import type { VerificationStatus } from "@/types/database";

const TABS: { value: VerificationStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Changes Requested" },
  { value: "not_submitted", label: "Not Submitted" },
  { value: "all", label: "All" },
];

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const { status: statusParam } = await searchParams;
  const activeTab = (statusParam as VerificationStatus | "all") ?? "pending";

  const supabase = await createClient();

  let query = supabase
    .from("manufacturer_profiles")
    .select("*")
    .order("submitted_at", { ascending: true, nullsFirst: false });

  if (activeTab !== "all") {
    query = query.eq("status", activeTab);
  }

  const { data: manufacturers } = await query;

  // Fetch matching profile rows (name/city) in a second query — simpler
  // and more robust than typed PostgREST embeds for a hand-maintained
  // Database type.
  const ids = (manufacturers ?? []).map((m) => m.id);
  const { data: profiles } =
    ids.length > 0
      ? await supabase.from("profiles").select("*").in("id", ids)
      : { data: [] };
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-12">
      <Link
        href="/dashboard/admin"
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-3xl leading-[1.27]">Manufacturer verifications</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/dashboard/admin/verifications?status=${tab.value}`}
            className={`flex h-11 items-center rounded-full border px-5 text-sm ${
              activeTab === tab.value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground hover:border-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="divide-border border-border bg-card mt-6 divide-y rounded-[4px] border">
        {(manufacturers ?? []).length === 0 && (
          <p className="text-muted-foreground p-6 text-sm">
            No manufacturers in this category.
          </p>
        )}
        {(manufacturers ?? []).map((m) => {
          const profile = profileById.get(m.id);
          return (
            <Link
              key={m.id}
              href={`/dashboard/admin/verifications/${m.id}`}
              className="hover:bg-background flex flex-wrap items-center justify-between gap-3 p-6"
            >
              <div>
                <p className="font-medium">{m.business_name}</p>
                <p className="text-muted-foreground text-sm">
                  {profile?.full_name ?? "—"} · {m.city ?? "—"}
                </p>
              </div>
              <Badge variant={m.status}>{STATUS_LABEL[m.status]}</Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
