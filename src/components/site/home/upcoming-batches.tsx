import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { BatchCard } from "@/components/site/batch-card";
import { Button } from "@/components/ui/button";
import { RevealItem, RevealStagger } from "@/components/ui-fx/reveal";
import type { Batch, Course, Offer, Trainer } from "@/generated/prisma";

export function UpcomingBatches({
  batches,
}: {
  batches: (Batch & { course: Course; trainer: Trainer | null; offers: Offer[] })[];
}) {
  if (batches.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Don't miss the batch"
        title="Upcoming batches"
        description="Live, instructor-led batches starting soon — seats are limited and fill up fast."
      />
      <RevealStagger className="mx-auto mt-8 sm:mt-10 flex max-w-4xl flex-col gap-4">
        {batches.map((batch) => (
          <RevealItem key={batch.id}>
            <BatchCard batch={batch} />
          </RevealItem>
        ))}
      </RevealStagger>
      <div className="mt-8 flex justify-center">
        <Button render={<Link href="/batches" />} nativeButton={false} variant="outline">
          See all batches <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
