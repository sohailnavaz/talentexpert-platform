import { db } from "@/lib/db";

export async function getTrainerBatches(trainerId: string) {
  return db.batch.findMany({
    where: { trainerId },
    include: {
      course: { select: { title: true, slug: true } },
      _count: { select: { enrollments: { where: { status: "PAID" } } } },
    },
    orderBy: { startDate: "desc" },
  });
}

export async function getNextSessionForTrainer(trainerId: string) {
  const now = new Date();
  return db.classSession.findFirst({
    where: { batch: { trainerId }, date: { gte: now } },
    orderBy: { date: "asc" },
    include: { batch: { include: { course: { select: { title: true } } } } },
  });
}

export async function getBatchForTrainer(trainerId: string, batchId: string) {
  return db.batch.findFirst({
    where: { id: batchId, trainerId },
    include: {
      course: { select: { title: true, slug: true } },
      sessions: { orderBy: { date: "desc" } },
      materials: { orderBy: { createdAt: "desc" } },
      announcements: { orderBy: { createdAt: "desc" } },
      enrollments: {
        where: { status: "PAID" },
        select: { id: true, enrollmentCode: true, student: { select: { name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getAttendanceForBatch(batchId: string) {
  return db.attendance.findMany({ where: { classSession: { batchId } } });
}
