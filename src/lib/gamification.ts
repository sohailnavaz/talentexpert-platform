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

function progressForCriteria(criteria: BadgeCriteria, stats: StudentStats) {
  const threshold = criteria.threshold;
  switch (criteria.type) {
    case "enrollmentsCount":
      return { current: stats.coursesEnrolled, threshold };
    case "coursesCompleted":
      return { current: stats.coursesCompleted, threshold };
    case "hoursLogged":
      return { current: stats.hoursLogged, threshold };
    case "testsPassed":
      return { current: stats.testsPassed, threshold };
    default:
      return { current: 0, threshold };
  }
}

function meetsCriteria(criteria: BadgeCriteria, stats: StudentStats) {
  const { current, threshold } = progressForCriteria(criteria, stats);
  return current >= threshold;
}

export type Level = { name: string; minPoints: number };

export const LEVELS: Level[] = [
  { name: "Newcomer", minPoints: 0 },
  { name: "Rising Star", minPoints: 20 },
  { name: "Achiever", minPoints: 60 },
  { name: "Expert", minPoints: 100 },
  { name: "Legend", minPoints: 150 },
];

export function getLevelProgress(totalPoints: number) {
  let level = LEVELS[0];
  let nextLevel: Level | null = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalPoints >= LEVELS[i].minPoints) {
      level = LEVELS[i];
      nextLevel = LEVELS[i + 1] ?? null;
    }
  }
  const pointsToNext = nextLevel ? nextLevel.minPoints - totalPoints : 0;
  return { level, nextLevel, pointsToNext };
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

export async function getStudentBadgeBoard(studentId: string, stats: StudentStats) {
  const [allBadges, earned] = await Promise.all([
    db.badge.findMany({ orderBy: { createdAt: "asc" } }),
    db.studentBadge.findMany({ where: { studentId } }),
  ]);
  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));

  return allBadges.map((b) => {
    const { current, threshold } = progressForCriteria(b.criteria as unknown as BadgeCriteria, stats);
    return {
      ...b,
      earned: earnedMap.has(b.id),
      earnedAt: earnedMap.get(b.id) ?? null,
      current,
      threshold,
    };
  });
}
