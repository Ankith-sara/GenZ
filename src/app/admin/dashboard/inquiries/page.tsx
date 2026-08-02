import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { Badge } from "@/components/ui/badge";

export default async function AdminInquiriesPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="border-ash space-y-6 rounded-3xl border bg-white p-6 shadow-xs">
      <div>
        <h2 className="font-nantes text-ink-black text-2xl font-bold">
          Buyer-to-Manufacturer Inquiries Stream
        </h2>
        <p className="font-graphik text-smoke text-sm">
          Direct sourcing messages submitted by buyers across products.
        </p>
      </div>

      {(inquiries ?? []).length === 0 ? (
        <p className="font-graphik text-smoke text-sm">No inquiries submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {(inquiries ?? []).map((inq) => (
            <div
              key={inq.id}
              className="border-ash space-y-3 rounded-2xl border bg-[#FAF7F0] p-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-graphik text-ink-black text-sm font-bold">
                  From: {inq.name} ({inq.email})
                </span>
                <Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">
                  {inq.status}
                </Badge>
              </div>
              <p className="font-graphik text-smoke border-ash rounded-xl border bg-white p-4 text-sm italic">
                &ldquo;{inq.message}&rdquo;
              </p>
              <div className="text-smoke flex items-center justify-between pt-1 font-mono text-xs">
                <span>Product ID: {inq.product_id}</span>
                <span>{new Date(inq.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
