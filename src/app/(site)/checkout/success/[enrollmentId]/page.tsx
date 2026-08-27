import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Enrolment confirmed" };

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ enrollmentId: string }>;
}) {
  const { enrollmentId } = await params;

  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { batch: { include: { course: true } }, student: { select: { name: true, email: true } } },
  });
  if (!enrollment || enrollment.status !== "PAID") notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
      <h1 className="mt-5 font-heading text-2xl font-bold">You&apos;re enrolled!</h1>
      <p className="mt-3 text-muted-foreground">
        {enrollment.student.name}, you&apos;re confirmed for <strong>{enrollment.batch.course.title}</strong>,
        starting {formatDate(enrollment.batch.startDate)}.
      </p>
      <p className="mt-4 rounded-xl border border-border bg-secondary/40 p-4 text-sm">
        Enrolment code: <span className="font-mono font-semibold">{enrollment.enrollmentCode}</span>
        <br />
        We&apos;ve emailed your student portal login to {enrollment.student.email}.
      </p>
      <Button render={<Link href="/login" />} nativeButton={false} size="lg" className="mt-8">
        Go to student portal
      </Button>
    </div>
  );
}
