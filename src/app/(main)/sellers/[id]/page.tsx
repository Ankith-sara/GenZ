import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/features/products/components/product-card";
import { VerifiedBadge } from "@/components/ui/atoms/verified-badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: seller } = await supabase
    .from("seller_public_profiles")
    .select("business_name, city, state, description")
    .eq("id", id)
    .maybeSingle();

  if (!seller) return { title: "Seller Not Found — GenZ" };

  const locationStr = [seller.city, seller.state].filter(Boolean).join(", ");

  return {
    title: `${seller.business_name} — Verified Indian Seller`,
    description:
      seller.description ||
      `Explore factory products and sourcing information from ${seller.business_name}${
        locationStr ? ` located in ${locationStr}` : ""
      }. Verified seller on GenZ.`,
    openGraph: {
      title: `${seller.business_name} — Verified Indian Seller`,
      description:
        seller.description ||
        `Explore verified Indian manufacturing capabilities from ${seller.business_name}.`,
    },
  };
}

export default async function SellerPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: seller } = await supabase
    .from("seller_public_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!seller) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const sellerJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: seller.business_name,
    description:
      seller.description ||
      `Verified Indian seller profile for ${seller.business_name}.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: seller.city || undefined,
      addressRegion: seller.state || undefined,
      addressCountry: "IN",
    },
  };

  return (
    <main className="bg-cream-paper text-ink-black flex-1 pb-24 font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sellerJsonLd) }}
      />
      <div className="mx-auto max-w-[1280px] px-6 py-16 sm:px-12">
        {/* Seller Header Box */}
        <div className="border-ash mb-12 border-b pb-10">
          <VerifiedBadge className="bg-brand-yellow mb-4 rounded-none border-none px-3 py-1 text-white" />
          <h1 className="font-nantes text-ink-black mt-2 text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {seller.business_name}
          </h1>

          {(seller.city || seller.state) && (
            <p className="text-caption font-graphik text-smoke mt-3 tracking-wider uppercase">
              {[seller.city, seller.state].filter(Boolean).join(", ")}
              {seller.established_year
                ? ` · Established ${seller.established_year}`
                : ""}
            </p>
          )}

          {seller.description && (
            <p className="text-body font-graphik text-charcoal mt-6 max-w-2xl leading-relaxed whitespace-pre-line">
              {seller.description}
            </p>
          )}
        </div>

        {/* Products Grid Section */}
        <div>
          <h2 className="font-nantes text-ink-black mb-8 text-2xl sm:text-3xl">
            Products from {seller.business_name}
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
