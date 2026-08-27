import { getActiveAnnouncements } from "@/lib/data/announcements";
import { AnnouncementBarClient } from "./announcement-bar-client";

export async function AnnouncementBar() {
  const [announcement] = await getActiveAnnouncements("WEBSITE", { take: 1 });

  if (!announcement) return null;

  return <AnnouncementBarClient id={announcement.id} title={announcement.title} body={announcement.body} />;
}
