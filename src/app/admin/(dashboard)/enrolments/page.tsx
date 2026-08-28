import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatINR } from "@/lib/format";
import { setEnrollmentCompletionAsAdmin } from "@/lib/actions/admin-enrolments";
import { SearchParamInput } from "@/components/shared/search-param-input";
import { ParamSelect } from "@/components/shared/param-select";
import type { EnrollmentStatus, Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Enrolments" };

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  PAID: "default",
  PENDING: "secondary",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

const STATUS_OPTIONS = { PENDING: "Pending", PAID: "Paid", FAILED: "Failed", REFUNDED: "Refunded" };
const COMPLETION_OPTIONS = { yes: "Completed", no: "Not completed" };

export default async function AdminEnrolmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; completion?: string }>;
}) {
  const { q, status, completion } = await searchParams;

  const where: Prisma.EnrollmentWhereInput = {
    ...(q
      ? {
          OR: [
            { student: { name: { contains: q, mode: "insensitive" } } },
            { student: { email: { contains: q, mode: "insensitive" } } },
            { enrollmentCode: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && status in STATUS_OPTIONS ? { status: status as EnrollmentStatus } : {}),
    ...(completion === "yes" ? { completedAt: { not: null } } : completion === "no" ? { completedAt: null } : {}),
  };

  const enrollments = await db.enrollment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { student: true, batch: { include: { course: true } } },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Enrolments</h1>
        <p className="mt-1 text-sm text-muted-foreground">{enrollments.length} shown (most recent 200)</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchParamInput placeholder="Search by student, email, or code" className="max-w-sm" />
        <ParamSelect paramKey="status" options={STATUS_OPTIONS} allLabel="All statuses" />
        <ParamSelect
          paramKey="completion"
          options={COMPLETION_OPTIONS}
          allLabel="All completion"
          className="sm:w-[180px]"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enrollment ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Completion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs">{e.enrollmentCode ?? "—"}</TableCell>
                <TableCell>{e.student.name}</TableCell>
                <TableCell className="max-w-xs truncate">{e.batch.course.title}</TableCell>
                <TableCell>{formatINR(e.amountPaid)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[e.status] ?? "secondary"}>{e.status}</Badge>
                </TableCell>
                <TableCell>{formatDate(e.createdAt)}</TableCell>
                <TableCell>
                  <form action={setEnrollmentCompletionAsAdmin.bind(null, e.id, !e.completedAt)}>
                    <Button type="submit" size="sm" variant={e.completedAt ? "secondary" : "outline"}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {e.completedAt ? "Completed" : "Mark completed"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No enrolments yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
