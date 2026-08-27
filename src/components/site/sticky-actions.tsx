import { WhatsAppIcon } from "@/components/icons/brand-icons";
import { siteConfig } from "@/lib/site-config";

const waHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
  "Hi! I'd like to know more about your courses."
)}`;

export function StickyActions() {
  return (
    <div className="fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-3 sm:flex">
      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform hover:scale-105"
      >
        <WhatsAppIcon className="h-6 w-6" />
      </a>
    </div>
  );
}
