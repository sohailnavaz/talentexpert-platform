import { db } from "@/lib/db";

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

export async function getPortalAnnouncements() {
  const now = new Date();
  return db.announcement.findMany({
    where: {
      active: true,
      audience: { in: ["PORTAL", "BOTH"] },
      startAt: { lte: now },
      OR: [{ endAt: null }, { endAt: { gte: now } }],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

export async function getStudentPayments(studentId: string) {
  return db.payment.findMany({
    where: { studentId },
    include: { enrollment: { include: { batch: { include: { course: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}
