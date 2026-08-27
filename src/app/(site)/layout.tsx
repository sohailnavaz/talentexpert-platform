import type { ReactNode } from "react";
import { Suspense } from "react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { getSiteContactInfo } from "@/lib/site-settings";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const contact = await getSiteContactInfo();

  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={null}>
        <AnnouncementBar />
      </Suspense>
      <Navbar phone={contact.phone} phoneHref={contact.phoneHref} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
