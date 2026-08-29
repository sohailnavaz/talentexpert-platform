import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { CheckoutForm } from "@/components/site/checkout-form";
import { formatDate, formatINR, modeLabels } from "@/lib/format";
import { getActiveOffer, computeEffectiveFee } from "@/lib/pricing";
import { getStudentSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Enrol now", robots: { index: false, follow: false } };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;

  const batch = await db.batch.findUnique({
    where: { id: batchId },
    include: { course: true, offers: true, trainer: true },
  });
  if (!batch || batch.course.status !== "PUBLISHED") notFound();

  const seatsLeft = Math.max(0, batch.seatTotal - batch.seatsFilled);
  const offer = getActiveOffer(batch.offers);
  const { effectiveFee, discountAmount } = computeEffectiveFee(Number(batch.fee), offer);

  const studentSession = await getStudentSession();
  const knownStudent = studentSession
    ? await db.student.findUnique({
        where: { id: studentSession.studentId },
        select: { name: true, email: true, phone: true, whatsapp: true },
      })
    : null;

  if (batch.status === "COMPLETED" || seatsLeft <= 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-2xl font-bold">
          {seatsLeft <= 0 ? "This batch is sold out" : "This batch has ended"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Check out other upcoming batches for {batch.course.title}, or ask us to notify you when a new one opens.
        </p>
        <Link
          href={`/courses/${batch.course.slug}`}
          className="mt-6 inline-block font-medium text-primary hover:underline"
        >
          Back to course details
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:py-16 lg:px-8">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Enrolling in</p>
          <h1 className="mt-1 font-heading text-2xl font-bold">{batch.course.title}</h1>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{modeLabels[batch.mode] ?? batch.mode}</Badge>
            {offer ? <Badge className="bg-primary">{offer.label}</Badge> : null}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" /> Starts {formatDate(batch.startDate)}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4" /> {batch.startTime}
          </div>
          {batch.trainer ? (
            <p className="text-sm text-muted-foreground">Trained by {batch.trainer.name}</p>
          ) : null}

          <div className="border-t border-border pt-3">
            {discountAmount > 0 ? (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Course fee</span>
                <span className="line-through">{formatINR(Number(batch.fee))}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-heading text-xl font-bold">{formatINR(effectiveFee)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            Payments are handled securely by Razorpay. Your student portal login is created the moment your
            enrolment is confirmed.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold">Your details</h2>
        <div className="mt-4">
          <CheckoutForm
            batchId={batch.id}
            courseTitle={batch.course.title}
            amount={effectiveFee}
            knownStudent={knownStudent}
          />
        </div>
      </div>
    </div>
  );
}
