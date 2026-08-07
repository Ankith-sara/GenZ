import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { ReelUploader } from "@/components/reel-uploader";
import { ReelManageList } from "@/components/reel-manage-list";

export default async function SellerProductReelsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("seller");
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", id)
    .eq("seller_id", session.userId)
    .maybeSingle();

  if (!product) notFound();

  const { data: reels } = await supabase
    .from("reels")
    .select("*")
    .eq("product_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header and Back Link Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-nantes text-3xl font-bold text-[#1A1A18]">
            {product.name} Reels
          </h1>
          <p className="font-graphik mt-1 text-xs text-[#73736E]">
            Showcase your raw production line, machinery, and craftsmanship. Buyers view
            these short videos to audit quality.
          </p>
        </div>
        <Link
          href={`/dashboard/seller/products/${id}`}
          className="font-graphik flex items-center gap-1.5 text-xs font-semibold text-[#52524E] hover:text-black sm:order-first"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Product Details</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upload Reel Container (Left 1 col) */}
        <div className="rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
          <h3 className="font-graphik mb-4 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
            Upload Video Reel
          </h3>
          <ReelUploader productId={id} sellerId={session.userId} />
        </div>

        {/* Uploaded Reels Stream (Right 2 cols) */}
        <div className="rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8 lg:col-span-2">
          <h3 className="font-graphik mb-4 text-[11px] font-semibold tracking-wider text-[#8C8C85] uppercase">
            Portfolio Stream
          </h3>
          <ReelManageList reels={reels ?? []} />
        </div>
      </div>
    </div>
  );
}
