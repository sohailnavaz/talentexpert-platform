import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /admin, /portal and /trainer are deliberately NOT listed here — a public
      // disallow list just advertises exactly which paths are worth probing.
      // They're kept out of search results via a noindex meta tag on each
      // instead, which doesn't require broadcasting the path to do it.
      disallow: ["/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
