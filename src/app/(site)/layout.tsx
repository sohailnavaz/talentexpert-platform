import type { ReactNode } from "react";
import { Suspense } from "react";
import { GoogleTagManager } from "@next/third-parties/google";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { AnnouncementPopup } from "@/components/site/announcement-popup";
import { Analytics } from "@/components/analytics";
import { getSiteContactInfo } from "@/lib/site-settings";
import { getActiveAnnouncements } from "@/lib/data/announcements";
import { siteConfig } from "@/lib/site-config";
import { getStudentSession } from "@/lib/auth/session";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [contact, popupAnnouncements, studentSession] = await Promise.all([
    getSiteContactInfo(),
    getActiveAnnouncements("WEBSITE", { popupOnly: true, take: 3 }),
    getStudentSession(),
  ]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/logo-full.png`,
    description: siteConfig.description,
    telephone: contact.phone,
    email: contact.email,
    address: { "@type": "PostalAddress", streetAddress: contact.address, addressCountry: "IN" },
    sameAs: Object.values(contact.socials).filter(Boolean),
  };

  return (
    <div className="flex min-h-svh flex-col">
      {GTM_ID ? <GoogleTagManager gtmId={GTM_ID} /> : null}
      <Analytics />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <AnnouncementPopup announcements={popupAnnouncements} />
      <Suspense fallback={null}>
        <AnnouncementBar />
      </Suspense>
      <Navbar
        phone={contact.phone}
        phoneHref={contact.phoneHref}
        student={studentSession ? { name: studentSession.name } : null}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
