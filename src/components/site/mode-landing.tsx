import { getPublishedCourses, getUpcomingBatches } from "@/lib/data/courses";
import { PageHero } from "@/components/site/page-hero";
import { CourseCard } from "@/components/site/course-card";
import { BatchCard } from "@/components/site/batch-card";
import { SectionHeading } from "@/components/site/section-heading";
import type { DeliveryMode } from "@/generated/prisma";

export async function ModeLandingContent({
  mode,
  title,
  description,
}: {
  mode: DeliveryMode;
  title: string;
  description: string;
}) {
  const [courses, batches] = await Promise.all([
    getPublishedCourses({ mode }),
    getUpcomingBatches({ mode }),
  ]);

  return (
    <>
      <PageHero eyebrow="Course format" title={title} description={description} />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading align="left" title="Courses available in this format" className="mx-0 max-w-none text-left" />
        {courses.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No courses are currently listed in this format — check the full catalogue instead.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>

      {batches.length > 0 ? (
        <section className="bg-secondary/40 py-14 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <SectionHeading title="Upcoming batches in this format" />
            <div className="mt-8 flex flex-col gap-4">
              {batches.map((b) => (
                <BatchCard key={b.id} batch={b} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
