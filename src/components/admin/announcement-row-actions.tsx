"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { deleteAnnouncement, toggleAnnouncementActive } from "@/lib/actions/admin-announcements";

export function AnnouncementRowActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-3">
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
