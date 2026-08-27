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

export const metadata: Metadata = { title: "Payments" };

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  PAID: "default",
  CREATED: "secondary",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

export default async function AdminPaymentsPage() {
  const payments = await db.payment.findMany({
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
