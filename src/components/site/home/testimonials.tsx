import { Star } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Marquee } from "@/components/ui-fx/marquee";
import { Reveal } from "@/components/ui-fx/reveal";
import type { Testimonial } from "@/generated/prisma";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="overflow-hidden py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Student voices"
          title="Don't take our word for it"
          description="Real feedback from students who enrolled, learned, and moved forward."
        />
      </div>
      <Reveal className="mt-8 sm:mt-12">
        <Marquee pauseOnHover className="[--gap:1.25rem]">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="flex w-80 shrink-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:w-96"
            >
              <div className="flex gap-0.5 text-[var(--brand-2)]">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 line-clamp-4 text-sm leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold">
                {t.studentName}
                {t.courseName ? (
                  <span className="block text-xs font-normal text-muted-foreground">
                    {t.courseName}
                  </span>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </Marquee>
      </Reveal>
    </section>
  );
}
