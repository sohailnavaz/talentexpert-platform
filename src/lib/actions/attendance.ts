"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getTrainerSession } from "@/lib/auth/session";

export async function saveAttendance(classSessionId: string, revalidateTo: string, formData: FormData) {
  const session = await getTrainerSession();
  if (!session) return;

  const classSession = await db.classSession.findFirst({
    where: { id: classSessionId, batch: { trainerId: session.trainerId } },
    select: { batchId: true },
  });
  if (!classSession) return;

  const enrollments = await db.enrollment.findMany({
    where: { batchId: classSession.batchId, status: "PAID" },
    select: { id: true },
  });

  await Promise.all(
    enrollments.map((e) =>
      db.attendance.upsert({
        where: { classSessionId_enrollmentId: { classSessionId, enrollmentId: e.id } },
        create: { classSessionId, enrollmentId: e.id, present: formData.get(`present_${e.id}`) === "on" },
        update: { present: formData.get(`present_${e.id}`) === "on" },
      })
    )
  );

  revalidatePath(revalidateTo);
}
