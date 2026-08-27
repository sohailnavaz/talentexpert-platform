import type { ReactNode } from "react";
import { BrandWatermark } from "@/components/site/brand-watermark";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-brand-navy text-white">
      <BrandWatermark />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        {eyebrow ? (
          <span className="mb-3 inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="max-w-2xl text-balance font-heading text-3xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-xl text-balance text-sm text-white/70 sm:text-lg">{description}</p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
