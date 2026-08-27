import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { JobForm } from "@/components/admin/job-form";
import { BackLink } from "@/components/admin/back-link";
import { updateJobOpening } from "@/lib/actions/admin-jobs";

export const metadata: Metadata = { title: "Edit Job Opening" };

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await db.jobOpening.findUnique({ where: { id } });
  if (!job) notFound();

  const updateJobWithId = updateJobOpening.bind(null, job.id);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/jobs" label="Back to job openings" />
      <div>
        <h1 className="font-heading text-2xl font-bold">Edit Job Opening</h1>
        <p className="mt-1 text-sm text-muted-foreground">{job.title}</p>
      </div>
      <JobForm action={updateJobWithId} job={job} />
    </div>
  );
}
