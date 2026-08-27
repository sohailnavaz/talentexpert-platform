import { db } from "@/lib/db";
import { AnnouncementBarClient } from "./announcement-bar-client";

export async function AnnouncementBar() {
  const now = new Date();
  const announcement = await db.announcement.findFirst({
    where: {
      active: true,
      audience: { in: ["WEBSITE", "BOTH"] },
      startAt: { lte: now },
      OR: [{ endAt: null }, { endAt: { gte: now } }],
    },
    orderBy: { createdAt: "desc" },
  });

  if (!announcement) return null;

  return <AnnouncementBarClient id={announcement.id} title={announcement.title} body={announcement.body} />;
}
