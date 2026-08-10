import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/lib/require-role";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { StatusBadge } from "@/components/ui/atoms/status-badge";
import { EmptyState } from "@/components/ui/organisms/empty-state";
import { Mail } from "lucide-react";

export default async function AdminContactPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: contactMessages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const list = contactMessages ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Form Communications"
        description="Submissions received via the platform Contact Us form."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Contact Messages" },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-7 w-7 text-[#73736E]" />}
          title="No Contact Messages"
          description="No inquiry form submissions received yet."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {list.map((msg) => (
            <div
              key={msg.id}
              className="space-y-3 rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-2xs transition-all hover:border-black/30"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#F0F0EC] pb-3">
                <div>
                  <h4 className="font-graphik text-sm font-bold text-[#1A1A18]">
                    {msg.name}
                  </h4>
                  <p className="font-mono text-xs text-[#73736E]">{msg.email}</p>
                </div>
                {msg.reason && <StatusBadge status="processing" label={msg.reason} />}
              </div>

              <div className="font-graphik rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-3.5 text-xs leading-relaxed text-[#1A1A18]">
                &ldquo;{msg.message}&rdquo;
              </div>

              <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-[#8C8C85]">
                <span>Received ID: #{msg.id.slice(0, 8)}</span>
                <span>
                  {new Date(msg.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
