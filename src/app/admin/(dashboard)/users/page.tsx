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
import { formatDate } from "@/lib/format";
import { verifyAdminSession } from "@/lib/auth/dal";
import { NewAdminDialog } from "@/components/admin/new-admin-dialog";
import { AdminUserRowActions } from "@/components/admin/admin-user-row-actions";

export const metadata: Metadata = { title: "Users & Roles" };

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  COUNSELLOR: "Counsellor",
  COORDINATOR: "Coordinator",
  EDITOR: "Editor",
};

export default async function AdminUsersPage() {
  const session = await verifyAdminSession();
  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const admins = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Users & Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">{admins.length} admin accounts</p>
        </div>
        {isSuperAdmin ? <NewAdminDialog /> : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last login</TableHead>
              {isSuperAdmin ? <TableHead className="text-right">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{ROLE_LABELS[a.role]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={a.active ? "default" : "secondary"}>{a.active ? "Active" : "Disabled"}</Badge>
                </TableCell>
                <TableCell>{a.lastLoginAt ? formatDate(a.lastLoginAt) : "Never"}</TableCell>
                {isSuperAdmin ? (
                  <TableCell className="text-right">
                    <AdminUserRowActions id={a.id} role={a.role} active={a.active} isSelf={a.id === session.adminId} />
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
