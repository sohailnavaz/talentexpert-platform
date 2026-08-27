import { CreditCard, IdCard, Rocket, Search } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { RevealItem, RevealStagger } from "@/components/ui-fx/reveal";

const steps = [
  {
    icon: Search,
    title: "Explore & compare",
    description: "Check the syllabus and pick a batch date.",
  },
  {
    icon: CreditCard,
    title: "Register & pay",
    description: "UPI, cards or net banking — coupons applied instantly.",
  },
  {
    icon: IdCard,
    title: "Get enrolled",
    description: "Enrolment, receipt and login created automatically.",
  },
  {
    icon: Rocket,
    title: "Start learning",
    description: "Session links and schedule land on your dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <SectionHeading
        eyebrow="How it works"
        title="From first click to first class"
        description="No forms to chase, no manual follow-up."
      />
      <RevealStagger className="relative mt-8 grid grid-cols-2 gap-4 sm:mt-14 sm:gap-8 lg:grid-cols-4">
        <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />
        {steps.map((step, i) => (
          <RevealItem
            key={step.title}
            className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 sm:h-12 sm:w-12">
              <step.icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
            </div>
            <span className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-primary sm:mt-4 sm:text-xs">
              Step {i + 1}
            </span>
            <h3 className="mt-1 font-heading text-sm font-semibold sm:text-lg">{step.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:mt-1.5 sm:text-sm">
              {step.description}
            </p>
          </RevealItem>
        ))}
      </RevealStagger>
    </section>
  );
}
