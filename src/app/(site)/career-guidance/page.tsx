import type { Metadata } from "next";
import Link from "next/link";
import {
  BriefcaseBusiness,
  FileUser,
  MessagesSquare,
  Milestone,
  Users,
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/brand-icons";
import { PageHero } from "@/components/site/page-hero";
import { EnquiryDialog } from "@/components/site/enquiry-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Career Guidance",
  description:
    "Practical, no-fluff career guidance for career switchers and freshers — choosing a course, building a resume, interview prep, and what to expect from your first tech job search.",
  path: "/career-guidance",
});

const GUIDES = [
  {
    icon: Milestone,
    title: "Picking the right course for where you actually want to end up",
    body: "Don't start from \"what's trending\" — start from the kind of work you want on a Tuesday afternoon two years from now. Building visual products points toward frontend or full-stack development. Untangling messy data points toward data analytics or data science. Keeping systems running under pressure points toward DevOps or cloud. If you're genuinely unsure, a shorter workshop-format course is a cheaper way to test the fit than a full 4-month program.",
  },
  {
    icon: FileUser,
    title: "A resume that survives the first 6-second scan",
    body: "Recruiters skim, they don't read — so lead with what you built, not where you studied. Two or three projects with a one-line outcome each (\"Built a REST API handling 3 real user accounts and 200+ orders\") beat a long list of course modules. If you're switching careers, put a 2-line \"why I'm switching\" summary at the top — hiring managers will ask anyway, so answer it before they do. Cut anything older than 10 years and anything that doesn't support the specific role you're applying for.",
  },
  {
    icon: MessagesSquare,
    title: "What actually trips up freshers in technical interviews",
    body: "It's rarely the hard algorithm question — it's not being able to explain your own project clearly. Before any interview, be ready to walk through one project end-to-end: the problem, the decisions you made, and one thing you'd do differently now. For coding rounds, thinking out loud matters more than getting to the answer instantly; interviewers are watching how you approach a problem, not just whether you solve it.",
  },
  {
    icon: LinkedinIcon,
    title: "A LinkedIn profile that gets you found, not just seen",
    body: "Your headline should say what you do, not your job title alone — \"Frontend Developer | React & TypeScript\" outperforms \"Software Engineer\" in search. Turn on \"Open to Work\" with specific role titles, not just \"any role.\" Post or comment on something related to your field at least monthly — recruiters do check activity, not just the profile page.",
  },
  {
    icon: Users,
    title: "Switching careers with no formal tech background",
    body: "You're not competing on years of experience — you're competing on proof of capability. That means projects matter more for you than for a CS graduate, not less. Pick 2-3 projects that solve a real, specific problem (even a small one) over tutorial clones. Be upfront about the switch in interviews and framed as a decision, not an apology — most hiring managers have interviewed career switchers before and know it can work.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Freelance first, or full-time first?",
    body: "If you need income stability while you're still building confidence, full-time is usually the better first move — it gives you structured feedback and a team to learn from. Freelancing works better once you already have 1-2 solid projects or a full-time role behind you, since clients hire based on a track record, not potential. Either path is fine long-term; the mistake is choosing freelance purely to avoid interviews.",
  },
];

export default function CareerGuidancePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GUIDES.map((g) => ({
      "@type": "Question",
      name: g.title,
      acceptedAnswer: { "@type": "Answer", text: g.body },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow="Career Guidance"
        title="Straight answers, not motivational posters"
        description="Practical guidance for people actually job-hunting right now — choosing a course, building a resume that gets read, and getting through your first technical interview."
      />

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <div key={g.title} className="rounded-2xl border border-border bg-card p-6">
              <g.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 font-heading text-lg font-semibold text-balance">{g.title}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{g.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-border bg-secondary/40 p-8 text-center">
          <h2 className="font-heading text-xl font-semibold">Want guidance specific to your situation?</h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            A 15-minute call with a course counsellor can save you weeks of second-guessing which path fits your
            background and goals.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <EnquiryDialog className={cn(buttonVariants({ size: "lg" }))}>Talk to a counsellor</EnquiryDialog>
            <Link href="/placements" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              See placement support
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
