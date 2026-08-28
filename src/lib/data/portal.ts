import { db } from "@/lib/db";
import { getActiveAnnouncements } from "@/lib/data/announcements";

export async function getStudentEnrollments(studentId: string) {
  return db.enrollment.findMany({
    where: { studentId, OR: [{ status: "PAID" }, { isTrial: true }] },
    include: {
      batch: { include: { course: true, trainer: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEnrollmentForStudent(studentId: string, enrollmentId: string) {
  return db.enrollment.findFirst({
    where: { id: enrollmentId, studentId, OR: [{ status: "PAID" }, { isTrial: true }] },
    include: {
      batch: {
        include: {
          course: { include: { modules: { orderBy: { order: "asc" }, include: { topics: { orderBy: { order: "asc" } } } } } },
          trainer: true,
          sessions: { orderBy: { date: "asc" } },
          materials: { orderBy: { createdAt: "desc" } },
          offers: true,
        },
      },
      testAttempts: { orderBy: { completedAt: "desc" } },
      attendances: true,
    },
  });
}

export async function getNextSessionForStudent(studentId: string) {
  const now = new Date();
  const enrollments = await db.enrollment.findMany({
    where: { studentId, status: "PAID" },
    select: { batchId: true },
  });
  const batchIds = enrollments.map((e) => e.batchId);
  if (batchIds.length === 0) return null;

  return db.classSession.findFirst({
    where: { batchId: { in: batchIds }, date: { gte: now } },
    orderBy: { date: "asc" },
    include: { batch: { include: { course: true } } },
  });
}

export async function getStudentBatchIds(studentId: string): Promise<string[]> {
  const enrollments = await db.enrollment.findMany({
    where: { studentId, OR: [{ status: "PAID" }, { isTrial: true }] },
    select: { batchId: true },
  });
  return enrollments.map((e) => e.batchId);
}

export async function getPortalAnnouncements(
  studentId: string,
  opts: { popupOnly?: boolean; take?: number } = {}
) {
  const batchIds = await getStudentBatchIds(studentId);
  return getActiveAnnouncements("PORTAL", { take: 5, ...opts, batchIds });
}

export async function getStudentPayments(studentId: string) {
  return db.payment.findMany({
    where: { studentId },
    include: { enrollment: { include: { batch: { include: { course: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPaymentForStudent(studentId: string, paymentId: string) {
  return db.payment.findFirst({
    where: { id: paymentId, studentId },
    include: { student: true, enrollment: { include: { batch: { include: { course: true } } } } },
  });
}
