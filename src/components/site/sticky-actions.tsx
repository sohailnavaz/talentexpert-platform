"use client";

import Link from "next/link";
import { MessageCircle, Phone, PencilLine, BookOpen } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { EnquiryDialog } from "@/components/site/enquiry-dialog";
import { cn } from "@/lib/utils";

const waHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
  "Hi! I'd like to know more about your courses."
)}`;

export function StickyActions() {
  return (
    <>
      {/* Desktop / tablet floating actions */}
      <div className="fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-3 sm:flex">
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" fill="white" />
        </a>
      </div>

      {/* Mobile bottom action bar */}
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-background/95 backdrop-blur-lg shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.08)] sm:hidden",
          "pb-[env(safe-area-inset-bottom)]"
        )}
      >
        <a
          href={siteConfig.phoneHref}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium text-muted-foreground active:bg-accent"
        >
          <Phone className="h-5 w-5" />
          Call
        </a>
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium text-[#25D366] active:bg-accent"
        >
          <MessageCircle className="h-5 w-5" fill="currentColor" />
          WhatsApp
        </a>
        <Link
          href="/courses"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium text-muted-foreground active:bg-accent"
        >
          <BookOpen className="h-5 w-5" />
          Courses
        </Link>
        <EnquiryDialog className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-primary py-2.5 text-[11px] font-medium text-primary-foreground">
          <PencilLine className="h-5 w-5" />
          Enquire
        </EnquiryDialog>
      </nav>
    </>
  );
}
