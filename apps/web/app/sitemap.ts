import type { MetadataRoute } from "next";
import { createClient } from "@genz/database";
import { SITE_URL } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const supabase = await createClient();

    // Fetch verified sellers
    const { data: sellers } = await supabase
      .from("seller_profiles")
      .select("id, updated_at")
      .eq("status", "verified")
      .limit(100);

    const sellerUrls: MetadataRoute.Sitemap = (sellers || []).map((m) => ({
      url: `${baseUrl}/sellers/${m.id}`,
      lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Fetch active products
    const { data: products } = await supabase
      .from("products")
      .select("id, updated_at")
      .limit(200);

    const productUrls: MetadataRoute.Sitemap = (products || []).map((p) => ({
      url: `${baseUrl}/products/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticPages, ...sellerUrls, ...productUrls];
  } catch (error) {
    console.error("Failed to generate sitemap URLs:", error);
    return staticPages;
  }
}
