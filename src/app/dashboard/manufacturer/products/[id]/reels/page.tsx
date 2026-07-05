import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { ReelUploader } from "@/components/reel-uploader";
import { ReelManageList } from "@/components/reel-manage-list";

export default async function ManufacturerProductReelsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("manufacturer");
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", id)
    .eq("manufacturer_id", session.userId)
    .maybeSingle();

  if (!product) notFound();

  const { data: reels } = await supabase
    .from("reels")
    .select("*")
    .eq("product_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-12">
      <Link
        href={`/dashboard/manufacturer/products/${id}`}
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to {product.name}
      </Link>
      <h1 className="mt-4 text-3xl leading-[1.27]">Reels</h1>
      <p className="text-muted-foreground mt-2 max-w-xl">
        Show the real production line, machines, and craftsmanship behind {product.name}
        . This is what buyers see before they trust a product.
      </p>

      <div className="mt-8">
        <ReelUploader productId={id} manufacturerId={session.userId} />
      </div>

      <h2 className="mt-10 mb-3 text-lg">Uploaded reels</h2>
      <ReelManageList reels={reels ?? []} />
    </div>
  );
}
