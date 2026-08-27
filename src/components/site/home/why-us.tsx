import { Award, Briefcase, CalendarClock, MessagesSquare, ShieldCheck, Users2 } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { BentoCard, BentoGrid } from "@/components/ui-fx/bento-grid";
import { Reveal } from "@/components/ui-fx/reveal";

const items = [
  {
    icon: Users2,
    title: "Live mentors, not recordings",
    description: "Every batch is led by an experienced trainer with real-time doubt clearing.",
  },
  {
    icon: Briefcase,
    title: "Placement assistance",
    description: "Resume reviews, mock interviews and a hiring-partner network at no extra cost.",
  },
  {
    icon: CalendarClock,
    title: "Flexible batch timings",
    description: "Weekday, weekend and corporate batches — pick what fits your schedule.",
  },
  {
    icon: Award,
    title: "Certificate on completion",
    description: "A verifiable certificate the moment you complete your course requirements.",
  },
  {
    icon: MessagesSquare,
    title: "Announcements, not chasing",
    description: "Schedule changes and session links land on your dashboard automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Secure, transparent payments",
    description: "Every transaction is verified server-side with a receipt you can download anytime.",
  },
];

export function WhyUs() {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Talent Expert"
          title="Built around outcomes, not just attendance"
          description="Everything here exists to get you from enquiry to a job-ready skill, with as little friction as possible."
        />
        <Reveal className="mt-14">
          <BentoGrid>
            {items.map((item) => (
              <BentoCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={<item.icon className="h-5.5 w-5.5" />}
              />
            ))}
          </BentoGrid>
        </Reveal>
      </div>
    </section>
  );
}
