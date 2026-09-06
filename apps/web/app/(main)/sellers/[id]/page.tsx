import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@genz/database/admin";
import {
  SellerStoryProfile,
  type SellerProfileData,
  type SellerReel,
} from "@/features/seller/components/seller-story-profile";
import type { Product } from "@genz/types";

// Curated artisan profiles for featured craft clusters
const CURATED_ARTISANS: Record<string, SellerProfileData> = {
  "etikoppaka-lacquer-crafts": {
    id: "etikoppaka-lacquer-crafts",
    business_name: "Etikoppaka Heritage Lacquer Toys",
    maker_name: "Rameshwar Rao & Family",
    craft_title: "National Awardee & GI-Tag Craft Custodian",
    city: "Etikoppaka",
    state: "Andhra Pradesh",
    established_year: 1984,
    avatar_url: "/indian_craftsman.png",
    description:
      "Preserving the 400-year-old tradition of hand-turned Ankudu softwood toys finished with edible, natural vegetable-dyed lacquer. Chemical-free, non-toxic, and safe for infants.",
  },
  "kondapalli-artisan-guild": {
    id: "kondapalli-artisan-guild",
    business_name: "Kondapalli Toy Guild",
    maker_name: "Satyanarayana Sharma",
    craft_title: "Master Tella Poniki Carver",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    established_year: 1996,
    avatar_url: "/sellers.png",
    description:
      "Crafting world-famous Kondapalli Bommalu from light Tella Poniki wood and tamarind seed paste. Specializing in mythological figures and rural Indian dioramas.",
  },
  "varanasi-handloom-weavers": {
    id: "varanasi-handloom-weavers",
    business_name: "Kashi Resham Silk Guild",
    maker_name: "Abdul Qadir Ansari",
    craft_title: "Master Weaver & Zari Artisan",
    city: "Varanasi",
    state: "Uttar Pradesh",
    established_year: 1972,
    avatar_url: "/creators.png",
    description:
      "Generations of handloom mastery weaving authentic Banarasi Katan silk, gold zari brocades, and organic khadi apparel directly from the ghats of Kashi.",
  },
  "saharanpur-woodcrafts": {
    id: "saharanpur-woodcrafts",
    business_name: "Saharanpur Wood Carvers",
    maker_name: "Mohammad Irfan & Sons",
    craft_title: "Master Sheesham Wood Carver",
    city: "Saharanpur",
    state: "Uttar Pradesh",
    established_year: 2001,
    avatar_url: "/machine_work.png",
    description:
      "Exquisite fretwork (Jali) and relief carving on sustainably sourced Sheesham and mango wood furniture, partitions, and artistic home decor.",
  },
};

interface ParsedSellerMeta {
  short_bio?: string;
  maker_name?: string;
  handle?: string;
  craft_category?: string;
  craft_title?: string;
  how_it_started?: string;
  materials_and_technique?: string;
  vision?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  avatar_url?: string;
  established_year?: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  if (CURATED_ARTISANS[id]) {
    const a = CURATED_ARTISANS[id];
    return {
      title: `${a.business_name} — Indian Artisan Profile | GenZ`,
      description: a.description ?? `Explore handcrafted creations from ${a.business_name}.`,
    };
  }

  try {
    const supabase = createAdminClient();
    const { data: seller } = await supabase
      .from("seller_profiles")
      .select("business_name, city, state, description")
      .eq("id", id)
      .maybeSingle();

    if (!seller) return { title: "Seller Not Found — GenZ" };

    const locationStr = [seller.city, seller.state].filter(Boolean).join(", ");

    let desc = seller.description || "";
    if (desc.startsWith("{")) {
      try {
        const meta = JSON.parse(desc);
        desc = meta.short_bio || meta.description || "";
      } catch {
        // use raw
      }
    }

    return {
      title: `${seller.business_name} — Verified Indian Maker | GenZ`,
      description:
        desc ||
        `Explore artisan products and workshop craft information from ${seller.business_name}${
          locationStr ? ` in ${locationStr}` : ""
        }. Verified maker on GenZ.`,
    };
  } catch {
    return { title: "Artisan Profile — GenZ" };
  }
}

export default async function SellerPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let sellerProfile: SellerProfileData | null = null;
  let products: Product[] = [];
  let reels: SellerReel[] = [];

  try {
    const adminSupabase = createAdminClient();

    // 1. Fetch seller profile from seller_profiles (supports all registered sellers)
    const { data: dbSeller } = await adminSupabase
      .from("seller_profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (dbSeller) {
      // Also fetch user avatar from profiles table
      const { data: userProfile } = await adminSupabase
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", id)
        .maybeSingle();

      // Parse JSON description if it was saved by Profile Studio
      let meta: ParsedSellerMeta = {};
      let plainBio = dbSeller.description || "";
      if (dbSeller.description && dbSeller.description.startsWith("{")) {
        try {
          meta = JSON.parse(dbSeller.description);
          plainBio = meta.short_bio || "";
        } catch {
          plainBio = dbSeller.description;
        }
      }

      const makerName = meta.maker_name || userProfile?.full_name || dbSeller.business_name;
      const craftTitle = meta.craft_title || meta.craft_category || "Verified Indian Manufacturer & Artisan";
      const locationCity = dbSeller.city || "India";
      const locationState = dbSeller.state || "";

      sellerProfile = {
        id: dbSeller.id,
        business_name: dbSeller.business_name,
        maker_name: makerName,
        craft_title: craftTitle,
        city: locationCity,
        state: locationState,
        description:
          plainBio ||
          `${dbSeller.business_name} is an authentic Indian manufacturing and craft studio operating out of ${locationCity}, producing high-quality verified goods with direct provenance.`,
        established_year: dbSeller.established_year || (meta.established_year ? Number(meta.established_year) : 2018),
        avatar_url: userProfile?.avatar_url || meta.avatar_url || "/indian_craftsman.png",
        story: {
          how_it_started:
            meta.how_it_started ||
            `Our journey began with a clear mission: to build dependable, authentic Indian products directly from the workshop floor. Over the years, we have refined our manufacturing process, combining regional craft traditions with modern quality standards.`,
          generations_heritage:
            meta.materials_and_technique ||
            `Operating from ${locationCity}, our team is dedicated to ethical manufacturing, sourcing regional materials responsibly, and delivering uncompromised quality without middleman markups.`,
          materials_and_technique:
            meta.materials_and_technique ||
            `Every item is crafted with rigorous quality checks, utilizing sustainable materials and verified Indian supply chains.`,
          vision:
            meta.vision ||
            `To make Indian manufacturing a globally respected benchmark of reliability, craft pride, and direct-to-consumer value.`,
          milestones: [
            {
              year: dbSeller.established_year ? `${dbSeller.established_year}` : "2018",
              title: "Workshop Established",
              desc: `Founded operations in ${locationCity} focusing on dedicated craftsmanship.`,
            },
            {
              year: "2024",
              title: "Digital Verification on GenZ",
              desc: "Joined GenZ marketplace with GST audit and direct factory discovery.",
            },
          ],
        },
      };

      // 2. Fetch live products from database
      const { data: dbProducts } = await adminSupabase
        .from("products")
        .select("*")
        .eq("seller_id", id)
        .order("created_at", { ascending: false });

      if (dbProducts && dbProducts.length > 0) {
        products = dbProducts as Product[];
      }

      // 3. Fetch live reels from database
      const { data: dbReels } = await adminSupabase
        .from("reels")
        .select("*")
        .eq("seller_id", id)
        .order("created_at", { ascending: false });

      if (dbReels && dbReels.length > 0) {
        reels = dbReels as SellerReel[];
      }
    }
  } catch (err) {
    console.error("[SellerPublicProfilePage] Error querying seller:", err);
  }

  // Fallback to curated mock profiles if ID matches
  if (!sellerProfile && CURATED_ARTISANS[id]) {
    sellerProfile = CURATED_ARTISANS[id];

    if (id === "etikoppaka-lacquer-crafts") {
      products = [
        {
          id: "etikoppaka-top-set",
          seller_id: id,
          name: "GI-Certified Etikoppaka Lacquer Spinning Tops (Set of 4)",
          category: "Wooden Toys",
          price_inr: 650,
          description: "Turned wood with natural vegetable dyes and palm lac finish.",
          status: "published",
          cover_image_path: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as unknown as Product,
        {
          id: "etikoppaka-stacker",
          seller_id: id,
          name: "Ankudu Wood Eco Stacking Toy",
          category: "Wooden Toys",
          price_inr: 520,
          description: "Safe for toddlers, polished with natural lac.",
          status: "published",
          cover_image_path: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as unknown as Product,
        {
          id: "etikoppaka-bird-whistle",
          seller_id: id,
          name: "Traditional Handcrafted Wooden Bird Whistle",
          category: "Wooden Toys",
          price_inr: 340,
          description: "Charming traditional acoustic bird whistle toy.",
          status: "published",
          cover_image_path: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as unknown as Product,
      ];
    }
  }

  if (!sellerProfile) {
    notFound();
  }

  const sellerJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: sellerProfile.business_name,
    description:
      sellerProfile.description ||
      `Verified Indian maker profile for ${sellerProfile.business_name}.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: sellerProfile.city || undefined,
      addressRegion: sellerProfile.state || undefined,
      addressCountry: "IN",
    },
  };

  return (
    <main className="bg-[#FAF8F5] text-[#1A1A18] flex-1 font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sellerJsonLd) }}
      />
      <SellerStoryProfile
        seller={sellerProfile}
        products={products}
        reels={reels}
      />
    </main>
  );
}
