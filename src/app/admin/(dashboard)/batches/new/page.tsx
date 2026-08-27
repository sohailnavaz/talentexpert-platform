import type { Metadata } from "next";
import { db } from "@/lib/db";
import { BatchForm } from "@/components/admin/batch-form";
import { BackLink } from "@/components/admin/back-link";
import { createBatch } from "@/lib/actions/admin-batches";

export const metadata: Metadata = { title: "Add Batch" };

export default async function NewBatchPage() {
  const [courses, trainers] = await Promise.all([
    db.course.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    db.trainer.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/batches" label="Back to batches" />
      <div>
        <h1 className="font-heading text-2xl font-bold">Add Batch</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          After saving, you can attach an early-bird offer and add session links.
        </p>
      </div>
      <BatchForm action={createBatch} courses={courses} trainers={trainers} submitLabel="Create batch" />
    </div>
  );
}
