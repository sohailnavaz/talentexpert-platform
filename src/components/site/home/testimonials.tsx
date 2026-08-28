import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/ui-fx/reveal";
import { TestimonialsCarousel } from "@/components/site/home/testimonials-carousel";
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
        <TestimonialsCarousel testimonials={testimonials} />
      </Reveal>
    </section>
  );
}
