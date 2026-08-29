import type { Metadata } from "next";
import { getUpcomingBatches } from "@/lib/data/courses";
import { PageHero } from "@/components/site/page-hero";
import { BatchCard } from "@/components/site/batch-card";
import { RevealItem, RevealStagger } from "@/components/ui-fx/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "New Batches",
  description: "All upcoming and ongoing Talent Expert Edu batches — dates, timings and seats left.",
  path: "/batches",
});

export default async function BatchesPage() {
  const batches = await getUpcomingBatches();

  return (
    <>
      <PageHero
        eyebrow="Live batches"
        title="New Batches"
        description="Every batch below is entered once by our team and updates itself automatically as seats fill and dates pass."
      />
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        {batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="font-heading text-lg font-semibold">No batches are open right now</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon, or enquire and we&apos;ll notify you.</p>
          </div>
        ) : (
          <RevealStagger className="flex flex-col gap-4">
            {batches.map((batch) => (
              <RevealItem key={batch.id}>
                <BatchCard batch={batch} />
              </RevealItem>
            ))}
          </RevealStagger>
        )}
      </section>
    </>
  );
}
