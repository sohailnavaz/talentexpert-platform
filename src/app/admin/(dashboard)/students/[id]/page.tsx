import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentActions } from "@/components/admin/student-actions";
import { ManualEnrolForm } from "@/components/admin/manual-enrol-form";
import { BackLink } from "@/components/admin/back-link";
import { getStudentStats } from "@/lib/gamification";
import { formatDate, formatDateShort, formatINR, modeLabels } from "@/lib/format";

export const metadata: Metadata = { title: "Student Profile" };

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [student, enrollments, payments, badges, stats, openBatches] = await Promise.all([
    db.student.findUnique({ where: { id } }),
    db.enrollment.findMany({
      where: { studentId: id },
      include: { batch: { include: { course: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.payment.findMany({ where: { studentId: id }, orderBy: { createdAt: "desc" } }),
    db.studentBadge.findMany({ where: { studentId: id }, include: { badge: true } }),
    getStudentStats(id),
    db.batch.findMany({
      where: { status: { in: ["UPCOMING", "ONGOING"] } },
      include: { course: true },
      orderBy: { startDate: "asc" },
    }),
  ]);

  if (!student) notFound();

  return (
    <div className="max-w-5xl space-y-8">
      <BackLink href="/admin/students" label="Back to students" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{student.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {student.email} · {student.phone} · Joined {formatDate(student.createdAt)}
          </p>
          {student.bio ? <p className="mt-2 max-w-lg text-sm text-muted-foreground">{student.bio}</p> : null}
        </div>
        <StudentActions studentId={student.id} active={student.active} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Courses enrolled" value={stats.coursesEnrolled} />
        <Stat label="Completed" value={stats.coursesCompleted} />
        <Stat label="Hours logged" value={stats.hoursLogged} />
        <Stat label="Badges earned" value={badges.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Enrolments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No enrolments yet.</p>
          ) : (
            enrollments.map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{e.batch.course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {modeLabels[e.batch.mode]} · Started {formatDateShort(e.batch.startDate)} · {e.enrollmentCode}
                  </p>
                </div>
                <Badge variant={e.status === "PAID" ? "default" : "secondary"}>{e.status}</Badge>
              </div>
            ))
          )}
          <div className="pt-3">
            <ManualEnrolForm
              studentId={student.id}
              batches={openBatches.map((b) => ({ id: b.id, label: `${b.course.title} — ${formatDateShort(b.startDate)}` }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Payment history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                <span>{formatDate(p.createdAt)}</span>
                <Badge variant="secondary">{p.status}</Badge>
                <span className="font-medium">{formatINR(p.amount)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {badges.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Badges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <Badge key={b.id} variant="secondary">
                {b.badge.label}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="font-heading text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
