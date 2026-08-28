import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BackLink } from "@/components/admin/back-link";
import { formatDate } from "@/lib/format";
import { SearchParamInput } from "@/components/shared/search-param-input";
import { resolveStorageUrlOrNull } from "@/lib/storage";
import type { Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Applications" };

export default async function JobApplicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  const job = await db.jobOpening.findUnique({
    where: { id },
    select: { id: true, title: true },
  });
  if (!job) notFound();

  const where: Prisma.JobApplicationWhereInput = {
    jobOpeningId: id,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const applicationsRaw = await db.jobApplication.findMany({ where, orderBy: { createdAt: "desc" } });
  const applications = await Promise.all(
    applicationsRaw.map(async (a) => ({ ...a, resumeUrl: await resolveStorageUrlOrNull(a.resumeUrl) }))
  );

  return (
    <div className="space-y-6">
      <BackLink href="/admin/jobs" label="Back to job openings" />
      <div>
        <h1 className="font-heading text-2xl font-bold">Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {applications.length} applicant{applications.length === 1 ? "" : "s"} for {job.title}
        </p>
      </div>

      <SearchParamInput placeholder="Search by name, email, or phone" className="max-w-sm" />

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Resume</TableHead>
              <TableHead>Applied</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>
                  <a href={`mailto:${a.email}`} className="text-primary hover:underline">
                    {a.email}
                  </a>
                </TableCell>
                <TableCell>{a.phone}</TableCell>
                <TableCell>
                  {a.resumeUrl ? (
                    <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{formatDate(a.createdAt)}</TableCell>
              </TableRow>
            ))}
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No applications yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
