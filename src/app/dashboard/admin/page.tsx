import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const session = await requireRole("admin");
  const supabase = await createClient();

  const [{ count: pendingCount }, { count: verifiedCount }, { count: waitlistCount }] =
    await Promise.all([
      supabase
        .from("manufacturer_profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("manufacturer_profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "verified"),
      supabase.from("waitlist").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-12">
      <p className="text-muted-foreground text-sm">Admin Dashboard</p>
      <h1 className="mt-2 text-3xl leading-[1.27]">
        Welcome, {session.profile?.full_name ?? "there"}.
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-border bg-card rounded-[4px] border p-6">
          <p className="text-muted-foreground text-xs">Pending review</p>
          <p className="mt-2 font-serif text-4xl">{pendingCount ?? 0}</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/dashboard/admin/verifications?status=pending">
              Review queue
            </Link>
          </Button>
        </div>
        <div className="border-border bg-card rounded-[4px] border p-6">
          <p className="text-muted-foreground text-xs">Verified manufacturers</p>
          <p className="mt-2 font-serif text-4xl">{verifiedCount ?? 0}</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/dashboard/admin/verifications?status=verified">View all</Link>
          </Button>
        </div>
        <div className="border-border bg-card rounded-[4px] border p-6">
          <p className="text-muted-foreground text-xs">Waitlist signups</p>
          <p className="mt-2 font-serif text-4xl">{waitlistCount ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
