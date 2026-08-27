"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { verifyAdminSession } from "@/lib/auth/dal";

async function notifySessionStudents(sessionId: string) {
  const session = await db.classSession.findUnique({
    where: { id: sessionId },
    include: {
      batch: {
        include: {
          course: { select: { title: true } },
          enrollments: {
            where: { status: "PAID", isTrial: false },
            select: { student: { select: { name: true, email: true } } },
          },
        },
      },
    },
  });
  if (!session) return 0;

  for (const e of session.batch.enrollments) {
    await sendEmail({
      to: e.student.email,
      subject: `Reminder: ${session.topic} starts soon`,
      html: `<p>Hi ${e.student.name},</p><p>Your class <strong>${session.topic}</strong> for <strong>${session.batch.course.title}</strong> is coming up on ${session.date.toDateString()} at ${session.time}.</p><p><a href="${session.joinUrl}">Join the class</a></p>`,
    });
  }

  await db.classSession.update({ where: { id: sessionId }, data: { reminderSentAt: new Date() } });
  return session.batch.enrollments.length;
}

export async function sendSessionRemindersDue(): Promise<{ sessionsNotified: number; emailsSent: number }> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dueSessions = await db.classSession.findMany({
    where: { date: { gte: now, lte: windowEnd }, reminderSentAt: null },
    select: { id: true },
  });

  let emailsSent = 0;
  for (const s of dueSessions) {
    emailsSent += await notifySessionStudents(s.id);
  }
  return { sessionsNotified: dueSessions.length, emailsSent };
}

export async function sendSessionReminderNow(sessionId: string, batchId: string): Promise<number> {
  await verifyAdminSession();
  const count = await notifySessionStudents(sessionId);
  revalidatePath(`/admin/batches/${batchId}/edit`);
  return count;
}
