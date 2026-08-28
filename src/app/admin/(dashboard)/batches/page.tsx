import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatINR, modeLabels, batchStatusLabels } from "@/lib/format";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { deleteBatch } from "@/lib/actions/admin-batches";
import { SearchParamInput } from "@/components/shared/search-param-input";
import { ParamSelect } from "@/components/shared/param-select";
import type { BatchStatus, DeliveryMode, Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Batches" };

const STATUS_OPTIONS = { UPCOMING: "Upcoming", ONGOING: "Ongoing", COMPLETED: "Completed" };
const MODE_OPTIONS = Object.fromEntries(Object.entries(modeLabels));

export default async function AdminBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; mode?: string }>;
}) {
  const { q, status, mode } = await searchParams;

  const where: Prisma.BatchWhereInput = {
    ...(q ? { course: { title: { contains: q, mode: "insensitive" } } } : {}),
    ...(status && status in STATUS_OPTIONS ? { status: status as BatchStatus } : {}),
    ...(mode && mode in MODE_OPTIONS ? { mode: mode as DeliveryMode } : {}),
  };

  const batches = await db.batch.findMany({
    where,
    orderBy: { startDate: "desc" },
    include: { course: true, trainer: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Batches</h1>
          <p className="mt-1 text-sm text-muted-foreground">{batches.length} total</p>
        </div>
        <Button render={<Link href="/admin/batches/new" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Add Batch
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchParamInput placeholder="Search by course title" className="max-w-sm" />
        <ParamSelect paramKey="status" options={STATUS_OPTIONS} allLabel="All statuses" />
        <ParamSelect paramKey="mode" options={MODE_OPTIONS} allLabel="All modes" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Start date</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="max-w-xs truncate font-medium">{b.course.title}</TableCell>
                <TableCell>{formatDate(b.startDate)}</TableCell>
                <TableCell>{modeLabels[b.mode] ?? b.mode}</TableCell>
                <TableCell>
                  {b.seatsFilled}/{b.seatTotal}
                </TableCell>
                <TableCell>{formatINR(b.fee)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{batchStatusLabels[b.status] ?? b.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/admin/batches/${b.id}/edit`} />}
                      nativeButton={false}
                    >
                      Manage
                    </Button>
                    <ConfirmDeleteButton
                      action={deleteBatch.bind(null, b.id)}
                      description={`Delete this batch of "${b.course.title}"? Enrolled students will lose access.`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No batches yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
