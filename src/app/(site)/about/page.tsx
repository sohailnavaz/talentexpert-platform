import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, HeartHandshake, Target, Users2 } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { BentoCard, BentoGrid } from "@/components/ui-fx/bento-grid";
import { getActiveTrainers } from "@/lib/data/content";
import { Reveal } from "@/components/ui-fx/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: "Who Talent Expert Edu is, what we believe in, and how we train.",
  path: "/about",
});

export default async function AboutPage() {
  const trainers = await getActiveTrainers();

  return (
    <>
      <PageHero
        eyebrow="About us"
        title="We built the training we wished existed"
        description="Talent Expert exists because too many courses teach for a certificate, not a job. We start from the outcome and work backwards."
      />

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-heading text-xl font-semibold">Our story</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Talent Expert started with a simple observation: most training institutes optimise for
          how many courses they can list, not how many students actually get hired. We flipped
          that — every course on this site exists because a trainer who is still working in that
          field is willing to teach it live, in small batches, with real projects.
        </p>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          That principle shapes everything downstream: our batches stay small enough for doubt
          clearing to be genuine, our syllabi are updated when the industry changes rather than
          once a year, and placement support is built into every course rather than sold
          separately.
        </p>
      </section>

      <section className="bg-secondary/40 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="What we believe" title="Our philosophy" />
          <Reveal className="mt-10">
            <BentoGrid>
              <BentoCard
                icon={<Target className="h-5.5 w-5.5" />}
                title="Outcomes over hours"
                description="A course is only as good as what a student can do afterward — not how many hours it took."
              />
              <BentoCard
                icon={<Users2 className="h-5.5 w-5.5" />}
                title="Trainers who still work"
                description="Every trainer is a working (or recently working) professional in the field they teach."
              />
              <BentoCard
                icon={<BookOpenCheck className="h-5.5 w-5.5" />}
                title="Small batches, real feedback"
                description="Batch sizes stay small enough that doubt-clearing and project reviews are genuine, not performative."
              />
              <BentoCard
                icon={<HeartHandshake className="h-5.5 w-5.5" />}
                title="Placement is part of the course"
                description="Resume reviews, mock interviews and hiring-partner introductions are built in, not upsold."
              />
            </BentoGrid>
          </Reveal>
        </div>
      </section>

      {trainers.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Our team" title="The people who teach here" />
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {trainers.map((t) => (
              <Link key={t.id} href={`/trainers/${t.slug}`} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-heading text-xl font-bold text-primary">
                  {t.name.charAt(0)}
                </div>
                <p className="mt-2 text-sm font-medium">{t.name}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-t border-border py-10 text-center">
        <Link href="/about/faqs" className="text-sm font-medium text-primary hover:underline">
          Have questions? Read our FAQs →
        </Link>
      </section>
    </>
  );
}
