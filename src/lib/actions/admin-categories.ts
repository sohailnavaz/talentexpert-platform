"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { logActivity } from "@/lib/audit";
import type { AdminFormState } from "@/lib/actions/admin-courses";

const schema = z.object({
  name: z.string().trim().min(2, "Enter a category name"),
});

export async function createCategory(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };

  const existing = await db.category.findUnique({ where: { name: parsed.data.name } });
  if (existing) return { ok: false, message: "A category with this name already exists." };

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let attempt = 1;
  while (await db.category.findUnique({ where: { slug } })) slug = `${baseSlug}-${attempt++}`;

  const category = await db.category.create({ data: { name: parsed.data.name, slug } });
  await logActivity(session.adminId, "category.create", "Category", category.id, { name: category.name });

  revalidatePath("/admin/categories");
  revalidatePath("/courses");
  return { ok: true, message: "Category added." };
}

export async function updateCategory(
  categoryId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };

  const existing = await db.category.findUnique({ where: { name: parsed.data.name } });
  if (existing && existing.id !== categoryId) {
    return { ok: false, message: "Another category already uses this name." };
  }

  await db.category.update({ where: { id: categoryId }, data: { name: parsed.data.name } });
  await logActivity(session.adminId, "category.update", "Category", categoryId);

  revalidatePath("/admin/categories");
  revalidatePath("/courses");
  return { ok: true, message: "Category renamed." };
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);

  const courseCount = await db.course.count({ where: { categoryId } });
  if (courseCount > 0) {
    throw new Error(
      `${courseCount} course${courseCount === 1 ? "" : "s"} still use this category. Move them first.`
    );
  }

  await db.category.delete({ where: { id: categoryId } });
  await logActivity(session.adminId, "category.delete", "Category", categoryId);

  revalidatePath("/admin/categories");
  revalidatePath("/courses");
}
