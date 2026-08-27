import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Common questions about enrolling, paying and learning at Talent Expert.",
};

const FAQS = [
  {
    q: "How do I enrol in a course?",
    a: "Open any course page, pick an upcoming batch, and click Enrol Now. You'll pay online and your enrolment, receipt and portal login are created automatically — no separate registration form.",
  },
  {
    q: "What payment methods are accepted?",
    a: "UPI, debit and credit cards, net banking and wallets, through a secure payment gateway. Card and UPI details never touch our servers.",
  },
  {
    q: "Can I switch batches after enrolling?",
    a: "Yes — contact us before the batch starts and we'll move you to the next available batch for the same course at no extra cost.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes, on completing the course requirements you receive a certificate. Some courses also help you prepare for external, industry-recognised certifications.",
  },
  {
    q: "What if I miss a live session?",
    a: "Session recordings and materials are shared in your student portal, and you can catch up before the next class.",
  },
  {
    q: "Is placement guaranteed?",
    a: "We provide placement assistance — resume reviews, mock interviews and hiring-partner introductions — for every course. No institute can ethically guarantee a job offer, and we won't claim to.",
  },
  {
    q: "How do refunds work?",
    a: "Refunds are handled per our Cancellation & Refund policy, linked in the footer. Reach out to us directly and we'll walk you through it.",
  },
];

export default function FAQsPage() {
  return (
    <>
      <PageHero eyebrow="FAQs" title="Frequently Asked Questions" />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Accordion>
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
