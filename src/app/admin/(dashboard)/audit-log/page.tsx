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
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Audit Log" };

export default async function AdminAuditLogPage() {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);

  const logs = await db.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last {logs.length} admin actions, most recent first.</p>
      </div>

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
