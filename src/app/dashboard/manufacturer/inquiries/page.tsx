import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { InquiryStatusSelect } from "./inquiry-status-select";

export default async function ManufacturerInquiriesPage() {
  const session = await requireRole("manufacturer");
  const supabase = await createClient();

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .eq("manufacturer_id", session.userId)
    .order("created_at", { ascending: false });

  const productIds = [...new Set((inquiries ?? []).map((i) => i.product_id))];
  const { data: products } =
    productIds.length > 0
      ? await supabase.from("products").select("id, name").in("id", productIds)
      : { data: [] as { id: string; name: string }[] };

  const productNameById = new Map((products ?? []).map((p) => [p.id, p.name]));

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header and Back Link Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-nantes text-3xl font-bold text-[#1A1A18]">
            Buyer Inquiries
          </h1>
          <p className="font-graphik mt-1 text-xs text-[#73736E]">
            Incoming communications and product inquiries submitted by buyers.
          </p>
        </div>
        <Link
          href="/dashboard/manufacturer"
          className="font-graphik flex items-center gap-1.5 text-xs font-semibold text-[#52524E] hover:text-black sm:order-first"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Inquiries Queue Card */}
      <div className="rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
        <div className="border-b border-[#F0F0EC] pb-5">
          <span className="font-graphik text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
            Inquiry Stream ({inquiries?.length ?? 0})
          </span>
        </div>

        {!inquiries || inquiries.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-graphik text-sm text-[#8C8C85]">
              No buyer inquiries received yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0F0EC]">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-graphik text-sm font-semibold text-black">
                      {inquiry.name}{" "}
                      <span className="text-xs font-normal text-[#73736E]">
                        · {inquiry.email}
                        {inquiry.phone ? ` · ${inquiry.phone}` : ""}
                      </span>
                    </p>
                    <p className="font-graphik mt-0.5 text-xs text-[#73736E]">
                      About:{" "}
                      <span className="font-medium text-black">
                        {productNameById.get(inquiry.product_id) ?? "Product"}
                      </span>{" "}
                      · {new Date(inquiry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <InquiryStatusSelect inquiryId={inquiry.id} status={inquiry.status} />
                </div>
                <p className="font-graphik mt-3 text-sm leading-relaxed whitespace-pre-line text-[#333330]">
                  {inquiry.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
