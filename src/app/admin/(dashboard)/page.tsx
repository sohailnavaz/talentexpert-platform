import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const liveWindowStart = new Date(now.getTime() - 30 * 60 * 1000);
  const liveWindowEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const [
    newLeadsCount,
    newEnrolmentsThisMonth,
    collectionsAgg,
    upcomingBatchesCount,
    seatsRemainingAgg,
    recentLeads,
    recentPayments,
    activeTrialStudents,
    liveClassesNow,
    activeStudentsTotal,
    activeTrainersTotal,
  ] = await Promise.all([
    db.lead.count({ where: { status: "NEW" } }),
    db.enrollment.count({ where: { status: "PAID", createdAt: { gte: startOfMonth } } }),
    db.payment.aggregate({
      where: { status: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    db.batch.count({ where: { status: "UPCOMING", startDate: { lte: in7Days } } }),
    db.batch.aggregate({ where: { status: "UPCOMING" }, _sum: { seatTotal: true, seatsFilled: true } }),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    db.payment.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { student: true },
    }),
    db.enrollment.count({ where: { isTrial: true, trialExpiresAt: { gt: now } } }),
    db.classSession.count({ where: { date: { gte: liveWindowStart, lte: liveWindowEnd } } }),
    db.student.count({ where: { active: true } }),
    db.trainer.count({ where: { active: true } }),
  ]);

  const seatsRemaining =
    (seatsRemainingAgg._sum.seatTotal ?? 0) - (seatsRemainingAgg._sum.seatsFilled ?? 0);

  const stats = [
    { label: "New enquiries", value: newLeadsCount, href: "/admin/leads" },
    { label: "New enrolments (month)", value: newEnrolmentsThisMonth, href: "/admin/enrolments" },
    { label: "Collections (month)", value: formatINR(Number(collectionsAgg._sum.amount ?? 0)), href: "/admin/payments" },
    { label: "Batches starting in 7 days", value: upcomingBatchesCount, href: "/admin/batches" },
    { label: "Seats remaining", value: seatsRemaining, href: "/admin/batches" },
  ];

  const secondaryStats = [
    { label: "Active trial students", value: activeTrialStudents, href: "/admin/students" },
    { label: "Live classes now", value: liveClassesNow, href: "/admin/live-classes" },
    { label: "Active students", value: activeStudentsTotal, href: "/admin/students" },
    { label: "Active trainers", value: activeTrainersTotal, href: "/admin/trainers" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Today&apos;s numbers at a glance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <p className="font-heading text-2xl font-bold">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {secondaryStats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <p className="font-heading text-2xl font-bold">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Recent enquiries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No enquiries yet.</p>
            ) : (
              recentLeads.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{l.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.courseInterest ?? "General enquiry"} · {formatDate(l.createdAt)}
                    </p>
                  </div>
                  <Badge variant="secondary">{l.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Recent payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            ) : (
              recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.student.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                  </div>
                  <span className="font-medium">{formatINR(p.amount)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
