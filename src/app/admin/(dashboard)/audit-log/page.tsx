import type { Metadata } from "next";
import type { Prisma } from "@/generated/prisma";
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
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { formatDate } from "@/lib/format";
import { AuditLogFilters } from "@/components/admin/audit-log-filters";

export const metadata: Metadata = { title: "Audit Log" };

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; adminId?: string; from?: string; to?: string; sort?: string }>;
}) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);

  const { entityType, adminId, from, to, sort } = await searchParams;
  const sortOrder = sort === "asc" ? "asc" : "desc";

  const createdAt: Prisma.DateTimeFilter = {};
  if (from) createdAt.gte = new Date(`${from}T00:00:00`);
  if (to) createdAt.lte = new Date(`${to}T23:59:59.999`);

  const where: Prisma.ActivityLogWhereInput = {
    ...(entityType ? { entityType } : {}),
    ...(adminId ? { actorId: adminId } : {}),
    ...(from || to ? { createdAt } : {}),
  };

  const [logs, entityTypeRows, admins] = await Promise.all([
    db.activityLog.findMany({
      where,
      orderBy: { createdAt: sortOrder },
      take: 200,
      include: { actor: { select: { name: true, email: true } } },
    }),
    db.activityLog.findMany({ distinct: ["entityType"], select: { entityType: true }, orderBy: { entityType: "asc" } }),
    db.adminUser.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const entityTypes = entityTypeRows.map((r) => r.entityType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {logs.length} admin action{logs.length === 1 ? "" : "s"}
          {entityType || adminId || from || to ? " matching filters" : ""}, {sortOrder === "desc" ? "most recent first" : "oldest first"}.
        </p>
      </div>

      <AuditLogFilters entityTypes={entityTypes} admins={admins} />

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(log.createdAt, { hour: "numeric", minute: "2-digit" })}
                </TableCell>
                <TableCell>{log.actor?.name ?? "System"}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {log.entityType}
                  {log.entityId ? ` · ${log.entityId}` : ""}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No activity recorded yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
