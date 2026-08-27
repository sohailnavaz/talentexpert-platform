import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/ui-fx/spotlight";
import { Meteors } from "@/components/ui-fx/meteors";
import { AnimatedBadge, GradientText } from "@/components/ui-fx/gradient-text";
import { NumberTicker } from "@/components/ui-fx/number-ticker";
import { EnquiryDialog } from "@/components/site/enquiry-dialog";
import { BrandWatermark } from "@/components/site/brand-watermark";

export function Hero({
  studentsCount,
  coursesCount,
  hiringPartners,
}: {
  studentsCount: number;
  coursesCount: number;
  hiringPartners: number;
}) {
  return (
    <section className="relative overflow-hidden bg-brand-navy text-white">
      <div className="absolute inset-0 bg-grid opacity-[0.15]" />
      <Spotlight />
      <BrandWatermark className="-right-32 -top-32 sm:-right-20 sm:-top-20" />
      <Meteors count={14} />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-navy to-transparent" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24 lg:px-8">
        <Link href="/batches">
          <AnimatedBadge>New batches open — early-bird pricing live</AnimatedBadge>
        </Link>

        <h1 className="mt-6 max-w-4xl text-balance font-heading text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
          Learn live. Get certified.{" "}
          <GradientText>Get hired.</GradientText>
        </h1>

        <p className="mt-5 max-w-2xl text-balance text-base leading-relaxed text-white/70 sm:text-lg">
          Career-focused courses with live mentors, hands-on projects and real placement
          assistance — enrol online in minutes and start learning the same week.
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Button
            render={<Link href="/courses" />}
            nativeButton={false}
            size="lg"
            className="w-full bg-white text-brand-navy hover:bg-white/90 sm:w-auto"
          >
            Explore Courses <ArrowRight className="h-4 w-4" />
          </Button>
          <EnquiryDialog
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "w-full border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
            )}
          >
            <PlayCircle className="h-4 w-4" /> Talk to a counsellor
          </EnquiryDialog>
        </div>

        <div className="mt-10 grid w-full max-w-3xl grid-cols-3 gap-4 border-t border-white/10 pt-8">
          <Stat value={studentsCount} suffix="+" label="Students trained" />
          <Stat value={coursesCount} suffix="+" label="Live courses" />
          <Stat value={hiringPartners} suffix="+" label="Hiring partners" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1 font-heading text-2xl font-bold sm:text-3xl">
        <Sparkles className="h-4 w-4 text-[var(--brand-2)]" />
        <NumberTicker value={value} suffix={suffix} />
      </div>
      <span className="mt-1 text-xs text-white/60 sm:text-sm">{label}</span>
    </div>
  );
}
