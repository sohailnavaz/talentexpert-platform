import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getStudentSession } from "@/lib/auth/session";
import { getPaymentForStudent } from "@/lib/data/portal";
import { ReceiptDocument } from "@/lib/receipt";
import { formatDate, modeLabels } from "@/lib/format";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const payment = await getPaymentForStudent(session.studentId, id);
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (payment.status !== "PAID") {
    return NextResponse.json({ error: "Receipt not available for this payment" }, { status: 403 });
  }

  const batch = payment.enrollment?.batch;
  const buffer = await renderToBuffer(
    <ReceiptDocument
      receiptId={payment.id}
      paidDate={formatDate(payment.updatedAt)}
      studentName={payment.student.name}
      studentEmail={payment.student.email}
      courseTitle={batch?.course.title ?? "Talent Expert course"}
      batchMode={batch ? (modeLabels[batch.mode] ?? batch.mode) : "—"}
      paymentMethod={payment.gateway === "razorpay" ? "Razorpay" : payment.gateway}
      gatewayReference={payment.gatewayPaymentId ?? payment.gatewayOrderId}
      amountPaid={Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      currency={payment.currency}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="talent-expert-receipt-${payment.id}.pdf"`,
    },
  });
}
