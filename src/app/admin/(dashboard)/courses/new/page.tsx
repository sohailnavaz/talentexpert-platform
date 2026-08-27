import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CourseForm } from "@/components/admin/course-form";
import { BackLink } from "@/components/admin/back-link";
import { createCourse } from "@/lib/actions/admin-courses";

export const metadata: Metadata = { title: "Add Course" };

export default async function NewCoursePage() {
  const [categories, trainers] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.trainer.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/courses" label="Back to courses" />
      <div>
        <h1 className="font-heading text-2xl font-bold">Add Course</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Save as draft first if you want to build the syllabus before publishing.
        </p>
      </div>
      <CourseForm action={createCourse} categories={categories} trainers={trainers} submitLabel="Create course" />
    </div>
  );
}
