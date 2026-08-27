"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import type { AdminFormState } from "@/lib/actions/admin-courses";

const schema = z.object({
  title: z.string().trim().min(2),
  company: z.string().trim().min(2),
  location: z.string().trim().min(2),
  experience: z.string().trim().min(1),
  description: z.string().trim().min(10),
  active: z.coerce.boolean().optional(),
});

export async function createJobOpening(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);

  const parsed = schema.safeParse({
    title: formData.get("title"),
    company: formData.get("company"),
    location: formData.get("location"),
    experience: formData.get("experience"),
    description: formData.get("description"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { ok: false, message: "Please check the form." };

  await db.jobOpening.create({ data: { ...parsed.data, active: parsed.data.active ?? true } });

  revalidatePath("/admin/jobs");
  revalidatePath("/careers");
  redirect("/admin/jobs");
}

export async function updateJobOpening(
  jobId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);

  const parsed = schema.safeParse({
    title: formData.get("title"),
    company: formData.get("company"),
    location: formData.get("location"),
    experience: formData.get("experience"),
    description: formData.get("description"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { ok: false, message: "Please check the form." };

  await db.jobOpening.update({
    where: { id: jobId },
    data: { ...parsed.data, active: parsed.data.active ?? true },
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/careers");
  return { ok: true, message: "Job opening updated." };
}

export async function deleteJobOpening(jobId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);
  await db.jobOpening.delete({ where: { id: jobId } });
  revalidatePath("/admin/jobs");
  revalidatePath("/careers");
}
