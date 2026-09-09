import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ArrowRight,
  BadgeCheck,
  Lock,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@genz/ui";
import { createAdminClient } from "@genz/database/admin";
import { HomepageProducts } from "@/features/home/components/homepage-products";
import {
  SuggestedSellers,
  type SuggestedSeller,
} from "@/features/home/components/suggested-sellers";
import { productMediaUrl } from "@/features/products/lib/products";
import type { Product } from "@genz/types";

interface DbSeller {
  id: string;
  business_name: string;
  city?: string | null;
  state?: string | null;
  description?: string | null;
  established_year?: number | null;
}

const homepageCategories = [
  {
    name: "Etikoppaka Wooden Toys",
    href: "/discover?category=Etikoppaka Wooden Toys",
    image: "/etikoppaka_toys.png",
    count: "GI-Certified Cluster",
    desc: "Authentic non-toxic lacquer hand-turned wooden toys from Andhra Pradesh.",
  },
  {
    name: "Kondapalli Toys",
    href: "/discover?category=Kondapalli Toys",
    image: "/cat_kondapalli.jpg",
    count: "GI Heritage Craft",
    desc: "Lightweight Tella Poniki wood toys depicting Indian folklore and village life.",
  },
  {
    name: "Wooden Toys & Crafts",
    href: "/discover?category=Wooden Toys & Crafts",
    image: "/cat_toys.png",
    count: "150+ Verified Products",
    desc: "Eco-friendly, non-toxic traditional Indian toys & STEM blocks.",
  },
  {
    name: "Home & Furniture",
    href: "/discover?category=Home & Furniture",
    image: "/cat_furniture.png",
    count: "180+ Verified Products",
    desc: "Solid wood furniture, handcrafted decor & living items.",
  },
  {
    name: "Brass & Metal Crafts",
    href: "/discover?category=Brass & Metal Crafts",
    image: "/cat_brass.jpg",
    count: "Ancient Dhokra Castings",
    desc: "Heritage brass diyas, temple bells, engraved metalware & master statues.",
  },
  {
    name: "Terracotta & Pottery",
    href: "/discover?category=Terracotta & Pottery",
    image: "/cat_pottery.jpg",
    count: "Earthen Clay Guilds",
    desc: "Hand-thrown terracotta pottery, festive clay diyas and studio ceramics.",
  },
  {
    name: "Handloom & Textiles",
    href: "/discover?category=Handloom & Textiles",
    image: "/cat_handloom.jpg",
    count: "Authentic Weaves",
    desc: "Natural indigo Kalamkari, Ikat weaves & artisanal handblock fabrics.",
  },
  {
    name: "Kitchen & Dining",
    href: "/discover?category=Kitchen & Dining",
    image: "/cat_kitchen.png",
    count: "120+ Heritage Utensils",
    desc: "Traditional bronze utensils, soapstone cookware & seasoned artisan cast ware.",
  },
];

export default async function HomePage() {
  let products: Product[] = [];
  let dbSellers: DbSeller[] = [];
  const sellerMap: Record<
    string,
    { business_name?: string; city?: string; state?: string }
  > = {};

  try {
    const adminSupabase = createAdminClient();

    const { data: pData } = await adminSupabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(12);

    if (pData) products = pData as Product[];

    // Fetch all signed up sellers directly
    const { data: sData } = await adminSupabase
      .from("seller_profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);

    if (sData) {
      dbSellers = sData as DbSeller[];
      for (const s of sData) {
        let name = s.business_name;
        if (
          s.description &&
          typeof s.description === "string" &&
          s.description.startsWith("{")
        ) {
          try {
            const meta = JSON.parse(s.description);
            name =
              (meta.business_name as string) || (meta.owner_name as string) || name;
          } catch {}
        }
        sellerMap[s.id] = {
          business_name: name,
          city: s.city || undefined,
          state: s.state || undefined,
        };
      }

      // Fetch real published products for all registered sellers
      const sellerIds = sData.map((s) => s.id);
      if (sellerIds.length > 0) {
        const { data: prodData } = await adminSupabase
          .from("products")
          .select("*")
          .in("seller_id", sellerIds)
          .eq("status", "published");
        if (prodData) {
          // Merge or supplement
          const existingIds = new Set(products.map((p) => p.id));
          for (const p of prodData) {
            if (!existingIds.has(p.id)) {
              products.push(p as Product);
            }
          }
        }
      }
    }
  } catch {
    // Graceful fallback if database connection is pending
  }

  const liveSellersMapped: SuggestedSeller[] = dbSellers.map((s, idx) => {
    let meta: Record<string, unknown> = {};
    if (
      s.description &&
      typeof s.description === "string" &&
      s.description.startsWith("{")
    ) {
      try {
        meta = JSON.parse(s.description);
      } catch {
        // use empty
      }
    }

    const businessName =
      (meta.business_name as string) || s.business_name || "Indian Artisan Workshop";

    const makerName =
      (meta.owner_name as string) ||
      (meta.maker_name as string) ||
      (s.business_name !== businessName ? s.business_name : undefined);

    // Find actual published products for this seller
    const sellerProds = products.filter((p) => p.seller_id === s.id);
    const realThumbnails = sellerProds
      .map((p) => productMediaUrl(p.cover_image_path))
      .filter(Boolean) as string[];

    const craft =
      (meta.craft_title as string) ||
      (meta.craft_category as string) ||
      (sellerProds[0]?.category
        ? `${sellerProds[0].category} Workshop`
        : "Direct Indian Workshop");

    const avatars = [
      "/indian_craftsman.png",
      "/sellers.png",
      "/creators.png",
      "/machine_work.png",
    ];

    return {
      id: s.id,
      business_name: businessName,
      maker_name: makerName,
      craft,
      city: s.city || (meta.city as string) || null,
      state: s.state || (meta.state as string) || null,
      avatar:
        (meta.avatar_url as string) || avatars[idx % avatars.length] || "/sellers.png",
      established_year:
        s.established_year ||
        (meta.established_year ? Number(meta.established_year) : null),
      thumbnails: realThumbnails,
      products_count: sellerProds.length,
      description:
        (meta.short_bio as string) ||
        (meta.description as string) ||
        s.description ||
        null,
      products: sellerProds.map((p) => ({
        id: p.id,
        name: p.name,
        price_inr: p.price_inr,
        category: p.category,
        cover_image_path: p.cover_image_path,
      })),
    };
  });

  const displaySellers: SuggestedSeller[] =
    liveSellersMapped.length > 0
      ? liveSellersMapped
      : [
          {
            id: "etikoppaka-lacquer-crafts",
            business_name: "Etikoppaka Heritage Lacquer Toys",
            maker_name: "Polumuri Nageswara Rao",
            craft: "Second-Generation Master Artisan & GI Craft Custodian",
            city: "Etikoppaka",
            state: "Andhra Pradesh",
            avatar: "/indian_craftsman.png",
            established_year: 1984,
            thumbnails: ["/etikoppaka_toys.png"],
            products_count: 5,
            description:
              "Born in Etikoppaka. Shaped by generations. Along the Varaha River in Andhra Pradesh, second-generation artisan Polumuri Nageswara Rao carries forward 400-year-old GI-certified turned-wood lacquer craft.",
          },
        ];

  return (
    <main className="bg-cream-paper text-ink-black flex-1 font-sans antialiased">
      <section className="relative w-full overflow-hidden border-b border-[#E5E5E0] bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-6 py-14 sm:px-12 sm:py-18 lg:grid-cols-12 lg:gap-12 lg:py-24">
          <div className="flex flex-col justify-center gap-6 lg:col-span-5">
            <div className="inline-flex items-center gap-2">
              <span className="font-graphik text-xs font-semibold tracking-[0.25em] text-[#73736E] uppercase">
                MADE IN INDIA
              </span>
            </div>

            <h1 className="font-nantes text-4xl leading-[1.08] font-normal tracking-tight text-[#1A1A18] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]">
              From import
              <br />
              dependency to{" "}
              <span className="relative inline-block font-medium text-[#D4A017] italic">
                opportunity
                <svg
                  className="text-brand-yellow-dark absolute -bottom-2 left-0 h-2.5 w-full opacity-90"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <rect width="100" height="8" fill="currentColor" />
                </svg>
              </span>
              .
            </h1>

            <p className="font-graphik max-w-lg text-base leading-relaxed text-[#52524E]">
              Everything Made in India. One Trusted Platform. Discover authentic Indian
              products, innovative technologies, startups, artisans, and brands—all in
              one marketplace.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="font-graphik h-12 rounded-lg border-none bg-[#FACC15] px-7 text-xs font-bold tracking-wide text-black transition-all duration-200 hover:bg-[#EAB308] hover:shadow-md active:scale-[0.98]"
              >
                <Link href="/discover" className="flex items-center gap-2">
                  <span>Explore India</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="font-graphik h-12 rounded-lg border border-[#1A1A18] bg-white px-7 text-xs font-bold tracking-wide text-[#1A1A18] transition-all duration-200 hover:bg-[#1A1A18] hover:text-white hover:shadow-md active:scale-[0.98]"
              >
                <Link href="/seller/signup">Sell on GenZ</Link>
              </Button>
            </div>

            {/* Trust Badges Strip — Golden ratio divider & layout */}
            <div className="font-graphik mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-neutral-100 pt-4 text-xs text-[#52524E]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#D4A017]" /> 100% Made in India
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <BadgeCheck className="h-4 w-4 text-[#D4A017]" /> Factory Verified
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-[#D4A017]" /> GST Verified
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="h-4 w-4 text-[#D4A017]" /> Secure Payments
              </span>
            </div>
          </div>

          {/* Right Hero Image Column — 7 cols (~58.3% width, Golden Ratio major section) */}
          <div className="relative flex items-center justify-center lg:col-span-7">
            {/* Ambient Backlight Aura */}
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-full bg-amber-400/15 opacity-70 blur-3xl" />

            {/* Golden Ratio Aspect Box: 1.618 : 1 */}
            <div className="relative aspect-[1.618/1] w-full max-w-4xl p-2">
              <Image
                src="/hero_background.png"
                alt="GenZ Made in India products exploding from laptop screen"
                fill
                priority
                className="object-contain object-center drop-shadow-xl"
                sizes="(max-width: 1024px) 100vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DEDICATED SECTION: EXPLORE BY CATEGORIES (Now featuring Etikoppaka Wooden Toys) */}
      <section
        id="categories"
        className="border-ash border-b bg-[#FAF7F0] px-6 py-20 sm:px-12 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="tag mb-3 inline-block rounded-full border border-neutral-300/80 bg-white px-4 py-1.5 shadow-2xs">
                <span className="font-graphik text-xs font-bold tracking-[0.2em] text-amber-700 uppercase">
                  Browse Marketplace
                </span>
              </div>
              <h2 className="font-nantes text-ink-black text-4xl font-normal sm:text-5xl">
                Explore by Categories
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="font-graphik rounded-full border-black px-6 text-xs font-bold text-black transition-all duration-300 hover:bg-black hover:text-white"
            >
              <Link href="/discover" className="flex items-center gap-2">
                <span>View Full Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {homepageCategories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white p-3.5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-black/20 hover:shadow-xl sm:rounded-3xl sm:p-5"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100 sm:rounded-2xl">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>

                  <div className="mt-3 space-y-1 sm:mt-4 sm:space-y-1.5">
                    <h3 className="font-nantes line-clamp-1 text-base font-bold tracking-tight text-[#1A1A18] transition-colors group-hover:text-amber-600 sm:line-clamp-none sm:text-2xl">
                      {cat.name}
                    </h3>
                    {cat.desc && (
                      <p className="font-graphik line-clamp-2 text-[11px] leading-relaxed text-neutral-600 sm:text-xs">
                        {cat.desc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="font-graphik mt-3.5 flex items-center justify-between border-t border-[#F0F0EC] pt-2.5 text-[11px] font-bold text-[#1A1A18] sm:mt-5 sm:pt-3.5 sm:text-xs">
                  <span className="truncate pr-2 text-[10px] text-neutral-500 tabular-nums transition-colors group-hover:text-amber-800 sm:text-xs">
                    {cat.count}
                  </span>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E5E5E0] bg-[#FAF8F4] transition-all duration-300 group-hover:border-black group-hover:bg-black group-hover:text-white sm:h-8 sm:w-8">
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS SHOWCASE (Directly on Homepage) */}
      <HomepageProducts initialProducts={products} sellerMap={sellerMap} />

      {/* SUGGESTED INDIAN MAKERS & ARTISANS (Instagram-Style Cards) */}
      <SuggestedSellers sellers={displaySellers} />

      {/* TRUST MARQUEE & INSTITUTIONAL VALIDATION */}
      <section className="border-ash border-b bg-[#FAF7F0] px-6 py-20 sm:px-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
          <div className="text-brand-yellow-dark flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
            ))}
          </div>

          <blockquote className="font-nantes text-ink-black text-2xl leading-snug italic sm:text-3xl">
            &ldquo;GenZ is not just a commercial platform, it&apos;s a movement to bring
            our manufacturing roots back to life.&rdquo;
          </blockquote>

          <div className="flex items-center gap-3">
            <div className="text-left">
              <h4 className="font-graphik text-ink-black text-sm font-bold">
                Appala Sairam
              </h4>
              <p className="font-graphik text-smoke text-xs">Founder, GenZ</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-6 rounded-3xl border border-neutral-300/80 bg-white p-6 shadow-xs sm:mt-14 sm:flex-row sm:gap-8 sm:px-8 sm:py-6">
          <span className="font-graphik shrink-0 text-center text-xs font-bold tracking-[0.25em] text-neutral-500 uppercase sm:text-left">
            Institutional validation
          </span>
          <div className="grid w-full grid-cols-2 items-center justify-center gap-6 sm:flex sm:w-auto sm:flex-1 sm:flex-wrap sm:justify-end sm:gap-8 lg:gap-10">
            <div className="relative mx-auto h-10 w-24 shrink-0 opacity-90 transition-opacity hover:opacity-100 sm:mx-0 sm:h-12 sm:w-28">
              <Image
                src="/sidbi_logo.png"
                alt="SIDBI"
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 640px) 96px, 112px"
              />
            </div>
            <div className="relative mx-auto h-10 w-24 shrink-0 opacity-90 transition-opacity hover:opacity-100 sm:mx-0 sm:h-12 sm:w-28">
              <Image
                src="/nsic_logo.png"
                alt="NSIC"
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 640px) 96px, 112px"
              />
            </div>
            <div className="relative mx-auto h-10 w-20 shrink-0 opacity-90 transition-opacity hover:opacity-100 sm:mx-0 sm:h-12 sm:w-24">
              <Image
                src="/dpiit_logo.png"
                alt="DPIIT"
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 640px) 80px, 96px"
              />
            </div>
            <div className="relative mx-auto h-12 w-28 shrink-0 opacity-90 transition-opacity hover:opacity-100 sm:mx-0 sm:h-14 sm:w-36">
              <Image
                src="/make_in_india.png"
                alt="Make in India"
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 640px) 112px, 144px"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
