import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, Clock, Download, GraduationCap, Layers, ShieldCheck } from "lucide-react";
import { getCourseBySlug, getRelatedCourses } from "@/lib/data/courses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BatchCard } from "@/components/site/batch-card";
import { CourseCard } from "@/components/site/course-card";
import { EnquiryDialog } from "@/components/site/enquiry-dialog";
import { SectionHeading } from "@/components/site/section-heading";
import { formatINR, modeLabels } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.shortDescription,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || course.status !== "PUBLISHED") notFound();

  const related = await getRelatedCourses(course.id, course.categoryId);
  const faqs = (course.faqs as { q: string; a: string }[] | null) ?? [];

  return (
    <>
      <section className="relative overflow-hidden bg-[oklch(0.16_0.03_276)] text-white">
        <div className="absolute inset-0 bg-grid opacity-[0.12]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.4fr_1fr] lg:px-8">
          <div>
            {course.category ? (
              <Badge className="bg-white/10 text-white hover:bg-white/15">{course.category.name}</Badge>
            ) : null}
            <h1 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-3 max-w-2xl text-balance text-white/70">{course.shortDescription}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {course.modes.map((m) => (
                <Badge key={m} variant="secondary" className="bg-white/10 text-white">
                  {modeLabels[m] ?? m}
                </Badge>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
              {course.durationText ? (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {course.durationText}
                </span>
              ) : null}
              {course.level ? (
                <span className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4" /> {course.level}
                </span>
              ) : null}
              {course.trainer ? (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" /> Trained by {course.trainer.name}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div>
              <span className="text-xs uppercase tracking-wide text-white/60">Course fee</span>
              <p className="font-heading text-3xl font-bold">{formatINR(course.regularFee)}</p>
            </div>
            <Button
              render={<Link href="#batches" />}
              nativeButton={false}
              size="lg"
              className="bg-white text-[oklch(0.16_0.03_276)] hover:bg-white/90"
            >
              <CalendarDays className="h-4 w-4" /> View upcoming batches
            </Button>
            <EnquiryDialog
              courseInterest={course.title}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              )}
            >
              Talk to a counsellor
            </EnquiryDialog>
            {course.brochureUrl ? (
              <a
                href={course.brochureUrl}
                className="flex items-center justify-center gap-1.5 text-sm text-white/70 hover:text-white"
              >
                <Download className="h-4 w-4" /> Download brochure
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        <div className="min-w-0 space-y-12">
          <div>
            <h2 className="font-heading text-xl font-semibold">Overview</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{course.description}</p>
          </div>

          {course.highlights.length > 0 ? (
            <div>
              <h2 className="font-heading text-xl font-semibold">Why choose this course</h2>
              <ul className="mt-3 space-y-2.5">
                {course.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-foreground">
                    <BadgeCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {course.modules.length > 0 ? (
            <div>
              <h2 className="font-heading text-xl font-semibold">Module-wise syllabus</h2>
              <Accordion defaultValue={course.modules[0] ? [course.modules[0].id] : []} className="mt-3">
                {course.modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger className="font-heading text-base">{module.title}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {module.topics.map((topic) => (
                          <li key={topic.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {topic.title}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ) : null}

          {faqs.length > 0 ? (
            <div>
              <h2 className="font-heading text-xl font-semibold">Frequently asked questions</h2>
              <Accordion className="mt-3">
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ) : null}

          <div id="batches" className="scroll-mt-24">
            <h2 className="font-heading text-xl font-semibold">Upcoming batches</h2>
            {course.batches.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No batches are open right now.{" "}
                <EnquiryDialog courseInterest={course.title} className="text-primary underline underline-offset-2">
                  Ask us to notify you
                </EnquiryDialog>{" "}
                when the next one opens.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {course.batches.map((batch) => (
                  <BatchCard key={batch.id} batch={{ ...batch, course }} />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          {course.trainer ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Your trainer
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
                  {course.trainer.photoUrl ? (
                    <Image src={course.trainer.photoUrl} alt={course.trainer.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 font-heading font-bold text-primary">
                      {course.trainer.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{course.trainer.name}</p>
                  {course.trainer.experienceYears ? (
                    <p className="text-xs text-muted-foreground">
                      {course.trainer.experienceYears}+ years experience
                    </p>
                  ) : null}
                </div>
              </div>
              {course.trainer.bio ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{course.trainer.bio}</p>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-2xl border border-border bg-secondary/40 p-5">
            <h3 className="flex items-center gap-2 font-heading text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" /> Secure enrolment
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Pay online with UPI, cards or net banking. Your enrolment, receipt and portal login are created the
              moment payment succeeds.
            </p>
          </div>
        </aside>
      </section>

      {related.length > 0 ? (
        <section className="bg-secondary/40 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading align="left" title="You might also like" className="mx-0 max-w-none text-left" />
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
