import Link from "next/link";
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
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-12">
          <Link href="/" className="text-lg tracking-[0.22em] uppercase">
            GenZ
          </Link>
          <Link href="/discover" className="text-sm hover:underline">
            Discover
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12">
          <VerifiedBadge />
          <h1 className="mt-4 text-4xl leading-[1.2]">{manufacturer.business_name}</h1>
          {(manufacturer.city || manufacturer.state) && (
            <p className="text-muted-foreground mt-2">
              {[manufacturer.city, manufacturer.state].filter(Boolean).join(", ")}
              {manufacturer.established_year
                ? ` · Est. ${manufacturer.established_year}`
                : ""}
            </p>
          )}
          {manufacturer.description && (
            <p className="text-muted-foreground mt-6 max-w-2xl whitespace-pre-line">
              {manufacturer.description}
            </p>
          )}

          <h2 className="mt-12 mb-6 text-2xl leading-[1.27]">
            Products from {manufacturer.business_name}
          </h2>
          {(products ?? []).length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No published products yet — check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {(products ?? []).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-dark-band text-dark-band-foreground/70 py-10">
        <div className="mx-auto max-w-6xl px-6 text-sm sm:px-12">
          © 2026 GenZ. Made in India, for India — and the world.
        </div>
      </footer>
    </div>
  );
}
