import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Film } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/lib/require-role";
import { ReelUploader } from "@/features/reels/components/reel-uploader";
import { ReelManageList } from "@/features/reels/components/reel-manage-list";

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
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Header and Back Link Row */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E5E5E0] bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Breadcrumb Hierarchy */}
          <div className="mb-1 flex items-center gap-1.5 text-xs text-[#52524E]">
            <Link
              href={`/dashboard/products/${id}`}
              className="inline-flex items-center gap-1 font-medium transition-colors hover:text-[#1A1A18]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to listing</span>
            </Link>
            <ChevronRight className="h-3 w-3 opacity-40" />
            <span className="max-w-[200px] truncate font-semibold text-[#1A1A18] sm:max-w-xs">
              {product.name}
            </span>
            <ChevronRight className="h-3 w-3 opacity-40" />
            <span className="text-[#52524E]">Video reels</span>
          </div>

          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-[#C89D32]" />
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A18] sm:text-2xl">
              {product.name} Reels
            </h1>
          </div>
          <p className="mt-1 text-xs text-[#52524E]">
            Showcase your workshop production line, craftsmanship, and artisan lineage.
            Buyers watch these short reels to verify authentic handmade quality.
          </p>
        </div>

        <Link
          href={`/dashboard/products/${id}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-white px-3.5 text-xs font-semibold text-[#1A1A18] shadow-xs transition-colors hover:bg-[#FAF8F4]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Product details</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upload Reel Container (Left 1 col) */}
        <div className="rounded-xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-7">
          <div className="mb-4 flex items-center gap-2 border-b border-[#E5E5E0] pb-3">
            <span className="rounded-md border border-[#E5E5E0] bg-[#FAF8F4] px-2 py-0.5 font-mono text-xs font-bold text-[#1A1A18]">
              01
            </span>
            <h3 className="text-xs font-bold tracking-wide text-[#1A1A18] uppercase">
              Upload Video Reel
            </h3>
          </div>
          <ReelUploader productId={id} sellerId={session.userId} />
        </div>

        {/* Uploaded Reels Stream (Right 2 cols) */}
        <div className="rounded-xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-7 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 border-b border-[#E5E5E0] pb-3">
            <span className="rounded-md border border-[#E5E5E0] bg-[#FAF8F4] px-2 py-0.5 font-mono text-xs font-bold text-[#1A1A18]">
              02
            </span>
            <h3 className="text-xs font-bold tracking-wide text-[#1A1A18] uppercase">
              Portfolio Stream ({reels?.length ?? 0})
            </h3>
          </div>
          <ReelManageList reels={reels ?? []} />
        </div>
      </div>
    </div>
  );
}
