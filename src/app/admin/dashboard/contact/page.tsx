import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { Badge } from "@/components/ui/badge";

export default async function AdminContactPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: contactMessages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="border-ash space-y-6 rounded-3xl border bg-white p-4 shadow-xs sm:p-6">
      <div>
        <h2 className="font-nantes text-ink-black text-xl font-bold sm:text-2xl">
          General Contact Form Submissions
        </h2>
        <p className="font-graphik text-smoke text-sm">
          Submissions received via the website Contact Us page.
        </p>
      </div>

      {(contactMessages ?? []).length === 0 ? (
        <p className="font-graphik text-smoke text-sm">No contact messages received.</p>
      ) : (
        <div className="space-y-4">
          {(contactMessages ?? []).map((msg) => (
            <div
              key={msg.id}
              className="border-ash space-y-3 rounded-2xl border bg-[#FAF7F0] p-4 shadow-xs sm:p-5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="font-graphik text-ink-black block text-sm font-bold">
                    {msg.name}
                  </span>
                  <span className="text-smoke font-mono text-xs break-all">
                    {msg.email}
                  </span>
                </div>
                {msg.reason && (
                  <Badge className="w-fit border-blue-200 bg-blue-100 text-blue-900">
                    {msg.reason}
                  </Badge>
                )}
              </div>
              <p className="font-graphik text-smoke border-ash rounded-xl border bg-white p-4 text-sm italic">
                &ldquo;{msg.message}&rdquo;
              </p>
              <div className="text-smoke flex items-center justify-between pt-1 font-mono text-xs">
                <span>{new Date(msg.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
