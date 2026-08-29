import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

const DEFAULT_OG_IMAGE = `${siteConfig.url}/brand/logo-full.png`;

export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex,
  article,
  imageIsItemSpecific,
}: {
  title: string;
  description?: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  article?: { publishedTime?: string; modifiedTime?: string; authors?: string[] };
  /**
   * Set when `image` (if any) is the item's own photo/thumbnail rather than
   * the site default — the square default logo doesn't fit Twitter's large-
   * image ratio, so pages without a real item image get the smaller "summary"
   * card instead of "summary_large_image".
   */
  imageIsItemSpecific?: boolean;
}): Metadata {
  const url = `${siteConfig.url}${path}`;
  const desc = description ?? siteConfig.description;
  const images = [image ?? DEFAULT_OG_IMAGE];

  return {
    title,
    description: desc,
    alternates: { canonical: path },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: article
      ? { type: "article", title, description: desc, url, siteName: siteConfig.name, images, ...article }
      : { type: "website", title, description: desc, url, siteName: siteConfig.name, images },
    twitter: {
      card: imageIsItemSpecific ? (image ? "summary_large_image" : "summary") : "summary_large_image",
      title,
      description: desc,
      images,
    },
  };
}
