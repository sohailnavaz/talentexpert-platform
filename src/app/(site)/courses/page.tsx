import type { Metadata } from "next";
import { getCategories, getPublishedCourses } from "@/lib/data/courses";
import { PageHero } from "@/components/site/page-hero";
import { CourseFilters } from "@/components/site/course-filters";
import { CourseCard } from "@/components/site/course-card";
import { RevealItem, RevealStagger } from "@/components/ui-fx/reveal";
import type { DeliveryMode } from "@/generated/prisma";

export const metadata: Metadata = {
  title: "All Courses",
  description: "Browse the full Talent Expert course catalogue — filter by category and mode.",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; mode?: string; q?: string }>;
}) {
  const { category, mode, q } = await searchParams;
  const [courses, categories] = await Promise.all([
    getPublishedCourses({ categorySlug: category, mode: mode as DeliveryMode | undefined, q }),
    getCategories(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Course catalogue"
        title="All Courses"
        description="Live, instructor-led courses across web development, data, cloud, QA, design and marketing."
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            {courses.length} course{courses.length === 1 ? "" : "s"} found
          </p>
          <CourseFilters categories={categories} />
        </div>

        {courses.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="font-heading text-lg font-semibold">No courses match those filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different category or mode, or check back soon — new courses are added regularly.
            </p>
          </div>
        ) : (
          <RevealStagger className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <RevealItem key={course.id}>
                <CourseCard course={course} />
              </RevealItem>
            ))}
          </RevealStagger>
        )}
      </section>
    </>
  );
}
