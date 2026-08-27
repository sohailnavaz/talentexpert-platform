"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
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
import { createAnnouncement } from "@/lib/actions/admin-announcements";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Publishing..." : "Publish announcement"}
    </Button>
  );
}

export function AnnouncementForm() {
  const [state, formAction] = useActionState(createAnnouncement, { ok: true });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        toast.success(state.message);
        formRef.current?.reset();
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="max-w-xl space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="New batches open" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="body">Message</Label>
        <Textarea id="body" name="body" rows={2} placeholder="Early-bird pricing live on select courses" required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="audience">Show on</Label>
          <Select name="audience" defaultValue="BOTH" items={{ WEBSITE: "Website", PORTAL: "Student portal", BOTH: "Both" }}>
            <SelectTrigger id="audience" className="w-full">
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
          <Label htmlFor="startAt">Starts</Label>
          <Input id="startAt" name="startAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endAt">Ends (optional)</Label>
          <Input id="endAt" name="endAt" type="date" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="priority">Priority (0–10, higher shows first)</Label>
        <Input id="priority" name="priority" type="number" min={0} max={10} defaultValue={0} className="max-w-[8rem]" />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="showPopup" name="showPopup" />
        <Label htmlFor="showPopup" className="font-normal">
          Show as a popup alert (not just the banner)
        </Label>
      </div>
      <SubmitButton />
    </form>
  );
}
