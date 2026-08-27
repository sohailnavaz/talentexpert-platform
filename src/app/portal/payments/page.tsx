import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import { verifyStudentSession } from "@/lib/auth/dal";
import { getStudentPayments } from "@/lib/data/portal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Payments & Receipts" };

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  PAID: "default",
  CREATED: "secondary",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

export default async function PaymentsPage() {
  const session = await verifyStudentSession();
  const payments = await getStudentPayments(session.studentId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Payments & Receipts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every transaction on your account, in one place.</p>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <Receipt className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    {p.enrollment?.batch.course.title ?? "Payment"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(p.createdAt)} · Ref: {p.gatewayPaymentId ?? p.gatewayOrderId}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[p.status] ?? "secondary"}>{p.status}</Badge>
                  <span className="font-heading font-semibold">{formatINR(p.amount)}</span>
                  {p.status === "PAID" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      render={<a href={`/portal/payments/${p.id}/receipt`} target="_blank" rel="noreferrer" />}
                      nativeButton={false}
                    >
                      Receipt
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
