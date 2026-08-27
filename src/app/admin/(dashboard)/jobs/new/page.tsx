import type { Metadata } from "next";
import { JobForm } from "@/components/admin/job-form";
import { BackLink } from "@/components/admin/back-link";
import { createJobOpening } from "@/lib/actions/admin-jobs";

export const metadata: Metadata = { title: "New Job Opening" };

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <BackLink href="/admin/jobs" label="Back to job openings" />
      <div>
        <h1 className="font-heading text-2xl font-bold">New Job Opening</h1>
      </div>
      <JobForm action={createJobOpening} submitLabel="Create opening" />
    </div>
  );
}
