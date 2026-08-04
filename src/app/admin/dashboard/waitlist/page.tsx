import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";

export default async function AdminWaitlistPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: waitlist } = await supabase
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="border-ash space-y-6 rounded-3xl border bg-white p-4 shadow-xs sm:p-6">
      <div>
        <h2 className="font-nantes text-ink-black text-xl font-bold sm:text-2xl">
          Early Access Waitlist Signups
        </h2>
        <p className="font-graphik text-smoke text-sm">
          Lead captures from the platform landing page waitlist.
        </p>
      </div>

      {(waitlist ?? []).length === 0 ? (
        <p className="font-graphik text-smoke text-sm">No waitlist entries found.</p>
      ) : (
        <div className="border-ash overflow-x-auto rounded-2xl border">
          <table className="font-graphik w-full text-left text-sm">
            <thead className="border-ash text-smoke border-b bg-[#FAF7F0] text-xs font-semibold tracking-wider uppercase">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">City</th>
                <th className="p-4">Desired Role</th>
              </tr>
            </thead>
            <tbody className="divide-ash/60 divide-y bg-white">
              {(waitlist ?? []).map((w) => (
                <tr key={w.id} className="transition-colors hover:bg-[#FAF7F0]/60">
                  <td className="text-ink-black p-4 font-semibold">{w.name}</td>
                  <td className="p-4 font-mono text-xs">{w.email}</td>
                  <td className="text-smoke p-4">{w.city || "—"}</td>
                  <td className="p-4 capitalize">
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800">
                      {w.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
