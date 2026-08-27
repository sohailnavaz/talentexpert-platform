import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms & Conditions" />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
        <p>
          By enrolling in a course or using {siteConfig.domain}, you agree to the terms below.
          Please read them alongside our Privacy Policy and Cancellation & Refund policy.
        </p>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">Enrolment & access</h2>
          <p className="mt-2">
            Enrolment is confirmed once payment succeeds. Your student portal access, course
            materials and session links are for your personal use only and may not be shared,
            resold or redistributed.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">Course changes</h2>
          <p className="mt-2">
            We may occasionally adjust batch timings, trainers, or session order due to
            unavoidable circumstances. We will notify enrolled students in advance wherever
            possible via the student portal, email or WhatsApp.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">Code of conduct</h2>
          <p className="mt-2">
            Students are expected to behave respectfully toward trainers and fellow students.
            We reserve the right to suspend access for abusive behaviour or violation of these
            terms.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">Placement assistance</h2>
          <p className="mt-2">
            Placement assistance (resume reviews, mock interviews, hiring-partner introductions)
            is provided on a best-effort basis. We do not guarantee job offers or interview
            outcomes.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">Intellectual property</h2>
          <p className="mt-2">
            All course content, materials and branding remain the intellectual property of{" "}
            {siteConfig.legalName} unless explicitly stated otherwise.
          </p>
        </div>

        <p className="text-xs">Last updated: {new Date().getFullYear()}.</p>
      </section>
    </>
  );
}
