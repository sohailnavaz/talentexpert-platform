import { CreditCard, IdCard, Rocket, Search } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { RevealItem, RevealStagger } from "@/components/ui-fx/reveal";

const steps = [
  {
    icon: Search,
    title: "Explore & compare",
    description: "Browse the full catalogue, check the syllabus and pick a batch date that works for you.",
  },
  {
    icon: CreditCard,
    title: "Register & pay online",
    description: "Secure checkout with UPI, cards, net banking or wallets — coupons applied instantly.",
  },
  {
    icon: IdCard,
    title: "Get your Enrollment ID",
    description: "The moment payment succeeds, your enrolment, receipt and login are created automatically.",
  },
  {
    icon: Rocket,
    title: "Start learning",
    description: "Log in to your dashboard for session links, materials and schedule — before class even starts.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="How it works"
        title="From first click to first class"
        description="No forms to chase, no manual follow-up — the platform does the busy work so you can focus on learning."
      />
      <RevealStagger className="relative mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />
        {steps.map((step, i) => (
          <RevealItem key={step.title} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <step.icon className="h-5.5 w-5.5" />
            </div>
            <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
              Step {i + 1}
            </span>
            <h3 className="mt-1 font-heading text-lg font-semibold">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </RevealItem>
        ))}
      </RevealStagger>
    </section>
  );
}
