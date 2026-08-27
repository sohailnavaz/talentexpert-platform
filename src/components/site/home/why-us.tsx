import { Award, Briefcase, CalendarClock, MessagesSquare, ShieldCheck, Users2 } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { BentoCard, BentoGrid } from "@/components/ui-fx/bento-grid";
import { Reveal } from "@/components/ui-fx/reveal";

const items = [
  {
    icon: Users2,
    title: "Live mentors, not recordings",
    description: "Every batch is led by an experienced trainer with real-time doubt clearing.",
    span: "lg:col-span-2",
  },
  {
    icon: Briefcase,
    title: "Placement assistance",
    description: "Resume reviews, mock interviews and a hiring-partner network at no extra cost.",
    span: "lg:col-span-2",
  },
  {
    icon: CalendarClock,
    title: "Flexible timings",
    description: "Weekday, weekend and corporate batches to fit your schedule.",
    span: "lg:col-span-1",
  },
  {
    icon: Award,
    title: "Certificate on completion",
    description: "A verifiable certificate the moment you finish.",
    span: "lg:col-span-1",
  },
  {
    icon: MessagesSquare,
    title: "Announcements, not chasing",
    description: "Schedule changes land on your dashboard automatically.",
    span: "lg:col-span-1",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    description: "Every transaction verified server-side, receipts on demand.",
    span: "lg:col-span-1",
  },
];

export function WhyUs() {
  return (
    <section className="bg-secondary/40 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Talent Expert"
          title="Built around outcomes, not just attendance"
          description="Everything here exists to get you from enquiry to a job-ready skill."
        />
        <Reveal className="mt-8 sm:mt-12">
          <BentoGrid className="lg:grid-cols-4">
            {items.map((item) => (
              <BentoCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={<item.icon className="h-5.5 w-5.5" />}
                className={item.span}
              />
            ))}
          </BentoGrid>
        </Reveal>
      </div>
    </section>
  );
}
