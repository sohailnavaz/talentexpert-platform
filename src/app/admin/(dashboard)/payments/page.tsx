import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatINR } from "@/lib/format";
import { SearchParamInput } from "@/components/shared/search-param-input";
import { ParamSelect } from "@/components/shared/param-select";
import type { PaymentStatus, Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Payments" };

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  PAID: "default",
  CREATED: "secondary",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

const STATUS_OPTIONS = { CREATED: "Created", PAID: "Paid", FAILED: "Failed", REFUNDED: "Refunded" };

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const where: Prisma.PaymentWhereInput = {
    ...(q
      ? {
          OR: [
            { student: { name: { contains: q, mode: "insensitive" } } },
            { student: { email: { contains: q, mode: "insensitive" } } },
            { gatewayPaymentId: { contains: q, mode: "insensitive" } },
            { gatewayOrderId: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && status in STATUS_OPTIONS ? { status: status as PaymentStatus } : {}),
  };

  const payments = await db.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { student: true, enrollment: { include: { batch: { include: { course: true } } } } },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">{payments.length} shown (most recent 200)</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchParamInput placeholder="Search by student, email, or reference" className="max-w-sm" />
        <ParamSelect paramKey="status" options={STATUS_OPTIONS} allLabel="All statuses" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Gateway ref</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.student.name}</TableCell>
                <TableCell className="max-w-xs truncate">{p.enrollment?.batch.course.title ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">{p.gatewayPaymentId ?? p.gatewayOrderId}</TableCell>
                <TableCell>{formatINR(p.amount)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.status] ?? "secondary"}>{p.status}</Badge>
                </TableCell>
                <TableCell>{formatDate(p.createdAt)}</TableCell>
              </TableRow>
            ))}
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No payments yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
