"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getStudentSession } from "@/lib/auth/session";
import type { AuthFormState } from "@/lib/actions/auth";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  phone: z.string().trim().min(8, "Enter a valid phone number"),
  whatsapp: z.string().trim().optional(),
  bio: z.string().trim().max(280).optional(),
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
    bio: formData.get("bio") || undefined,
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
