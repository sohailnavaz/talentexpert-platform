import "server-only";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

export type SiteContactInfo = {
  phone: string;
  phoneHref: string;
  whatsappNumber: string;
  email: string;
  address: string;
  socials: { instagram: string; linkedin: string; youtube: string; facebook: string };
};

const CONTENT_KEY = "site-contact-info";

const defaults: SiteContactInfo = {
  phone: siteConfig.phone,
  phoneHref: siteConfig.phoneHref,
  whatsappNumber: siteConfig.whatsappNumber,
  email: siteConfig.email,
  address: siteConfig.address,
  socials: siteConfig.socials,
};

export async function getSiteContactInfo(): Promise<SiteContactInfo> {
  const block = await db.contentBlock.findUnique({ where: { key: CONTENT_KEY } });
  if (!block) return defaults;
  return { ...defaults, ...(block.data as Partial<SiteContactInfo>) };
}

export async function saveSiteContactInfo(data: SiteContactInfo) {
  await db.contentBlock.upsert({
    where: { key: CONTENT_KEY },
    create: { key: CONTENT_KEY, data },
    update: { data },
  });
}
