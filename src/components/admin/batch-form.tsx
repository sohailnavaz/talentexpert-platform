"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { modeLabels } from "@/lib/format";
import type { AdminFormState } from "@/lib/actions/admin-courses";
import type { Batch, Trainer } from "@/generated/prisma";

type CourseOption = { id: string; title: string };

const MODES = Object.keys(modeLabels);

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

function toDateInputValue(d?: Date) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function BatchForm({
  action,
  courses,
  trainers,
  batch,
  submitLabel = "Save batch",
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  courses: CourseOption[];
  trainers: Trainer[];
  batch?: Omit<Batch, "fee"> & { fee: number };
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, { ok: true });

  useEffect(() => {
    if (state.message) {
      state.ok ? toast.success(state.message) : toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="courseId">Course</Label>
        <Select
          name="courseId"
          defaultValue={batch?.courseId}
          items={Object.fromEntries(courses.map((c) => [c.id, c.title]))}
          required
        >
          <SelectTrigger id="courseId" className="w-full">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Start date</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={toDateInputValue(batch?.startDate)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="startTime">Timing</Label>
          <Input id="startTime" name="startTime" defaultValue={batch?.startTime} placeholder="7:00 PM - 9:00 PM IST" required />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="mode">Mode</Label>
          <Select
            name="mode"
            defaultValue={batch?.mode ?? "ONLINE"}
            items={Object.fromEntries(MODES.map((m) => [m, modeLabels[m]]))}
            required
          >
            <SelectTrigger id="mode" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODES.map((m) => (
                <SelectItem key={m} value={m}>
                  {modeLabels[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="trainerId">Trainer</Label>
          <Select
            name="trainerId"
            defaultValue={batch?.trainerId ?? undefined}
            items={Object.fromEntries(trainers.map((t) => [t.id, t.name]))}
          >
            <SelectTrigger id="trainerId" className="w-full">
              <SelectValue placeholder="Select a trainer" />
            </SelectTrigger>
            <SelectContent>
              {trainers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="durationText">Duration</Label>
          <Input id="durationText" name="durationText" defaultValue={batch?.durationText ?? ""} placeholder="12 weeks" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seatTotal">Total seats</Label>
          <Input id="seatTotal" name="seatTotal" type="number" min={1} defaultValue={batch?.seatTotal ?? 30} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fee">Fee (₹)</Label>
          <Input id="fee" name="fee" type="number" min={0} defaultValue={batch?.fee} required />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contactNumber">Contact number</Label>
          <Input id="contactNumber" name="contactNumber" defaultValue={batch?.contactNumber ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            defaultValue={batch?.status ?? "UPCOMING"}
            items={{ UPCOMING: "Upcoming", ONGOING: "Ongoing", COMPLETED: "Completed" }}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
