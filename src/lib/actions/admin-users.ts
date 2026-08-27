"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { hashPassword, generateTempPassword } from "@/lib/auth/password";
import type { AdminFormState } from "@/lib/actions/admin-courses";

const ROLES = ["SUPER_ADMIN", "COUNSELLOR", "COORDINATOR", "EDITOR"] as const;

const createSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  role: z.enum(ROLES),
});

export async function createAdminUser(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { ok: false, message: "Please check the form." };

  const existing = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { ok: false, message: "An admin with this email already exists." };

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await db.adminUser.create({
    data: { ...parsed.data, passwordHash },
  });

  revalidatePath("/admin/users");
  return { ok: true, message: `Admin created. Temporary password: ${tempPassword}` };
}

export async function setAdminRole(userId: string, role: (typeof ROLES)[number]) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);
  if (session.adminId === userId) return;
  await db.adminUser.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function toggleAdminActive(userId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);
  if (session.adminId === userId) return;

  const admin = await db.adminUser.findUnique({ where: { id: userId } });
  if (!admin) return;
  await db.adminUser.update({ where: { id: userId }, data: { active: !admin.active } });
  revalidatePath("/admin/users");
}

export async function deleteAdminUser(userId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);
  if (session.adminId === userId) return;
  await db.adminUser.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export async function resetAdminPassword(userId: string): Promise<{ tempPassword: string }> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  await db.adminUser.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath("/admin/users");
  return { tempPassword };
}
