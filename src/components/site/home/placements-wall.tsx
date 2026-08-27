import Image from "next/image";
import { ArrowUpRight, Building2 } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { RevealItem, RevealStagger } from "@/components/ui-fx/reveal";
import type { Placement } from "@/generated/prisma";

export function PlacementsWall({ placements }: { placements: Placement[] }) {
  if (placements.length === 0) return null;

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Placement outcomes"
          title="Where our students landed"
          description="Real hiring outcomes, not projected numbers."
        />
        <RevealStagger className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {placements.map((p) => (
            <RevealItem key={p.id}>
              <div className="group flex h-full flex-col justify-between bg-card p-5 transition-colors hover:bg-secondary/40">
                <div className="flex items-start justify-between">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted">
                    {p.photoUrl ? (
                      <Image src={p.photoUrl} alt={p.studentName} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 font-heading text-sm font-bold text-primary">
                        {p.studentName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-primary" />
                </div>
                <div className="mt-4">
                  <p className="font-heading text-sm font-semibold">{p.studentName}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{p.role}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
                    <Building2 className="h-3.5 w-3.5" /> {p.company}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
