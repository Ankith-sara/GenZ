import type { MetadataRoute } from "next";
import { SITE_URL } from "@genz/utils";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/auth/", "/login/", "/signup/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
