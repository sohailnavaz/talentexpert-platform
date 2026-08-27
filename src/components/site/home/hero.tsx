import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedBadge, GradientText } from "@/components/ui-fx/gradient-text";
import { NumberTicker } from "@/components/ui-fx/number-ticker";
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
      <BrandWatermark className="-right-32 -top-32 sm:-right-16 sm:-top-16" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24 lg:px-8">
        <Link href="/batches">
          <AnimatedBadge>New batches open — early-bird pricing live</AnimatedBadge>
        </Link>

        <h1 className="mt-6 max-w-4xl text-balance font-heading text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
          Learn live. Get certified. <GradientText>Get hired.</GradientText>
        </h1>

        <p className="mt-5 max-w-2xl text-balance text-base leading-relaxed text-white/70 sm:text-lg">
          Career-focused courses with live mentors, hands-on projects and real placement
          assistance — enrol online in minutes and start learning the same week.
        </p>

        <div className="mt-8">
          <Button
            render={<Link href="/courses" />}
            nativeButton={false}
            size="lg"
            className="bg-white text-brand-navy hover:bg-white/90"
          >
            Explore Courses <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-14 grid w-full max-w-3xl grid-cols-3 gap-4 border-t border-white/10 pt-8">
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
      <p className="font-heading text-2xl font-bold sm:text-3xl">
        <NumberTicker value={value} suffix={suffix} />
      </p>
      <span className="mt-1 text-xs text-white/60 sm:text-sm">{label}</span>
    </div>
  );
}
