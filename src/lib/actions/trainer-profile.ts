"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getTrainerSession } from "@/lib/auth/session";
import { saveUploadedFile } from "@/lib/storage";
import type { AuthFormState } from "@/lib/actions/auth";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  phone: z.string().trim().optional(),
  bio: z.string().trim().max(500).optional(),
});

export async function updateTrainerProfile(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const session = await getTrainerSession();
  if (!session) return { ok: false, message: "Your session has expired. Please sign in again." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  await db.trainer.update({
    where: { id: session.trainerId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      bio: parsed.data.bio ?? null,
    },
  });

  revalidatePath("/trainer/profile");
  revalidatePath("/trainer");
  return { ok: true, message: "Profile updated." };
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadTrainerPhoto(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const session = await getTrainerSession();
  if (!session) return { ok: false, message: "Your session has expired. Please sign in again." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a photo to upload." };
  }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { ok: false, message: "Please upload a JPEG, PNG, or WebP image." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, message: "Photo must be under 5MB." };
  }

  const photoUrl = await saveUploadedFile(file);
  await db.trainer.update({ where: { id: session.trainerId }, data: { photoUrl } });

  revalidatePath("/trainer/profile");
  revalidatePath("/trainer");
  return { ok: true, message: "Photo updated." };
}

export async function clearTrainerPhoto(): Promise<void> {
  const session = await getTrainerSession();
  if (!session) return;
  await db.trainer.update({ where: { id: session.trainerId }, data: { photoUrl: null } });
  revalidatePath("/trainer/profile");
  revalidatePath("/trainer");
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function changeTrainerPassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const session = await getTrainerSession();
  if (!session) return { ok: false, message: "Your session has expired. Please sign in again." };

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const trainer = await db.trainer.findUnique({ where: { id: session.trainerId } });
  if (!trainer || !trainer.passwordHash) return { ok: false, message: "Account not found." };

  const valid = await verifyPassword(parsed.data.currentPassword, trainer.passwordHash);
  if (!valid) return { ok: false, message: "Current password is incorrect." };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db.trainer.update({
    where: { id: trainer.id },
    data: { passwordHash, mustChangePassword: false },
  });

  return { ok: true, message: "Password updated." };
}
