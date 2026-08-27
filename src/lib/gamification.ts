import "server-only";
import { db } from "@/lib/db";

export type StudentStats = {
  coursesEnrolled: number;
  coursesCompleted: number;
  hoursLogged: number;
  testsCompleted: number;
  testsPassed: number;
};

export async function getStudentStats(studentId: string): Promise<StudentStats> {
  const enrollments = await db.enrollment.findMany({
    where: { studentId, status: "PAID" },
    include: { testAttempts: true },
  });

  const hoursLogged = enrollments.reduce((sum, e) => sum + Number(e.hoursLogged), 0);
  const coursesCompleted = enrollments.filter((e) => e.completedAt).length;
  const testAttempts = enrollments.flatMap((e) => e.testAttempts);

  return {
    coursesEnrolled: enrollments.length,
    coursesCompleted,
    hoursLogged,
    testsCompleted: testAttempts.length,
    testsPassed: testAttempts.filter((t) => t.scorePercent >= 60).length,
  };
}

type BadgeCriteria =
  | { type: "enrollmentsCount"; threshold: number }
  | { type: "coursesCompleted"; threshold: number }
  | { type: "hoursLogged"; threshold: number }
  | { type: "testsPassed"; threshold: number };

function meetsCriteria(criteria: BadgeCriteria, stats: StudentStats) {
  switch (criteria.type) {
    case "enrollmentsCount":
      return stats.coursesEnrolled >= criteria.threshold;
    case "coursesCompleted":
      return stats.coursesCompleted >= criteria.threshold;
    case "hoursLogged":
      return stats.hoursLogged >= criteria.threshold;
    case "testsPassed":
      return stats.testsPassed >= criteria.threshold;
    default:
      return false;
  }
}

export async function evaluateAndAwardBadges(studentId: string) {
  const [stats, allBadges, earned] = await Promise.all([
    getStudentStats(studentId),
    db.badge.findMany(),
    db.studentBadge.findMany({ where: { studentId }, select: { badgeId: true } }),
  ]);

  const earnedIds = new Set(earned.map((e) => e.badgeId));
  const toAward = allBadges.filter(
    (b) => !earnedIds.has(b.id) && meetsCriteria(b.criteria as unknown as BadgeCriteria, stats)
  );

  if (toAward.length > 0) {
    await db.studentBadge.createMany({
      data: toAward.map((b) => ({ studentId, badgeId: b.id })),
      skipDuplicates: true,
    });
  }

  return { stats, newlyAwarded: toAward };
}

export async function getStudentBadgeBoard(studentId: string) {
  const [allBadges, earned] = await Promise.all([
    db.badge.findMany({ orderBy: { createdAt: "asc" } }),
    db.studentBadge.findMany({ where: { studentId } }),
  ]);
  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));

  return allBadges.map((b) => ({
    ...b,
    earned: earnedMap.has(b.id),
    earnedAt: earnedMap.get(b.id) ?? null,
  }));
}
