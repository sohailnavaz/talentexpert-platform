import type { Metadata } from "next";
import Image from "next/image";
import { Briefcase } from "lucide-react";
import { getActivePlacements, getActiveTestimonials } from "@/lib/data/content";
import { db } from "@/lib/db";
import { resolveStorageUrlOrNull } from "@/lib/storage";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { NumberTicker } from "@/components/ui-fx/number-ticker";
import { EnquiryDialog } from "@/components/site/enquiry-dialog";
import { Testimonials } from "@/components/site/home/testimonials";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Placements",
  description: "Placement assistance, hiring partners and where our students landed.",
};

export default async function PlacementsPage() {
  const [placementsRaw, testimonials, placedCount, hiringPartners] = await Promise.all([
    getActivePlacements(24),
    getActiveTestimonials(6),
    db.placement.count({ where: { active: true } }),
    db.placement.groupBy({ by: ["company"], where: { active: true } }).then((r) => r.length),
  ]);
  const placements = await Promise.all(
    placementsRaw.map(async (p) => ({ ...p, photoUrl: await resolveStorageUrlOrNull(p.photoUrl) }))
  );

  return (
    <>
      <PageHero
        eyebrow="Placement assistance"
        title="From classroom to career"
        description="Resume reviews, mock interviews and a hiring-partner network — placement support is part of every course, not an add-on."
      >
        <EnquiryDialog className={cn(buttonVariants({ size: "lg" }), "bg-white text-brand-navy hover:bg-white/90")}>
          Ask about placement support
        </EnquiryDialog>
      </PageHero>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <Stat value={Math.max(placedCount, 50)} suffix="+" label="Students placed" />
          <Stat value={Math.max(hiringPartners, 20)} suffix="+" label="Hiring partners" />
          <Stat value={85} suffix="%" label="Placement assistance rate" />
        </div>
      </section>

      <section className="bg-secondary/40 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Success stories" title="Recently placed" />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {placements.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                  {p.photoUrl ? (
                    <Image src={p.photoUrl} alt={p.studentName} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 font-heading text-sm font-bold text-primary">
                      {p.studentName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.studentName}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Briefcase className="h-3 w-3 shrink-0" /> {p.role} · {p.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials testimonials={testimonials} />
    </>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card py-6 text-center">
      <p className="font-heading text-3xl font-bold text-primary">
        <NumberTicker value={value} suffix={suffix} />
      </p>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</p>
    </div>
  );
}
