import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Cancellation & Refund Policy" };

export default function CancellationRefundPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Cancellation & Refund Policy" />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">Before a batch starts</h2>
          <p className="mt-2">
            If you cancel at least 3 days before your batch&apos;s start date, you&apos;re eligible
            for a full refund, minus any payment gateway charges already deducted.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">After a batch starts</h2>
          <p className="mt-2">
            If you cancel within the first two sessions of a batch, you&apos;re eligible for a 50%
            refund. After the second session, fees are non-refundable, though we&apos;ll always try
            to move you to a later batch of the same course instead where possible.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">Batch cancelled by us</h2>
          <p className="mt-2">
            If we cancel a batch (for example, due to insufficient enrolment), you receive a full
            refund or the option to move to another batch or course of equal value.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">How to request a refund</h2>
          <p className="mt-2">
            Email {siteConfig.email} with your Enrolment ID and reason for cancellation. Approved
            refunds are processed to the original payment method within 7–10 business days.
          </p>
        </div>

        <p className="text-xs">Last updated: {new Date().getFullYear()}.</p>
      </section>
    </>
  );
}
