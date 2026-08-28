"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyAdminSession } from "@/lib/auth/dal";

export async function setEnrollmentCompletionAsAdmin(enrollmentId: string, completed: boolean) {
  await verifyAdminSession();
  await db.enrollment.update({
    where: { id: enrollmentId },
    data: { completedAt: completed ? new Date() : null },
  });
  revalidatePath("/admin/enrolments");
  revalidatePath("/portal");
}
