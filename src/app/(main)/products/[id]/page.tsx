import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { productMediaUrl, formatInr } from "@/lib/products";
import { VerifiedBadge } from "@/components/verified-badge";
import { ProductWishlistButton } from "@/components/product-wishlist-button";
import { InquiryForm } from "./inquiry-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, cover_image_path, price_inr, category")
    .eq("id", id)
    .maybeSingle();

  if (!product) return { title: "Product Not Found — GenZ" };

  const coverUrl = productMediaUrl(product.cover_image_path);

  return {
    title: `${product.name} — Direct Indian Manufacturer`,
    description:
      product.description ||
      `Buy ${product.name} directly from verified Indian manufacturers on GenZ.`,
    openGraph: {
      title: product.name,
      description:
        product.description ||
        `Buy ${product.name} directly from verified Indian manufacturers on GenZ.`,
      images: coverUrl ? [{ url: coverUrl }] : [],
    },
  };
}

export default async function PublicProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (!product) notFound();

  const { data: manufacturer } = await supabase
    .from("manufacturer_public_profiles")
    .select("business_name, city, state, established_year")
    .eq("id", product.manufacturer_id)
    .maybeSingle();

  const { data: reels } = await supabase
    .from("reels")
    .select("*")
    .eq("product_id", id)
    .order("created_at", { ascending: false });

  const { data: galleryImages } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", id)
    .order("position", { ascending: true });

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("created_at", { ascending: true });

  const coverUrl = productMediaUrl(product.cover_image_path);

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: coverUrl ? [coverUrl] : [],
    description: product.description || `Verified Indian Product: ${product.name}`,
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price_inr,
      availability: "https://schema.org/InStock",
    },
    ...(manufacturer
      ? {
          brand: {
            "@type": "Brand",
            name: manufacturer.business_name,
          },
        }
      : {}),
  };

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:px-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div>
              {coverUrl ? (
                <div className="border-border relative aspect-square w-full overflow-hidden rounded-[4px] border">
                  <Image
                    src={coverUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="border-border text-muted-foreground flex aspect-square w-full items-center justify-center rounded-[4px] border border-dashed text-sm">
                  No image yet
                </div>
              )}

              {(galleryImages ?? []).length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {(galleryImages ?? []).map((image) => {
                    const url = productMediaUrl(image.image_path);
                    return (
                      <div
                        key={image.id}
                        className="border-border relative aspect-square overflow-hidden rounded-[4px] border"
                      >
                        {url && (
                          <Image
                            src={url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground text-sm">{product.category}</p>
                  <VerifiedBadge />
                </div>
                <ProductWishlistButton product={product} />
              </div>
              <h1 className="mt-2 text-4xl leading-[1.2]">{product.name}</h1>
              <p className="mt-3 font-serif text-2xl">{formatInr(product.price_inr)}</p>

              {product.description && (
                <p className="text-muted-foreground mt-6 whitespace-pre-line">
                  {product.description}
                </p>
              )}

              {product.materials.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium">Materials</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {product.materials.join(", ")}
                  </p>
                </div>
              )}

              {(variants ?? []).length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium">Options</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(variants ?? []).map((variant) => (
                      <span
                        key={variant.id}
                        className="border-border rounded-full border px-3 py-1 text-xs"
                      >
                        {variant.variant_name}: {variant.variant_value}
                        {variant.price_inr !== null
                          ? ` · ${formatInr(variant.price_inr)}`
                          : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {manufacturer && (
                <div className="border-border mt-8 rounded-[4px] border p-5">
                  <p className="text-muted-foreground text-xs tracking-[0.12em] uppercase">
                    Who made this
                  </p>
                  <p className="mt-2">
                    <Link
                      href={`/manufacturers/${product.manufacturer_id}`}
                      className="text-foreground font-medium underline underline-offset-2"
                    >
                      {manufacturer.business_name}
                    </Link>
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {[manufacturer.city, manufacturer.state].filter(Boolean).join(", ")}
                    {manufacturer.established_year
                      ? ` · Est. ${manufacturer.established_year}`
                      : ""}
                  </p>
                  <div className="mt-3">
                    <VerifiedBadge />
                  </div>
                </div>
              )}

              <div className="mt-8">
                <InquiryForm
                  productId={product.id}
                  manufacturerId={product.manufacturer_id}
                  productName={product.name}
                />
              </div>
            </div>
          </div>

          {(reels ?? []).length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 text-2xl leading-[1.27]">See it made</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(reels ?? []).map((reel) => {
                  const videoUrl = productMediaUrl(reel.video_path);
                  const thumbUrl = productMediaUrl(reel.thumbnail_path);
                  return (
                    <div key={reel.id}>
                      <div className="border-border aspect-video overflow-hidden rounded-[4px] border bg-black">
                        {videoUrl && (
                          <video
                            src={videoUrl}
                            poster={thumbUrl ?? undefined}
                            controls
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      {reel.caption && (
                        <p className="text-muted-foreground mt-2 text-sm">
                          {reel.caption}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
