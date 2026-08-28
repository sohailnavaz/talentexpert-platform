import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { deleteJobOpening } from "@/lib/actions/admin-jobs";
import { SearchParamInput } from "@/components/shared/search-param-input";
import { ParamSelect } from "@/components/shared/param-select";
import type { Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Job Openings" };

const STATUS_OPTIONS = { active: "Active", closed: "Closed" };

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const where: Prisma.JobOpeningWhereInput = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "active" ? { active: true } : status === "closed" ? { active: false } : {}),
  };

  const jobs = await db.jobOpening.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Job Openings</h1>
          <p className="mt-1 text-sm text-muted-foreground">{jobs.length} total</p>
        </div>
        <Button render={<Link href="/admin/jobs/new" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> New opening
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchParamInput placeholder="Search by role or location" className="max-w-sm" />
        <ParamSelect paramKey="status" options={STATUS_OPTIONS} allLabel="All" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((j) => (
              <TableRow key={j.id}>
                <TableCell className="font-medium">{j.title}</TableCell>
                <TableCell>{j.location}</TableCell>
                <TableCell>
                  <Badge variant={j.active ? "default" : "secondary"}>{j.active ? "Active" : "Closed"}</Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/jobs/${j.id}/applications`} className="text-sm font-medium text-primary hover:underline">
                    {j._count.applications} applicant{j._count.applications === 1 ? "" : "s"}
                  </Link>
                </TableCell>
                <TableCell>{formatDate(j.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" render={<Link href={`/admin/jobs/${j.id}/edit`} />} nativeButton={false}>
                      Edit
                    </Button>
                    <ConfirmDeleteButton action={deleteJobOpening.bind(null, j.id)} description={`Delete "${j.title}"? Applications will be removed too.`} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No job openings yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
