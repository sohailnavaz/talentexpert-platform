import { db } from "@/lib/db";

export async function getActiveAnnouncements(
  audience: "WEBSITE" | "PORTAL",
  opts: { popupOnly?: boolean; take?: number; batchIds?: string[] } = {}
) {
  const now = new Date();
  return db.announcement.findMany({
    where: {
      active: true,
      audience: { in: [audience, "BOTH"] },
      startAt: { lte: now },
      AND: [
        { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        { OR: [{ batchId: null }, { batchId: { in: opts.batchIds ?? [] } }] },
      ],
      ...(opts.popupOnly ? { showPopup: true } : {}),
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: opts.take ?? 5,
  });
}
