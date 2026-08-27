import type { Metadata } from "next";
import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { AnnouncementRowActions } from "@/components/admin/announcement-row-actions";

export const metadata: Metadata = { title: "Announcements" };

const audienceLabels: Record<string, string> = { WEBSITE: "Website", PORTAL: "Portal", BOTH: "Both" };

export default async function AdminAnnouncementsPage() {
  const announcements = await db.announcement.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Announcements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish a notice to the website banner, the student portal, or both.
        </p>
      </div>

      <AnnouncementForm />

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Window</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <p className="font-medium">{a.title}</p>
                  <p className="max-w-sm truncate text-xs text-muted-foreground">{a.body}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{audienceLabels[a.audience]}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(a.startAt)} {a.endAt ? `– ${formatDate(a.endAt)}` : "(no end date)"}
                </TableCell>
                <TableCell className="text-right">
                  <AnnouncementRowActions id={a.id} active={a.active} />
                </TableCell>
              </TableRow>
            ))}
            {announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No announcements yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
