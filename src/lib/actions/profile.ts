"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getStudentSession } from "@/lib/auth/session";
import { saveUploadedFile } from "@/lib/storage";
import type { AuthFormState } from "@/lib/actions/auth";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadAvatar(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const session = await getStudentSession();
  if (!session) return { ok: false, message: "Your session has expired. Please sign in again." };

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a photo to upload." };
  }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { ok: false, message: "Please upload a JPEG, PNG, or WebP image." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, message: "Photo must be under 5MB." };
  }

  const avatarUrl = await saveUploadedFile(file);
  await db.student.update({ where: { id: session.studentId }, data: { avatarUrl } });

  revalidatePath("/portal/profile");
  revalidatePath("/portal");
  return { ok: true, message: "Photo updated." };
}

export async function removeAvatar(): Promise<void> {
  const session = await getStudentSession();
  if (!session) return;
  await db.student.update({ where: { id: session.studentId }, data: { avatarUrl: null } });
  revalidatePath("/portal/profile");
  revalidatePath("/portal");
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  phone: z.string().trim().min(8, "Enter a valid phone number"),
  whatsapp: z.string().trim().optional(),
  age: z.coerce.number().int().min(10, "Enter a valid age").max(100, "Enter a valid age").optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
});

export async function updateProfile(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const session = await getStudentSession();
  if (!session) return { ok: false, message: "Your session has expired. Please sign in again." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp") || undefined,
    age: formData.get("age") || undefined,
    gender: formData.get("gender") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  await db.student.update({
    where: { id: session.studentId },
    data: parsed.data,
  });

  revalidatePath("/portal/profile");
  return { ok: true, message: "Profile updated." };
}

const bioSchema = z.object({
  bio: z.string().trim().max(280).optional(),
});

export async function updateBio(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const session = await getStudentSession();
  if (!session) return { ok: false, message: "Your session has expired. Please sign in again." };

  const parsed = bioSchema.safeParse({
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your bio." };
  }

  await db.student.update({
    where: { id: session.studentId },
    data: { bio: parsed.data.bio ?? null },
  });

  revalidatePath("/portal/profile");
  return { ok: true, message: "Bio updated." };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
  });

export async function changePassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const session = await getStudentSession();
  if (!session) return { ok: false, message: "Your session has expired. Please sign in again." };

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const student = await db.student.findUnique({ where: { id: session.studentId } });
  if (!student) return { ok: false, message: "Account not found." };

  const valid = await verifyPassword(parsed.data.currentPassword, student.passwordHash);
  if (!valid) return { ok: false, message: "Current password is incorrect." };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db.student.update({
    where: { id: student.id },
    data: { passwordHash, mustChangePassword: false },
  });

  return { ok: true, message: "Password updated." };
}
