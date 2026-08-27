import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandWatermark } from "@/components/site/brand-watermark";
import { Logo } from "@/components/site/logo";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-brand-navy px-4 py-10 text-white">
      <BrandWatermark />
      <Link
        href="/"
        className="absolute top-5 left-5 z-10 flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
      <Link href="/" className="relative z-10 mb-8">
        <Logo />
      </Link>
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
