import type { ReactNode } from "react";
import Link from "next/link";
import { Spotlight } from "@/components/ui-fx/spotlight";
import { BrandWatermark } from "@/components/site/brand-watermark";
import { Logo } from "@/components/site/logo";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-brand-navy px-4 py-10 text-white">
      <div className="absolute inset-0 bg-grid opacity-[0.12]" />
      <Spotlight />
      <BrandWatermark />
      <Link href="/" className="relative z-10 mb-8">
        <Logo />
      </Link>
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
