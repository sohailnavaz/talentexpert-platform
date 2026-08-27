"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { saveUploadedFile } from "@/lib/storage";
import { hashPassword, generateTempPassword } from "@/lib/auth/password";
import { sendEmail } from "@/lib/email";
import { logActivity } from "@/lib/audit";
import type { AdminFormState } from "@/lib/actions/admin-courses";

const schema = z.object({
  name: z.string().trim().min(2),
  bio: z.string().trim().optional(),
  experienceYears: z.coerce.number().int().min(0).optional(),
  expertise: z.string().optional(),
  active: z.coerce.boolean().optional(),
  email: z.email().optional().or(z.literal("")),
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
    email: formData.get("email") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Please check the form." };

  const d = parsed.data;

  if (d.email) {
    const existingByEmail = await db.trainer.findUnique({ where: { email: d.email } });
    if (existingByEmail) return { ok: false, message: "Another trainer already uses this email." };
  }

  const photoUrl = await resolvePhoto(formData);
  const baseSlug = slugify(d.name);
  let slug = baseSlug;
  let attempt = 1;
  while (await db.trainer.findUnique({ where: { slug } })) slug = `${baseSlug}-${attempt++}`;

  let tempPassword: string | null = null;
  let passwordHash: string | null = null;
  if (d.email) {
    tempPassword = generateTempPassword();
    passwordHash = await hashPassword(tempPassword);
  }

  const trainer = await db.trainer.create({
    data: {
      name: d.name,
      slug,
      bio: d.bio,
      experienceYears: d.experienceYears,
      expertise: linesToArray(d.expertise),
      active: d.active ?? true,
      photoUrl,
      email: d.email || null,
      passwordHash,
    },
  });

  if (d.email && tempPassword) {
    await sendEmail({
      to: d.email,
      subject: "Your Talent Expert trainer portal access",
      html: `<p>Hi ${d.name},</p><p>You've been given access to the trainer portal.</p><p>Sign in at <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/trainer/login">/trainer/login</a> with:</p><p>Email: ${d.email}<br/>Temporary password: <strong>${tempPassword}</strong></p>`,
    });
  }
  await logActivity(session.adminId, "trainer.create", "Trainer", trainer.id, { name: trainer.name });

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
    email: formData.get("email") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Please check the form." };

  const existing = await db.trainer.findUnique({ where: { id: trainerId } });
  if (!existing) return { ok: false, message: "Trainer not found." };

  const d = parsed.data;

  if (d.email && d.email !== existing.email) {
    const existingByEmail = await db.trainer.findUnique({ where: { email: d.email } });
    if (existingByEmail) return { ok: false, message: "Another trainer already uses this email." };
  }

  const photoUrl = await resolvePhoto(formData, existing.photoUrl);

  let tempPassword: string | null = null;
  let passwordHash: string | null | undefined = undefined;
  const grantingAccess = !!d.email && !existing.email;
  if (grantingAccess) {
    tempPassword = generateTempPassword();
    passwordHash = await hashPassword(tempPassword);
  } else if (!d.email && existing.email) {
    passwordHash = null;
  }

  await db.trainer.update({
    where: { id: trainerId },
    data: {
      name: d.name,
      bio: d.bio,
      experienceYears: d.experienceYears,
      expertise: linesToArray(d.expertise),
      active: d.active ?? true,
      photoUrl,
      email: d.email || null,
      ...(passwordHash !== undefined ? { passwordHash } : {}),
    },
  });

  if (grantingAccess && tempPassword && d.email) {
    await sendEmail({
      to: d.email,
      subject: "Your Talent Expert trainer portal access",
      html: `<p>Hi ${d.name},</p><p>You've been given access to the trainer portal.</p><p>Sign in at <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/trainer/login">/trainer/login</a> with:</p><p>Email: ${d.email}<br/>Temporary password: <strong>${tempPassword}</strong></p>`,
    });
    await logActivity(session.adminId, "trainer.grant_portal_access", "Trainer", trainerId, { email: d.email });
  } else if (passwordHash === null) {
    await logActivity(session.adminId, "trainer.revoke_portal_access", "Trainer", trainerId);
  }

  revalidatePath("/admin/trainers");
  revalidatePath(`/trainers/${existing.slug}`);
  revalidatePath("/trainers");
  return { ok: true, message: grantingAccess ? "Trainer updated and portal access granted." : "Trainer updated." };
}

export async function resetTrainerPassword(trainerId: string): Promise<{ tempPassword: string } | null> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);

  const trainer = await db.trainer.findUnique({ where: { id: trainerId } });
  if (!trainer || !trainer.email) return null;

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  await db.trainer.update({ where: { id: trainerId }, data: { passwordHash, mustChangePassword: true } });

  await sendEmail({
    to: trainer.email,
    subject: "Your Talent Expert trainer portal password has been reset",
    html: `<p>Hi ${trainer.name},</p><p>Your temporary password is: <strong>${tempPassword}</strong></p><p>Sign in and set a new password.</p>`,
  });
  await logActivity(session.adminId, "trainer.reset_password", "Trainer", trainerId);

  revalidatePath("/admin/trainers");
  return { tempPassword };
}

export async function deleteTrainer(trainerId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);
  await db.trainer.delete({ where: { id: trainerId } });
  await logActivity(session.adminId, "trainer.delete", "Trainer", trainerId);
  revalidatePath("/admin/trainers");
  revalidatePath("/trainers");
}
