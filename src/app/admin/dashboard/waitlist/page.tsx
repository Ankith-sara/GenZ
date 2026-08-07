import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { UserCheck } from "lucide-react";

export default async function AdminWaitlistPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: waitlist } = await supabase
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  const list = waitlist ?? [];

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Early Access Waitlist Directory"
        description="Prospective buyer and seller leads captured from the pre-launch landing page."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Waitlist Leads" },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="h-7 w-7 text-[#73736E]" />}
          title="No Waitlist Signups"
          description="No lead submissions recorded on the landing page yet."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E5E5E0] bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="font-graphik w-full text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-[#E5E5E0] bg-[#FAF8F4] text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
                <tr>
                  <th className="p-3.5 pl-4">Lead Name</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">City / Region</th>
                  <th className="p-3.5">Desired Platform Role</th>
                  <th className="p-3.5">Captured Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC] bg-white">
                {list.map((w) => (
                  <tr
                    key={w.id}
                    className="h-14 transition-colors hover:bg-[#FAF7F0]/80"
                  >
                    <td className="p-3.5 pl-4 font-bold text-[#1A1A18]">{w.name}</td>
                    <td className="p-3.5 font-mono text-xs text-[#52524E]">
                      {w.email}
                    </td>
                    <td className="p-3.5 text-[#52524E]">{w.city || "India"}</td>
                    <td className="p-3.5">
                      <StatusBadge
                        status={w.role === "seller" ? "processing" : "active"}
                        label={w.role || "buyer"}
                      />
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#73736E]">
                      {w.created_at
                        ? new Date(w.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "2026"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
