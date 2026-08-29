import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCategories, getPublishedCourses } from "@/lib/data/courses";
import { PageHero } from "@/components/site/page-hero";
import { CourseFilters } from "@/components/site/course-filters";
import { CourseCard } from "@/components/site/course-card";
import { Button } from "@/components/ui/button";
import type { DeliveryMode } from "@/generated/prisma";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Courses",
  description: "Browse the full Talent Expert Edu course catalogue — filter by category and mode.",
  path: "/courses",
});

const PAGE_SIZE = 9;

function buildPageHref(params: { category?: string; mode?: string; q?: string }, page: number) {
  const usp = new URLSearchParams();
  if (params.category) usp.set("category", params.category);
  if (params.mode) usp.set("mode", params.mode);
  if (params.q) usp.set("q", params.q);
  if (page > 1) usp.set("page", String(page));
  const qs = usp.toString();
  return qs ? `/courses?${qs}` : "/courses";
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; mode?: string; q?: string; page?: string }>;
}) {
  const { category, mode, q, page } = await searchParams;
  const [courses, categories] = await Promise.all([
    getPublishedCourses({ categorySlug: category, mode: mode as DeliveryMode | undefined, q }),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
  const pagedCourses = courses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
          <>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {pagedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {totalPages > 1 ? (
              <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
                <Button
                  render={<Link href={buildPageHref({ category, mode, q }, currentPage - 1)} />}
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <span className="px-2 text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  render={<Link href={buildPageHref({ category, mode, q }, currentPage + 1)} />}
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
