import { db } from "@/lib/db";

export async function getActiveAnnouncements(
  audience: "WEBSITE" | "PORTAL",
  opts: { popupOnly?: boolean; take?: number } = {}
) {
  const now = new Date();
  return db.announcement.findMany({
    where: {
      active: true,
      audience: { in: [audience, "BOTH"] },
      startAt: { lte: now },
      OR: [{ endAt: null }, { endAt: { gte: now } }],
      ...(opts.popupOnly ? { showPopup: true } : {}),
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: opts.take ?? 5,
  });
}
