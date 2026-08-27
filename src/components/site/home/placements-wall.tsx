import Image from "next/image";
import { Briefcase } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Marquee } from "@/components/ui-fx/marquee";
import { Reveal } from "@/components/ui-fx/reveal";
import type { Placement } from "@/generated/prisma";

export function PlacementsWall({ placements }: { placements: Placement[] }) {
  if (placements.length === 0) return null;

  return (
    <section className="overflow-hidden bg-secondary/40 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Placements"
          title="Where our students landed"
          description="A snapshot of learners who turned a course into a career move."
        />
      </div>
      <Reveal className="mt-8 sm:mt-12">
        <Marquee pauseOnHover className="[--gap:1.25rem]">
          {placements.map((p) => (
            <div
              key={p.id}
              className="flex w-72 shrink-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
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
                <p className="truncate font-semibold text-foreground">{p.studentName}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <Briefcase className="h-3 w-3 shrink-0" /> {p.role} · {p.company}
                </p>
              </div>
            </div>
          ))}
        </Marquee>
      </Reveal>
    </section>
  );
}
