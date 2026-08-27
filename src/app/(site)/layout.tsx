import type { ReactNode } from "react";
import { Suspense } from "react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { StickyActions } from "@/components/site/sticky-actions";
import { AnnouncementBar } from "@/components/site/announcement-bar";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={null}>
        <AnnouncementBar />
      </Suspense>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <StickyActions />
    </div>
  );
}
