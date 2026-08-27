"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import type { AdminFormState } from "@/lib/actions/admin-courses";

const schema = z.object({
  title: z.string().trim().min(2),
  body: z.string().trim().min(2),
  audience: z.enum(["WEBSITE", "PORTAL", "BOTH"]),
  startAt: z.string().min(1),
  endAt: z.string().optional(),
});

export async function createAnnouncement(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = schema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    audience: formData.get("audience") ?? "BOTH",
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;

  await db.announcement.create({
    data: {
      title: d.title,
      body: d.body,
      audience: d.audience,
      startAt: new Date(d.startAt),
      endAt: d.endAt ? new Date(d.endAt) : null,
      active: true,
    },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  return { ok: true, message: "Announcement published." };
}

export async function toggleAnnouncementActive(id: string, active: boolean) {
  await verifyAdminSession();
  await db.announcement.update({ where: { id }, data: { active } });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function deleteAnnouncement(id: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);
  await db.announcement.delete({ where: { id } });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}
