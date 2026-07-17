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
    <main className="bg-cream-paper text-ink-black flex-1 pb-24 font-sans antialiased">
      <div className="mx-auto max-w-[1280px] px-6 py-16 sm:px-12">
        {/* Manufacturer Header Box */}
        <div className="border-ash mb-12 border-b pb-10">
          <VerifiedBadge className="bg-brand-yellow mb-4 rounded-none border-none px-3 py-1 text-white" />
          <h1 className="font-nantes text-ink-black mt-2 text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {manufacturer.business_name}
          </h1>

          {(manufacturer.city || manufacturer.state) && (
            <p className="text-caption font-graphik text-smoke mt-3 tracking-wider uppercase">
              {[manufacturer.city, manufacturer.state].filter(Boolean).join(", ")}
              {manufacturer.established_year
                ? ` · Established ${manufacturer.established_year}`
                : ""}
            </p>
          )}

          {manufacturer.description && (
            <p className="text-body font-graphik text-charcoal mt-6 max-w-2xl leading-relaxed whitespace-pre-line">
              {manufacturer.description}
            </p>
          )}
        </div>

        {/* Products Grid Section */}
        <div>
          <h2 className="font-nantes text-ink-black mb-8 text-2xl sm:text-3xl">
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
