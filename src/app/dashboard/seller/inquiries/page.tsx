import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { SellerInquiriesClient, SellerInquiryRecord } from "./seller-inquiries-client";

export default async function SellerInquiriesPage() {
  const session = await requireRole("seller");
  const supabase = await createClient();

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .eq("seller_id", session.userId)
    .order("created_at", { ascending: false });

  const productIds = [...new Set((inquiries ?? []).map((i) => i.product_id))];
  const { data: products } =
    productIds.length > 0
      ? await supabase.from("products").select("id, name").in("id", productIds)
      : { data: [] as { id: string; name: string }[] };

  const productNameById = new Map((products ?? []).map((p) => [p.id, p.name]));

  const formattedInquiries: SellerInquiryRecord[] = (inquiries ?? []).map((inq) => ({
    id: inq.id,
    name: inq.name,
    email: inq.email,
    phone: inq.phone,
    message: inq.message,
    product_id: inq.product_id,
    product_name: productNameById.get(inq.product_id) || "Catalog Product",
    status: inq.status,
    created_at: inq.created_at,
  }));

  return <SellerInquiriesClient initialInquiries={formattedInquiries} />;
}
