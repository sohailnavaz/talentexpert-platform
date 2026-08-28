import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { CourseCard } from "@/components/site/course-card";
import { Button } from "@/components/ui/button";
import { RevealItem, RevealStagger } from "@/components/ui-fx/reveal";
import type { Category, Course, Trainer } from "@/generated/prisma";

export function FeaturedCourses({
  courses,
}: {
  courses: (Course & { category: Category | null; trainer: Trainer | null })[];
}) {
  if (courses.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          align="left"
          eyebrow="Popular right now"
          title="Featured courses"
          description="A snapshot of what learners are enrolling into this month."
          className="text-left sm:mx-0"
        />
        <Button
          render={<Link href="/courses" />}
          nativeButton={false}
          variant="outline"
          className="hidden shrink-0 sm:inline-flex"
        >
          View all courses <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <RevealStagger className="-mx-4 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {courses.map((course) => (
          <RevealItem key={course.id} className="w-[78%] shrink-0 snap-center sm:w-auto sm:shrink">
            <CourseCard course={course} />
          </RevealItem>
        ))}
      </RevealStagger>

      <div className="mt-8 flex justify-center sm:hidden">
        <Button render={<Link href="/courses" />} nativeButton={false} variant="outline" className="w-full">
          View all courses <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
