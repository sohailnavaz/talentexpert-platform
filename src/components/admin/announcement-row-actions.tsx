"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { AnnouncementEditDialog } from "@/components/admin/announcement-edit-dialog";
import {
  deleteAnnouncement,
  sendAnnouncementEmail,
  toggleAnnouncementActive,
} from "@/lib/actions/admin-announcements";
import type { Announcement } from "@/generated/prisma";

export function AnnouncementRowActions({
  announcement,
  id,
  active,
  audience,
}: {
  announcement: Announcement;
  id: string;
  active: boolean;
  audience: "WEBSITE" | "PORTAL" | "BOTH";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-3">
      {audience !== "WEBSITE" ? (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          title="Email this announcement to all active students"
          onClick={() =>
            startTransition(async () => {
              const count = await sendAnnouncementEmail(id);
              toast.success(`Emailed ${count} student${count === 1 ? "" : "s"}.`);
            })
          }
        >
          <Mail className="h-3.5 w-3.5" /> Email students
        </Button>
      ) : null}
      <AnnouncementEditDialog announcement={announcement} />
      <Switch
        checked={active}
        disabled={pending}
        onCheckedChange={(checked) =>
          startTransition(async () => {
            await toggleAnnouncementActive(id, checked);
            router.refresh();
          })
        }
      />
      <ConfirmDeleteButton action={deleteAnnouncement.bind(null, id)} description="Delete this announcement?" />
    </div>
  );
}
