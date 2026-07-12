import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";
import { VerifiedBadge } from "@/components/verified-badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: manufacturer } = await supabase
    .from("manufacturer_public_profiles")
    .select("business_name")
    .eq("id", id)
    .maybeSingle();

  if (!manufacturer) return { title: "Manufacturer not found — GenZ" };
  return { title: `${manufacturer.business_name} — GenZ` };
}

export default async function ManufacturerPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: manufacturer } = await supabase
    .from("manufacturer_public_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!manufacturer) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("manufacturer_id", id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 bg-cream-paper font-sans text-ink-black antialiased pb-24">
      <div className="mx-auto max-w-[1280px] px-6 py-16 sm:px-12">
        {/* Manufacturer Header Box */}
        <div className="border-b border-ash pb-10 mb-12">
          <VerifiedBadge className="mb-4 bg-forest-green text-white border-none rounded-none py-1 px-3" />
          <h1 className="font-nantes text-4xl sm:text-5xl text-ink-black tracking-tight leading-[1.1] mt-2">
            {manufacturer.business_name}
          </h1>
          
          {(manufacturer.city || manufacturer.state) && (
            <p className="text-caption font-graphik text-smoke uppercase tracking-wider mt-3">
              {[manufacturer.city, manufacturer.state].filter(Boolean).join(", ")}
              {manufacturer.established_year
                ? ` · Established ${manufacturer.established_year}`
                : ""}
            </p>
          )}

          {manufacturer.description && (
            <p className="text-body font-graphik text-charcoal mt-6 max-w-2xl whitespace-pre-line leading-relaxed">
              {manufacturer.description}
            </p>
          )}
        </div>

        {/* Products Grid Section */}
        <div>
          <h2 className="font-nantes text-2xl sm:text-3xl text-ink-black mb-8">
            Products from {manufacturer.business_name}
          </h2>
          
          {(products ?? []).length === 0 ? (
            <p className="text-caption font-graphik text-smoke italic">
              No published products yet — check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {(products ?? []).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
