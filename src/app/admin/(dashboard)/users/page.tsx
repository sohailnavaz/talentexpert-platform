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
import { describeDevice } from "@/lib/user-agent";
import { verifyAdminSession } from "@/lib/auth/dal";
import { NewAdminDialog } from "@/components/admin/new-admin-dialog";
import { AdminUserRowActions } from "@/components/admin/admin-user-row-actions";
import { SearchParamInput } from "@/components/shared/search-param-input";
import { ParamSelect } from "@/components/shared/param-select";
import type { AdminRole, Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Users & Roles" };

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  COUNSELLOR: "Counsellor",
  COORDINATOR: "Coordinator",
  EDITOR: "Editor",
};
const STATUS_OPTIONS = { active: "Active", disabled: "Disabled" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string }>;
}) {
  const session = await verifyAdminSession();
  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const { q, role, status } = await searchParams;

  const where: Prisma.AdminUserWhereInput = {
    ...(q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : {}),
    ...(role && role in ROLE_LABELS ? { role: role as AdminRole } : {}),
    ...(status === "active" ? { active: true } : status === "disabled" ? { active: false } : {}),
  };

  const admins = await db.adminUser.findMany({ where, orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Users & Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">{admins.length} admin accounts</p>
        </div>
        {isSuperAdmin ? <NewAdminDialog /> : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchParamInput placeholder="Search by name or email" className="max-w-sm" />
        <ParamSelect paramKey="role" options={ROLE_LABELS} allLabel="All roles" />
        <ParamSelect paramKey="status" options={STATUS_OPTIONS} allLabel="All statuses" />
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
                <TableCell>
                  {a.lastLoginAt ? (
                    <>
                      <p>{formatDate(a.lastLoginAt)}</p>
                      <p className="text-xs text-muted-foreground">
                        {describeDevice(a.lastLoginUserAgent) ?? "Unknown device"}
                        {a.lastLoginIp ? ` · ${a.lastLoginIp}` : ""}
                      </p>
                    </>
                  ) : (
                    "Never"
                  )}
                </TableCell>
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
