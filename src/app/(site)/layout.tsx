import type { ReactNode } from "react";
import { Suspense } from "react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { getSiteContactInfo } from "@/lib/site-settings";
import { siteConfig } from "@/lib/site-config";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const contact = await getSiteContactInfo();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/logo-full.png`,
    description: siteConfig.description,
    telephone: contact.phone,
    email: contact.email,
    address: { "@type": "PostalAddress", streetAddress: contact.address },
    sameAs: Object.values(contact.socials).filter(Boolean),
  };

  return (
    <div className="flex min-h-svh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Suspense fallback={null}>
        <AnnouncementBar />
      </Suspense>
      <Navbar phone={contact.phone} phoneHref={contact.phoneHref} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
