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

export async function getSessionParticipants(classSessionId: string) {
  const rows = await db.sessionParticipant.findMany({
    where: { classSessionId },
    include: {
      student: { select: { name: true } },
      trainer: { select: { name: true } },
    },
    orderBy: { joinedAt: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.student?.name ?? r.trainer?.name ?? "Unknown",
    role: r.studentId ? ("STUDENT" as const) : ("TRAINER" as const),
    joinedAt: r.joinedAt,
    leftAt: r.leftAt,
    durationSecs: r.durationSecs,
    isLive: r.leftAt === null,
  }));
}

export async function getTrainerDashboardStats(trainerId: string) {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [totalStudents, sessionsThisWeek, recentMessages] = await Promise.all([
    db.enrollment.count({ where: { status: "PAID", batch: { trainerId } } }),
    db.classSession.count({ where: { batch: { trainerId }, date: { gte: now, lte: weekFromNow } } }),
    db.directMessage.findMany({
      where: { trainerId, senderRole: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { student: { select: { name: true } } },
    }),
  ]);

  return { totalStudents, sessionsThisWeek, recentMessages };
}
