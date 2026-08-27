"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { saveUploadedFile } from "@/lib/storage";
import type { AdminFormState } from "@/lib/actions/admin-courses";

const schema = z.object({
  name: z.string().trim().min(2),
  bio: z.string().trim().optional(),
  experienceYears: z.coerce.number().int().min(0).optional(),
  expertise: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

function linesToArray(input: string | undefined) {
  return (input ?? "")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
}

async function resolvePhoto(formData: FormData, existing?: string | null) {
  const file = formData.get("photoFile");
  if (file instanceof File && file.size > 0) return saveUploadedFile(file);
  const url = formData.get("photoUrl");
  if (typeof url === "string" && url.trim()) return url.trim();
  return existing ?? undefined;
}

export async function createTrainer(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = schema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
    experienceYears: formData.get("experienceYears") || undefined,
    expertise: formData.get("expertise") || undefined,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { ok: false, message: "Please check the form." };

  const photoUrl = await resolvePhoto(formData);
  const d = parsed.data;
  const baseSlug = slugify(d.name);
  let slug = baseSlug;
  let attempt = 1;
  while (await db.trainer.findUnique({ where: { slug } })) slug = `${baseSlug}-${attempt++}`;

  const trainer = await db.trainer.create({
    data: {
      name: d.name,
      slug,
      bio: d.bio,
      experienceYears: d.experienceYears,
      expertise: linesToArray(d.expertise),
      active: d.active ?? true,
      photoUrl,
    },
  });

  revalidatePath("/admin/trainers");
  revalidatePath("/trainers");
  redirect(`/admin/trainers/${trainer.id}/edit`);
}

export async function updateTrainer(
  trainerId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR", "EDITOR"]);

  const parsed = schema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
    experienceYears: formData.get("experienceYears") || undefined,
    expertise: formData.get("expertise") || undefined,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { ok: false, message: "Please check the form." };

  const existing = await db.trainer.findUnique({ where: { id: trainerId } });
  if (!existing) return { ok: false, message: "Trainer not found." };

  const photoUrl = await resolvePhoto(formData, existing.photoUrl);
  const d = parsed.data;

  await db.trainer.update({
    where: { id: trainerId },
    data: {
      name: d.name,
      bio: d.bio,
      experienceYears: d.experienceYears,
      expertise: linesToArray(d.expertise),
      active: d.active ?? true,
      photoUrl,
    },
  });

  revalidatePath("/admin/trainers");
  revalidatePath(`/trainers/${existing.slug}`);
  revalidatePath("/trainers");
  return { ok: true, message: "Trainer updated." };
}

export async function deleteTrainer(trainerId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);
  await db.trainer.delete({ where: { id: trainerId } });
  revalidatePath("/admin/trainers");
  revalidatePath("/trainers");
}
