"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAnnouncement } from "@/lib/actions/admin-announcements";
import type { Announcement } from "@/generated/prisma";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function AnnouncementEditDialog({ announcement }: { announcement: Announcement }) {
  const [open, setOpen] = useState(false);
  const action = updateAnnouncement.bind(null, announcement.id);
  const [state, formAction] = useActionState(action, { ok: true });

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        toast.success(state.message);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- closing the dialog is a direct consequence of the server action's result, not derivable during render.
        setOpen(false);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Edit announcement" />}>
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit announcement</DialogTitle>
          <DialogDescription>Update where and how this announcement appears.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" name="title" defaultValue={announcement.title} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-body">Message</Label>
            <Textarea id="edit-body" name="body" rows={2} defaultValue={announcement.body} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-audience">Show on</Label>
              <Select
                name="audience"
                defaultValue={announcement.audience}
                items={{ WEBSITE: "Website", PORTAL: "Student portal", BOTH: "Both" }}
              >
                <SelectTrigger id="edit-audience" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEBSITE">Website</SelectItem>
                  <SelectItem value="PORTAL">Student portal</SelectItem>
                  <SelectItem value="BOTH">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-startAt">Starts</Label>
              <Input
                id="edit-startAt"
                name="startAt"
                type="date"
                defaultValue={announcement.startAt.toISOString().slice(0, 10)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-endAt">Ends (optional)</Label>
              <Input
                id="edit-endAt"
                name="endAt"
                type="date"
                defaultValue={announcement.endAt ? announcement.endAt.toISOString().slice(0, 10) : ""}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-priority">Priority (0–10, higher shows first)</Label>
            <Input
              id="edit-priority"
              name="priority"
              type="number"
              min={0}
              max={10}
              defaultValue={announcement.priority}
              className="max-w-[8rem]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="edit-showPopup" name="showPopup" defaultChecked={announcement.showPopup} />
            <Label htmlFor="edit-showPopup" className="font-normal">
              Show as a popup alert (not just the banner)
            </Label>
          </div>
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
