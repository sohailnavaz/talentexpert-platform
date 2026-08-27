import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
        <p>
          {siteConfig.legalName} (&quot;we&quot;, &quot;us&quot;) operates {siteConfig.domain}. This
          policy explains what information we collect, how we use it, and the choices you have.
        </p>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">Information we collect</h2>
          <p className="mt-2">
            When you enquire, register, or enrol, we collect your name, email, phone number, and
            course of interest. When you pay for a course, our payment gateway processes your
            payment details directly — we never store your card or bank details on our servers.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">How we use it</h2>
          <p className="mt-2">
            We use your information to respond to enquiries, process enrolments and payments,
            provide access to your student portal, send class and payment-related communication,
            and improve our courses. We do not sell your personal data to third parties.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">Data security</h2>
          <p className="mt-2">
            Passwords are stored one-way encrypted. Payment details are handled entirely by our
            PCI-DSS certified payment gateway and never touch our servers. Access to student data
            is limited to staff who need it to do their jobs.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">Your choices</h2>
          <p className="mt-2">
            You can request a copy of your data, ask us to correct it, or request deletion (subject
            to legal and financial record-keeping requirements) by writing to {siteConfig.email}.
          </p>
        </div>

        <p className="text-xs">Last updated: {new Date().getFullYear()}.</p>
      </section>
    </>
  );
}
