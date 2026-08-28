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
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { TrainerResetPasswordButton } from "@/components/admin/trainer-reset-password-button";
import { deleteTrainer } from "@/lib/actions/admin-trainers";
import { formatDate } from "@/lib/format";
import { describeDevice } from "@/lib/user-agent";
import { SearchParamInput } from "@/components/shared/search-param-input";
import { ParamSelect } from "@/components/shared/param-select";

export const metadata: Metadata = { title: "Trainers" };

const STATUS_OPTIONS = { active: "Active", inactive: "Inactive" };
const ACCESS_OPTIONS = { yes: "Has portal access", no: "No portal access" };

export default async function AdminTrainersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; access?: string }>;
}) {
  const { q, status, access } = await searchParams;
  const trainers = await db.trainer.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(status === "active" ? { active: true } : status === "inactive" ? { active: false } : {}),
      ...(access === "yes" ? { email: { not: null } } : access === "no" ? { email: null } : {}),
    },
    orderBy: { name: "asc" },
    include: { _count: { select: { courses: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Trainers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{trainers.length} total</p>
        </div>
        <Button render={<Link href="/admin/trainers/new" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Add Trainer
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchParamInput placeholder="Search by name" className="max-w-sm" />
        <ParamSelect paramKey="status" options={STATUS_OPTIONS} allLabel="All statuses" />
        <ParamSelect paramKey="access" options={ACCESS_OPTIONS} allLabel="All portal access" className="sm:w-[200px]" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Portal access</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainers.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.experienceYears ? `${t.experienceYears}+ years` : "—"}</TableCell>
                <TableCell>{t._count.courses}</TableCell>
                <TableCell>
                  <Badge variant={t.active ? "default" : "secondary"}>{t.active ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell>
                  {t.email ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{t.email}</Badge>
                      <TrainerResetPasswordButton trainerId={t.id} />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No portal access</span>
                  )}
                </TableCell>
                <TableCell>
                  {t.lastLoginAt ? (
                    <>
                      <p className="text-sm">{formatDate(t.lastLoginAt)}</p>
                      <p className="text-xs text-muted-foreground">
                        {describeDevice(t.lastLoginUserAgent) ?? "Unknown device"}
                        {t.lastLoginIp ? ` · ${t.lastLoginIp}` : ""}
                      </p>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Never</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" render={<Link href={`/admin/trainers/${t.id}/edit`} />} nativeButton={false}>
                      Edit
                    </Button>
                    <ConfirmDeleteButton
                      action={deleteTrainer.bind(null, t.id)}
                      description={`Delete ${t.name}? Courses referencing this trainer will show no trainer.`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {trainers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No trainers yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
