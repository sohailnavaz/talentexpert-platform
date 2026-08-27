import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal", "/portal/", "/admin", "/admin/", "/trainer", "/trainer/", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
