import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { GrievanceStatusSelect } from "@/components/admin/grievance-status-select";
import { replyToGrievance } from "@/lib/actions/grievances";
import { SearchParamInput } from "@/components/shared/search-param-input";
import { ParamSelect } from "@/components/shared/param-select";
import type { GrievanceStatus, Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Grievances" };

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export default async function AdminGrievancesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const where: Prisma.GrievanceWhereInput = {
    ...(q
      ? {
          OR: [
            { subject: { contains: q, mode: "insensitive" } },
            { body: { contains: q, mode: "insensitive" } },
            { student: { name: { contains: q, mode: "insensitive" } } },
            { student: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(status && status in STATUS_LABELS ? { status: status as GrievanceStatus } : {}),
  };

  const grievances = await db.grievance.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { student: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Grievances</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {grievances.length} submission{grievances.length === 1 ? "" : "s"} from students.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchParamInput placeholder="Search by subject, student, or email" className="max-w-sm" />
        <ParamSelect paramKey="status" options={STATUS_LABELS} allLabel="All statuses" />
      </div>

      <div className="space-y-3">
        {grievances.map((g) => (
          <Card key={g.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{g.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {g.student.name} · {g.student.email} · {formatDate(g.createdAt)}
                  </p>
                </div>
                <GrievanceStatusSelect grievanceId={g.id} status={g.status} />
              </div>
              <p className="text-sm text-muted-foreground">{g.body}</p>
              {g.adminReply ? (
                <div className="rounded-lg border-l-2 border-primary bg-secondary/40 p-3 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">Your reply</p>
                  <p className="mt-1">{g.adminReply}</p>
                </div>
              ) : null}
              <form action={replyToGrievance.bind(null, g.id)} className="flex flex-col gap-2 sm:flex-row">
                <Textarea
                  name="adminReply"
                  placeholder={g.adminReply ? "Send another update..." : "Reply to the student..."}
                  rows={2}
                  required
                  className="flex-1"
                />
                <Button type="submit" size="sm" className="self-end">
                  Send reply
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
        {grievances.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No grievances match those filters.</p>
        ) : null}
      </div>
    </div>
  );
}
