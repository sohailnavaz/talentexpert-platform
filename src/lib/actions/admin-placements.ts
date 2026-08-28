"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { logActivity } from "@/lib/audit";
import type { AdminFormState } from "@/lib/actions/admin-courses";

const schema = z.object({
  studentName: z.string().trim().min(2, "Enter the student's name"),
  company: z.string().trim().min(1, "Enter the company name"),
  role: z.string().trim().min(1, "Enter the role"),
  batch: z.string().trim().optional(),
  photoUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  companyLogoUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  active: z.coerce.boolean(),
});

function parsePlacementForm(formData: FormData) {
  return schema.safeParse({
    studentName: formData.get("studentName"),
    company: formData.get("company"),
    role: formData.get("role"),
    batch: formData.get("batch") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    companyLogoUrl: formData.get("companyLogoUrl") || undefined,
    active: formData.get("active") === "on",
  });
}

function revalidatePlacementPaths() {
  revalidatePath("/admin/placements");
  revalidatePath("/");
  revalidatePath("/placements");
}

export async function createPlacement(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = parsePlacementForm(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const placement = await db.placement.create({
    data: {
      studentName: parsed.data.studentName,
      company: parsed.data.company,
      role: parsed.data.role,
      batch: parsed.data.batch || null,
      photoUrl: parsed.data.photoUrl || null,
      companyLogoUrl: parsed.data.companyLogoUrl || null,
      active: parsed.data.active,
    },
  });
  await logActivity(session.adminId, "placement.create", "Placement", placement.id, {
    studentName: placement.studentName,
    company: placement.company,
  });

  revalidatePlacementPaths();
  return { ok: true, message: "Placement added." };
}

export async function updatePlacement(
  placementId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = parsePlacementForm(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  await db.placement.update({
    where: { id: placementId },
    data: {
      studentName: parsed.data.studentName,
      company: parsed.data.company,
      role: parsed.data.role,
      batch: parsed.data.batch || null,
      photoUrl: parsed.data.photoUrl || null,
      companyLogoUrl: parsed.data.companyLogoUrl || null,
      active: parsed.data.active,
    },
  });
  await logActivity(session.adminId, "placement.update", "Placement", placementId);

  revalidatePlacementPaths();
  return { ok: true, message: "Placement updated." };
}

export async function togglePlacementActive(placementId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const placement = await db.placement.findUnique({ where: { id: placementId } });
  if (!placement) return;

  await db.placement.update({ where: { id: placementId }, data: { active: !placement.active } });
  revalidatePlacementPaths();
}

export async function deletePlacement(placementId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);

  await db.placement.delete({ where: { id: placementId } });
  await logActivity(session.adminId, "placement.delete", "Placement", placementId);

  revalidatePlacementPaths();
}
