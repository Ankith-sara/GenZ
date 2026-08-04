import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { Button } from "@/components/ui/button";

export default async function AdminUsersPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const getOnlineState = (dateStr: string | null) => {
    if (!dateStr) return { label: "Offline", color: "bg-neutral-300 text-neutral-600" };
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = (now.getTime() - date.getTime()) / (1000 * 60);
    if (diffMins <= 15)
      return { label: "Online Now", color: "bg-emerald-500 text-white" };
    if (diffMins <= 1440)
      return { label: "Active Today", color: "bg-amber-400 text-amber-950" };
    return { label: "Offline", color: "bg-neutral-300 text-neutral-600" };
  };

  return (
    <div className="border-ash space-y-6 rounded-3xl border bg-white p-4 shadow-xs sm:p-6">
      <div>
        <h2 className="font-nantes text-ink-black text-xl font-bold sm:text-2xl">
          All Logged In Users & Active Sessions
        </h2>
        <p className="font-graphik text-smoke text-sm">
          Complete directory of registered accounts, login timestamps, and session
          status.
        </p>
      </div>

      <div className="border-ash overflow-x-auto rounded-2xl border">
        <table className="font-graphik w-full text-left text-sm">
          <thead className="border-ash text-smoke border-b bg-[#FAF7F0] text-xs font-semibold tracking-wider uppercase">
            <tr>
              <th className="p-4">User Details</th>
              <th className="p-4">Role</th>
              <th className="p-4">Location</th>
              <th className="p-4">Session Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-ash/60 divide-y bg-white">
            {(profiles ?? []).map((user) => {
              const state = getOnlineState(user.last_active_at || user.created_at);
              return (
                <tr key={user.id} className="transition-colors hover:bg-[#FAF7F0]/60">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-yellow/30 font-nantes text-ink-black flex h-9 w-9 items-center justify-center rounded-full font-bold">
                        {(user.full_name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="text-ink-black block font-semibold">
                          {user.full_name || "Anonymous User"}
                        </span>
                        <span className="text-smoke block font-mono text-xs">
                          ID: {user.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 capitalize">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                        user.role === "admin"
                          ? "border-purple-200 bg-purple-100 text-purple-900"
                          : user.role === "manufacturer"
                            ? "border-blue-200 bg-blue-100 text-blue-900"
                            : "border-emerald-200 bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="text-smoke p-4">
                    {user.city
                      ? `${user.city}${user.state ? `, ${user.state}` : ""}`
                      : "India"}
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${state.color}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {state.label}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-ash text-ink-black text-xs hover:bg-[#FAF7F0]"
                    >
                      View Profile
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
