import Link from "next/link";
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
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-12">
      <Link
        href="/dashboard/manufacturer"
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-3xl leading-[1.27]">Inquiries</h1>
      <p className="text-muted-foreground mt-2 max-w-xl">
        Questions buyers have sent about your products.
      </p>

      {!inquiries || inquiries.length === 0 ? (
        <p className="text-muted-foreground mt-10 text-sm">No inquiries yet.</p>
      ) : (
        <ul className="divide-border border-border bg-card mt-8 divide-y rounded-[4px] border">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {inquiry.name}{" "}
                    <span className="text-muted-foreground font-normal">
                      · {inquiry.email}
                      {inquiry.phone ? ` · ${inquiry.phone}` : ""}
                    </span>
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    About: {productNameById.get(inquiry.product_id) ?? "a product"} ·{" "}
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </p>
                </div>
                <InquiryStatusSelect inquiryId={inquiry.id} status={inquiry.status} />
              </div>
              <p className="mt-3 text-sm whitespace-pre-line">{inquiry.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
