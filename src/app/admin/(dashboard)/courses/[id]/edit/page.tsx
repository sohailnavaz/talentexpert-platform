import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CourseForm } from "@/components/admin/course-form";
import { SyllabusBuilder } from "@/components/admin/syllabus-builder";
import { BackLink } from "@/components/admin/back-link";
import { updateCourse } from "@/lib/actions/admin-courses";

export const metadata: Metadata = { title: "Edit Course" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, categories, trainers] = await Promise.all([
    db.course.findUnique({
      where: { id },
      include: { modules: { orderBy: { order: "asc" }, include: { topics: { orderBy: { order: "asc" } } } } },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.trainer.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!course) notFound();

  const updateCourseWithId = updateCourse.bind(null, course.id);

  return (
    <div className="space-y-10">
      <BackLink href="/admin/courses" label="Back to courses" />
      <div>
        <h1 className="font-heading text-2xl font-bold">Edit Course</h1>
        <p className="mt-1 text-sm text-muted-foreground">{course.title}</p>
      </div>
      <CourseForm
        action={updateCourseWithId}
        categories={categories}
        trainers={trainers}
        course={{ ...course, regularFee: Number(course.regularFee) }}
      />

      <div className="max-w-3xl border-t border-border pt-8">
        <h2 className="font-heading text-lg font-semibold">Module-wise syllabus</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Build the syllabus students see on the course page.
        </p>
        <div className="mt-4">
          <SyllabusBuilder courseId={course.id} modules={course.modules} />
        </div>
      </div>
    </div>
  );
}
